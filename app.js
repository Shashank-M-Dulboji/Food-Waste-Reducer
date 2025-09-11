import { initAuth, handleLogin, handleSignup, handleLogout } from './auth.js';
import { listenToDonations, addDonation, claimDonation, listenToClaimedDonations, deleteDonation } from './firestore.js';
import * as ui from './ui.js';

let currentUser = null;

// Page-specific logic
document.addEventListener('DOMContentLoaded', () => {
    initAuth(onLogin, onLogout);
    const path = window.location.pathname;

    if (path === '/' || path.endsWith('/index.html')) {
        // Auth forms
        document.getElementById('show-signup').addEventListener('click', () => ui.toggleAuthForms(true));
        document.getElementById('show-login').addEventListener('click', () => ui.toggleAuthForms(false));
        document.getElementById('login-form').addEventListener('submit', handleAuthForm(handleLogin));
        document.getElementById('signup-form').addEventListener('submit', handleAuthForm(handleSignup, true));
    } else {
        // App pages
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.addEventListener('click', handleActionButtons);
    }

    if (path.endsWith('/donor.html')) {
        document.getElementById('add-donation-btn').addEventListener('click', () => ui.showDonationModal(true));
        document.getElementById('cancel-btn').addEventListener('click', () => ui.showDonationModal(false));
        document.getElementById('donation-form').addEventListener('submit', handleDonationSubmit);
    }
    
    if (path.endsWith('/recipient.html')) {
        const searchInput = document.getElementById('search-location');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => ui.filterDonationsByLocation(e.target.value));
        }
    }
});

function onLogin(user, role) {
    currentUser = user;
    ui.updateUserInfo(user);
    
    const path = window.location.pathname;

    if (role === 'donor' && !path.endsWith('/donor.html')) {
        window.location.href = '/donor.html';
    } else if (role === 'recipient' && (!path.endsWith('/recipient.html') && !path.endsWith('/myreceivings.html'))) {
        window.location.href = '/recipient.html';
    }

    if (role === 'donor' && path.endsWith('/donor.html')) {
        listenToDonations(user, role, donations => ui.renderDonations(donations, role, 'donor-donations-list'));
    } else if (role === 'recipient') {
        if (path.endsWith('/recipient.html')) {
            listenToDonations(user, role, donations => ui.renderDonations(donations, role, 'recipient-donations-list'));
        }
        if (path.endsWith('/myreceivings.html')) {
            listenToClaimedDonations(user, donations => ui.renderDonations(donations, role, 'my-receivings-list'));
        }
    }
}

function onLogout() {
    currentUser = null;
    const path = window.location.pathname;
    if (path !== '/' && !path.endsWith('/index.html')) {
        window.location.href = '/';
    }
}

function handleAuthForm(authFunction, isSignup = false) {
    return async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        try {
            if (isSignup) {
                const role = e.target.querySelector('input[name="role"]:checked').value;
                await authFunction(email, password, role);
            } else {
                await authFunction(email, password);
            }
            e.target.reset();
        } catch (error) {
            ui.showMessage('Error', error.message, 'error');
        }
    };
}

async function handleDonationSubmit(e) {
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
}

async function handleActionButtons(e) {
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
}