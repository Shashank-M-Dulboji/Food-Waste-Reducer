import { initAuth, handleLogin, handleSignup, handleLogout } from './auth.js';
import { listenToDonations, addDonation, claimDonation, listenToClaimedDonations, deleteDonation } from './firestore.js';
import * as ui from './ui.js';

let currentUser = null;
let userRole = null;
let claimedDonationsUnsubscribe = null;

function onLogin(user, role) {
    currentUser = user;
    userRole = role;
    ui.showAppView(user, role);

    if (role === 'recipient') {
        if (claimedDonationsUnsubscribe) claimedDonationsUnsubscribe();
        claimedDonationsUnsubscribe = listenToClaimedDonations(user, (donations) => {
            ui.renderDonations(donations, role, 'my-receivings-list');
        });
    }

    return listenToDonations(user, role, (donations) => {
        const listId = role === 'donor' ? 'donor-donations-list' : 'recipient-donations-list';
        ui.renderDonations(donations, role, listId);
    });
}

function onLogout() {
    currentUser = null;
    userRole = null;
    ui.showLoginView();
    if (claimedDonationsUnsubscribe) {
        claimedDonationsUnsubscribe();
        claimedDonationsUnsubscribe = null;
    }
}

initAuth(onLogin, onLogout);

// Event listeners
document.getElementById('show-signup').addEventListener('click', () => ui.toggleAuthForms(true));
document.getElementById('show-login').addEventListener('click', () => ui.toggleAuthForms(false));

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try { await handleLogin(email, password); e.target.reset(); } 
    catch (error) { ui.showMessage('Error', error.message, 'error'); }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = e.target.querySelector('input[name="role"]:checked').value;
    try { await handleSignup(email, password, role); e.target.reset(); } 
    catch (error) { ui.showMessage('Error', error.message, 'error'); }
});

document.getElementById('logout-btn').addEventListener('click', handleLogout);

document.getElementById('add-donation-btn').addEventListener('click', () => ui.showDonationModal(true));
document.getElementById('cancel-btn').addEventListener('click', () => ui.showDonationModal(false));

document.getElementById('donation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const donationData = {
        foodName: document.getElementById('food-name').value,
        quantity: document.getElementById('food-quantity').value,
        phone: document.getElementById('phone-number').value,
        address: document.getElementById('pickup-address').value
    };
    try {
        await addDonation(currentUser, donationData);
        ui.showDonationModal(false);
        ui.showMessage('Success', 'Your food donation has been listed.');
    } catch (error) {
        ui.showMessage('Error', error.message, 'error');
    }
});

// Recipient tabs (safe check)
const tabs = document.getElementById('recipient-tabs');
if (tabs) {
    tabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('recipient-tab')) {
            const showAvailable = e.target.dataset.target === 'available-donations-view';
            ui.toggleRecipientViews(showAvailable);
        }
    });
}

// Claim / Delete
document.addEventListener('click', async (e) => {
    const claimBtn = e.target.closest('.claim-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (claimBtn) {
        const donationId = claimBtn.dataset.id;
        if (confirm("Claim this food donation?")) {
            try {
                await claimDonation(donationId, currentUser);
                ui.showMessage('Success', 'Food claimed! Arrange for pickup.');
            } catch {
                ui.showMessage('Error', 'Could not claim item.', 'error');
            }
        }
    }

    if (deleteBtn) {
        const donationId = deleteBtn.dataset.id;
        if (confirm("Delete this donation permanently?")) {
            try {
                await deleteDonation(donationId);
                ui.showMessage('Success', 'Donation deleted.');
            } catch {
                ui.showMessage('Error', 'Could not delete listing.', 'error');
            }
        }
    }
});

// Search
document.getElementById('search-location').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const donationCards = document.querySelectorAll('#recipient-donations-list .donation-card');
    donationCards.forEach(card => {
        const address = (card.dataset.address || "").toLowerCase();
        card.style.display = address.includes(searchTerm) ? 'flex' : 'none';
    });
});
