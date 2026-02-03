const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// ============================================================
// CONFIGURATION
// Set these via: firebase functions:config:set stripe.secret_key="sk_..." stripe.webhook_secret="whsec_..." stripe.price_id="price_..."
// Or use environment variables in Firebase Functions v2
// ============================================================
const STRIPE_SECRET_KEY = functions.config().stripe?.secret_key || process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = functions.config().stripe?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PRICE_ID = functions.config().stripe?.price_id || process.env.STRIPE_PRICE_ID;

const stripe = require("stripe")(STRIPE_SECRET_KEY);

// Helper: verify Firebase ID token from Authorization header
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const idToken = authHeader.split("Bearer ")[1];
  return admin.auth().verifyIdToken(idToken);
}

// ============================================================
// 1. CREATE STRIPE CHECKOUT SESSION
// Called from the client when user clicks "Subscribe"
// ============================================================
exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const decodedToken = await verifyAuth(req);
      const uid = decodedToken.uid;
      const email = decodedToken.email;
      const returnUrl = req.body.returnUrl || "https://dimtools.net/subscribe.html";

      // Check if user already has a Stripe customer ID
      const userSnap = await admin.database().ref("users/" + uid + "/stripeCustomerId").once("value");
      let customerId = userSnap.val();

      if (!customerId) {
        // Create a new Stripe customer
        const customer = await stripe.customers.create({
          email: email,
          metadata: { firebaseUID: uid },
        });
        customerId = customer.id;
        await admin.database().ref("users/" + uid + "/stripeCustomerId").set(customerId);
      }

      // Create Checkout Session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: returnUrl + "?success=true",
        cancel_url: returnUrl + "?canceled=true",
        metadata: { firebaseUID: uid },
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("createCheckoutSession error:", err);
      if (err.message === "Unauthorized") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

// ============================================================
// 2. CREATE STRIPE CUSTOMER PORTAL SESSION
// Called when subscribed user clicks "Manage Subscription"
// ============================================================
exports.createPortalSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const decodedToken = await verifyAuth(req);
      const uid = decodedToken.uid;
      const returnUrl = req.body.returnUrl || "https://dimtools.net/subscribe.html";

      const userSnap = await admin.database().ref("users/" + uid + "/stripeCustomerId").once("value");
      const customerId = userSnap.val();

      if (!customerId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error("createPortalSession error:", err);
      if (err.message === "Unauthorized") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });
});

// ============================================================
// 3. STRIPE WEBHOOK HANDLER
// Receives events from Stripe to update subscription status in Firebase
// ============================================================
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  let event;

  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send("Webhook signature verification failed");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode === "subscription") {
          await handleSubscriptionActive(session.customer, session.subscription);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const status = subscription.status; // active, past_due, canceled, etc.
        await updateSubscriptionStatus(subscription.customer, subscription.id, status);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await updateSubscriptionStatus(subscription.customer, subscription.id, "canceled");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await updateSubscriptionStatus(invoice.customer, invoice.subscription, "past_due");
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).send("Webhook handler error");
  }

  return res.status(200).json({ received: true });
});

// ============================================================
// HELPERS
// ============================================================

async function handleSubscriptionActive(customerId, subscriptionId) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await updateSubscriptionStatus(customerId, subscriptionId, subscription.status);
}

async function updateSubscriptionStatus(customerId, subscriptionId, status) {
  // Find the Firebase user by stripeCustomerId
  const usersSnap = await admin.database().ref("users").orderByChild("stripeCustomerId").equalTo(customerId).once("value");
  const users = usersSnap.val();

  if (!users) {
    console.error("No Firebase user found for Stripe customer:", customerId);
    return;
  }

  // Update subscription status for matching user(s)
  const updates = {};
  for (const uid of Object.keys(users)) {
    updates["users/" + uid + "/subscription"] = {
      status: status,
      stripeSubscriptionId: subscriptionId,
      updatedAt: admin.database.ServerValue.TIMESTAMP,
    };
  }

  await admin.database().ref().update(updates);
}
