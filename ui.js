// --- DOM ELEMENTS ---
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const userEmailSpan = document.getElementById('user-email');
const donorView = document.getElementById('donor-view');
const recipientView = document.getElementById('recipient-view');
const messageModal = document.getElementById('message-modal');
const donationModal = document.getElementById('donation-modal');
const donationForm = document.getElementById('donation-form');
// Recipient view elements
const recipientTabs = document.getElementById('recipient-tabs');
const availableDonationsView = document.getElementById('available-donations-view');
const myReceivingsView = document.getElementById('my-receivings-view');

// --- UI LOGIC ---

export function showLoginView() {
    appContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
}

export function showAppView(user, role) {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userEmailSpan.textContent = user.email;

    if (role === 'donor') {
        donorView.classList.remove('hidden');
        recipientView.classList.add('hidden');
    } else {
        recipientView.classList.remove('hidden');
        donorView.classList.add('hidden');
        toggleRecipientViews(true); 
    }
}

export function toggleAuthForms(showSignup) {
    if (showSignup) {
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
    } else {
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
    }
}

export function toggleRecipientViews(showAvailable) {
    const availableTab = recipientTabs.querySelector('[data-target="available-donations-view"]');
    const receivingsTab = recipientTabs.querySelector('[data-target="my-receivings-view"]');

    availableTab.classList.toggle('tab-active', showAvailable);
    availableTab.classList.toggle('text-gray-500', !showAvailable);
    
    receivingsTab.classList.toggle('tab-active', !showAvailable);
    receivingsTab.classList.toggle('text-gray-500', showAvailable);
    
    availableDonationsView.classList.toggle('hidden', !showAvailable);
    myReceivingsView.classList.toggle('hidden', showAvailable);
}

export function renderDonations(donations, userRole, listId) {
    const list = document.getElementById(listId);
    list.innerHTML = '';
    if (!donations || donations.length === 0) {
        list.innerHTML = `<p class="text-gray-500 p-4 col-span-full">No donations to show right now.</p>`;
        return;
    }
    donations.forEach(donation => {
        const card = createDonationCard(donation.id, donation, userRole, listId);
        list.appendChild(card);
    });
}

function createDonationCard(id, data, userRole, listId) {
    const card = document.createElement('div');
    card.className = 'donation-card bg-white rounded-xl shadow-md p-6 flex flex-col justify-between transition-transform hover:scale-105 relative';
    card.dataset.address = data.address || '';

    const statusColors = {
        available: 'bg-green-100 text-green-800',
        claimed: 'bg-yellow-100 text-yellow-800',
    };
    const readableDate = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'Just now';
    
    let actionButton = '';
    let deleteButton = '';
    
    // Claim button for recipients
    if (userRole === 'recipient' && data.status === 'available') {
        actionButton = `<button data-id="${id}" class="claim-btn mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">Claim Food</button>`;
    }
    
    // Delete button for donors OR recipients (only in My Receivings)
    if (userRole === 'donor' || (userRole === 'recipient' && listId === 'my-receivings-list')) {
        deleteButton = `
            <button data-id="${id}" class="delete-btn absolute bottom-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                <i class="fas fa-trash-alt fa-lg"></i>
            </button>
        `;
    }

    const phoneInfo = (userRole === 'recipient' || data.status === 'claimed') 
        ? `<p class="text-gray-600 mt-1">Contact: <span class="font-medium">${data.phone}</span></p>` 
        : '';

    card.innerHTML = `
        <div>
            <div class="flex justify-between items-start">
                <h3 class="text-xl font-bold text-gray-800">${data.foodName}</h3>
                <span class="text-xs font-semibold px-2 py-1 rounded-full ${statusColors[data.status] || 'bg-gray-100'}">${data.status}</span>
            </div>
            <p class="text-gray-600 mt-2">Quantity: <span class="font-medium">${data.quantity}</span></p>
            <p class="text-gray-600 mt-1">Address: <span class="font-medium">${data.address}</span></p>
            ${phoneInfo}
            <p class="text-xs text-gray-400 mt-4">Listed: ${readableDate}</p>
            ${data.status === 'claimed' ? `<p class="text-xs text-yellow-600 mt-1 font-semibold">Claimed by: ${data.recipientEmail || 'N/A'}</p>` : ''}
        </div>
        <div class="pt-8"> 
             ${actionButton}
        </div>
        ${deleteButton}
    `;
    return card;
}

export function showDonationModal(show) {
    if (show) {
        donationModal.classList.remove('hidden');
    } else {
        donationForm.reset();
        donationModal.classList.add('hidden');
    }
}

export function showMessage(title, text, type = 'success') {
    const messageTitle = document.getElementById('message-title');
    const messageText = document.getElementById('message-text');
    const messageIcon = document.getElementById('message-icon');
    const messageOkBtn = document.getElementById('message-ok-btn');
    
    messageTitle.textContent = title;
    messageText.textContent = text;
    
    messageIcon.innerHTML = type === 'success' ? `<i class="fas fa-check text-4xl"></i>` : `<i class="fas fa-times text-4xl"></i>`;
    messageIcon.className = `mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    messageOkBtn.className = `font-bold py-2 px-6 rounded-lg text-white ${type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`;
    
    messageModal.classList.remove('hidden');
    
    const okListener = () => {
        messageModal.classList.add('hidden');
        messageOkBtn.removeEventListener('click', okListener);
    };
    messageOkBtn.addEventListener('click', okListener);
}