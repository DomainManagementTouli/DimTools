// Livetimesheet Application
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBKqak1hp_64YjINjBf3zNaq0kJbu1AhWM",
    authDomain: "meal-schedule-5b1f4.firebaseapp.com",
    databaseURL: "https://meal-schedule-5b1f4-default-rtdb.firebaseio.com",
    projectId: "meal-schedule-5b1f4",
    storageBucket: "meal-schedule-5b1f4.firebasestorage.app",
    messagingSenderId: "796389771102",
    appId: "1:796389771102:web:dd5300418c2a4fbb84f1cf",
    measurementId: "G-XL8ZJ1RYLH"
};

// Initial data
const initialData = [
    ["04:20 PM - 04:50 PM", "8South (Green)", "", ""],
    ["04:10 PM - 04:40 PM", "8 Central (Yellow)", "", ""],
    ["04:10 PM - 04:40 PM", "5 Central (Yellow)", "", ""],
    ["04:20 PM - 04:50 PM", "5WN ICU (Green)", "", ""],
    ["04:25 PM - 04:55 PM", "10 Central (Green)", "", ""],
    ["04:35 PM - 05:05 PM", "5 West (Green)", "", ""],
    ["04:40 PM - 05:10 PM", "9 South  (Yellow)", "", ""],
    ["04:50 PM - 05:20 PM", "6 Central  (Yellow)", "", ""],
    ["04:45 PM - 05:15 PM", "4 Central (Green)", "", ""],
    ["04:50 PM - 05:20 PM", "7F ICU (Green)", "", ""],
    ["04:50 PM - 05:20 PM", "7E ICU (Green)", "", ""],
    ["04:55 PM - 05:25 PM", "7N ICU (Green)", "", ""],
    ["05:15 PM - 05:45 PM", "10 WEST OBS (Yellow)", "", ""],
    ["05:20 PM - 05:50 PM", "PEDIATRICS (Yellow)", "", ""],
    ["05:45 PM - 06:15 PM", "2FMB (Green)", "", ""],
    ["05:25 PM - 05:55 PM", "LABOR & DELIVERY (Yellow)", "", ""],
    ["05:30 PM - 06:00 PM", "ANTEPARTUM & NICU (Yellow)", "", ""],
    ["05:30 PM - 06:00 PM", "9 WEST (Green)", "", ""],
    ["05:55 PM - 06:25 PM", "7S ICU (Yellow)", "", ""],
    ["05:55 PM - 06:25 PM", "7SOUTH NEUROSTROKE (Yellow)", "", ""],
    ["05:40 PM - 06:10 PM", "9 Central (Green)", "", ""],
    ["[No Value]", "Emergency Department (Green)", "", ""],
    ["06:15 PM - 06:45 PM", "8 WEST ONCOLOGY (Yellow)", "", ""]
];

let db = null;
let dataRef = null;
let auth = null;
let currentUser = null;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
auth = firebase.auth();
db = firebase.database();

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showMainApp(user);
        initializeDatabase();
    } else {
        currentUser = null;
        showLogin();
    }
});

// Login form handling
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const message = document.getElementById('loginMessage');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    message.classList.remove('show', 'error', 'success');

    try {
        await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
    } catch (error) {
        // Use generic error messages to prevent user enumeration attacks
        let errorMessage = 'Invalid email or password. Please try again.';

        if (error.code === 'auth/invalid-email') {
            errorMessage = 'Please enter a valid email address.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        }
        // Note: auth/user-not-found and auth/wrong-password intentionally use generic message

        message.textContent = errorMessage;
        message.classList.add('show', 'error');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
        passwordInput.value = '';
    }
});

// Logout handling
document.getElementById('logoutBtn').addEventListener('click', async function() {
    try {
        await auth.signOut();
    } catch (error) {
        // Silently handle logout errors - no sensitive info logged
        updateStatus('Sign out failed - please try again', false);
        setTimeout(() => updateStatus('Connected', true), 3000);
    }
});

function showLogin() {
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('mainContainer').classList.remove('show');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginBtn').disabled = false;
    document.getElementById('loginBtn').textContent = 'Sign In';
}

function showMainApp(user) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').classList.add('show');
    document.getElementById('userEmail').textContent = user.email;
}

function initializeDatabase() {
    try {
        dataRef = db.ref('dinnerScheduleData');
        updateStatus('Connected', true);

        dataRef.once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                dataRef.set(initialData);
            }
            renderTable(snapshot.val() || initialData);
        });

        dataRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                renderTable(data);
                updateLastUpdateTime();
            }
        });
    } catch (error) {
        // Avoid logging sensitive error details to console
        updateStatus('Connection Error - Using Local Mode', false);
        renderTable(initialData);
    }
}

function updateStatus(text, connected) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    statusText.textContent = text;
    if (connected) {
        statusDot.classList.remove('disconnected');
    } else {
        statusDot.classList.add('disconnected');
    }
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    document.getElementById('lastUpdate').textContent = `Last update: ${timeStr}`;
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.replaceChildren(); // Safer than innerHTML to prevent XSS patterns

    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');

        const unitName = row[1]?.toLowerCase() || '';
        if (unitName.includes('green')) {
            tr.classList.add('unit-green');
        } else if (unitName.includes('yellow')) {
            tr.classList.add('unit-yellow');
        }

        row.forEach((cell, cellIndex) => {
            const td = document.createElement('td');

            if ((cellIndex === 2 || cellIndex === 3)) {
                td.classList.add('editable');
                td.textContent = cell || '';
                td.onclick = () => editCell(td, rowIndex, cellIndex);
            } else {
                td.textContent = cell;
            }

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function editCell(td, rowIndex, cellIndex) {
    if (!db || !currentUser) {
        alert('You must be signed in to edit the schedule.');
        return;
    }

    if (td.classList.contains('editing')) {
        return;
    }

    td.classList.add('editing');
    const currentValue = td.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    td.textContent = '';
    td.appendChild(input);

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    const saveValue = () => {
        const newValue = input.value;
        td.classList.remove('editing');

        // Input validation - max 200 characters, strip control characters
        const sanitizedValue = newValue
            .substring(0, 200)
            .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters

        // Use transaction to prevent race conditions with concurrent edits
        dataRef.transaction((currentData) => {
            if (currentData === null) {
                // Initialize with default data if not exists
                const data = JSON.parse(JSON.stringify(initialData));
                data[rowIndex][cellIndex] = sanitizedValue;
                return data;
            }
            // Validate array bounds before writing
            if (rowIndex >= 0 && rowIndex < currentData.length &&
                cellIndex >= 0 && cellIndex < currentData[rowIndex].length) {
                currentData[rowIndex][cellIndex] = sanitizedValue;
            }
            return currentData;
        }).catch((error) => {
            // Avoid logging sensitive error details to console
            updateStatus('Save failed - please try again', false);
            setTimeout(() => updateStatus('Connected', true), 3000);
        });
    };

    input.onblur = saveValue;
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            saveValue();
        }
        if (e.key === 'Escape') {
            td.classList.remove('editing');
            dataRef.once('value').then((snapshot) => {
                renderTable(snapshot.val() || initialData);
            });
        }
    };
}
