# DimTools SaaS Payment Setup Guide

## Overview
This sets up $4.99/month subscriptions using **Stripe** + **Firebase Cloud Functions**.
Users must subscribe to access Menu Tally and Live Timesheet pages.

---

## Step 1: Stripe Account Setup

1. Go to [stripe.com](https://stripe.com) and create an account
2. In the Stripe Dashboard, go to **Products** > **Add Product**:
   - Name: `DimTools Pro`
   - Price: `$4.99` / `month` / `recurring`
   - Click **Save**
3. Copy the **Price ID** (starts with `price_...`)
4. Go to **Developers** > **API Keys** and copy your **Secret Key** (`sk_test_...` for testing, `sk_live_...` for production)

## Step 2: Firebase CLI Setup

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize in your project directory
cd /path/to/dimtools
firebase use meal-schedule-5b1f4
```

## Step 3: Deploy Cloud Functions

```bash
# Install function dependencies
cd functions
npm install
cd ..

# Set Stripe config values
firebase functions:config:set \
  stripe.secret_key="sk_test_YOUR_KEY" \
  stripe.webhook_secret="whsec_YOUR_SECRET" \
  stripe.price_id="price_YOUR_PRICE_ID"

# Deploy functions
firebase deploy --only functions
```

After deployment, Firebase will give you URLs like:
```
https://us-central1-meal-schedule-5b1f4.cloudfunctions.net/createCheckoutSession
https://us-central1-meal-schedule-5b1f4.cloudfunctions.net/createPortalSession
https://us-central1-meal-schedule-5b1f4.cloudfunctions.net/stripeWebhook
```

## Step 4: Update Client Code

In `subscribe.html`, replace the placeholder URLs (near the top of the `<script>` section):

```javascript
const STRIPE_CHECKOUT_FUNCTION_URL = 'https://us-central1-meal-schedule-5b1f4.cloudfunctions.net/createCheckoutSession';
const STRIPE_PORTAL_FUNCTION_URL = 'https://us-central1-meal-schedule-5b1f4.cloudfunctions.net/createPortalSession';
```

## Step 5: Stripe Webhook Setup

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://us-central1-meal-schedule-5b1f4.cloudfunctions.net/stripeWebhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing Secret** (`whsec_...`)
7. Update your Firebase config:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_YOUR_SIGNING_SECRET"
   firebase deploy --only functions
   ```

## Step 6: Stripe Customer Portal Setup

1. In Stripe Dashboard, go to **Settings** > **Billing** > **Customer portal**
2. Enable the portal
3. Configure allowed actions (cancel subscription, update payment method, etc.)
4. Save

## Step 7: Firebase Database Rules

Deploy the security rules to prevent client-side tampering with subscription data:

```bash
firebase deploy --only database
```

This ensures `subscription` and `stripeCustomerId` fields can only be written by Cloud Functions (admin SDK), not by client-side code.

## Step 8: Enable Blaze Plan

Firebase Cloud Functions require the **Blaze (pay-as-you-go)** plan. Go to Firebase Console > Upgrade to enable functions deployment.

---

## Testing

1. Use Stripe test mode (keys starting with `sk_test_` and `pk_test_`)
2. Use test card number: `4242 4242 4242 4242` with any future expiry and any CVC
3. Sign in to DimTools, go to Subscribe page, complete checkout
4. After successful payment, the webhook fires and writes subscription status to Firebase
5. Menu Tally and Live Timesheet should now be accessible

## How It Works

```
User clicks Subscribe
        │
        ▼
subscribe.html calls Cloud Function (createCheckoutSession)
        │
        ▼
Cloud Function creates Stripe Checkout Session
        │
        ▼
User redirected to Stripe Checkout (hosted by Stripe)
        │
        ▼
User completes payment
        │
        ▼
Stripe sends webhook to Cloud Function (stripeWebhook)
        │
        ▼
Cloud Function writes to Firebase:
  users/{uid}/subscription/status = "active"
        │
        ▼
menutally.html / livetimesheet.html check:
  users/{uid}/subscription/status === "active"
        │
        ▼
Access granted (or redirect to subscribe.html)
```

## Firebase Database Structure

```
users/
  {uid}/
    email: "user@example.com"
    username: "User"
    avatarUrl: "..."
    stripeCustomerId: "cus_..."        ← set by Cloud Function
    subscription/
      status: "active"                  ← set by Cloud Function
      stripeSubscriptionId: "sub_..."   ← set by Cloud Function
      updatedAt: 1234567890             ← set by Cloud Function
```

## Going Live

1. Switch Stripe keys from `sk_test_` to `sk_live_`
2. Create a live webhook endpoint with the same URL
3. Update Firebase config with live keys
4. Redeploy: `firebase deploy --only functions`
