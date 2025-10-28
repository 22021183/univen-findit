// search-results-script.js

// Global variables
let currentItems = [];
let currentTab = 'lost';

// DOM Elements
const lostTab = document.getElementById('lost-tab');
const foundTab = document.getElementById('found-tab');
const resultsBody = document.getElementById('results-body');
const searchInput = document.getElementById('search-input');
const resultsTable = document.getElementById('results-table');
const noResultsMessage = document.getElementById('no-results-message');
const itemModal = document.getElementById('item-modal');
const closeModal = document.getElementById('close-modal');
const backButton = document.getElementById('back-button');
const backText = document.getElementById('back-text');
const lostItemDetail = document.getElementById('lost-item-detail');
const foundItemDetail = document.getElementById('found-item-detail');
const reportFoundBtn = document.getElementById('report-found-btn');
const claimBtn = document.getElementById('claim-btn');
const contactPopup = document.getElementById('contact-popup');
const contactPopupOverlay = document.getElementById('contact-popup-overlay');
const popupContactDetails = document.getElementById('popup-contact-details');
const closePopup = document.getElementById('close-popup');
const matchNotice = document.getElementById('match-notice');

// Function to display items in the table
function displayItems(items, tab) {
    resultsBody.innerHTML = '';
    currentItems = items;
    
    if (items.length === 0) {
        resultsTable.style.display = 'none';
        noResultsMessage.style.display = 'block';
    } else {
        resultsTable.style.display = 'table';
        noResultsMessage.style.display = 'none';
        
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.dataset.tab = tab;
            
            // For found items, check if user has matching lost item
            // For now, we'll set this to false since we don't have authentication yet
            const isBlurred = tab === 'found' && !item.matchesUserItem;
            
            row.innerHTML = `
                <td class="item-image-cell">
                    <div class="item-image ${isBlurred ? 'blurred-image' : ''}">
                        ${item.image ? `<img src="${item.image}" alt="${item.title}">` : 'Image'}
                    </div>
                </td>
                <td class="${isBlurred ? 'blurred-text' : ''}">${item.title}</td>
                <td class="${isBlurred ? 'blurred-text' : ''}">${item.category}</td>
                <td class="${isBlurred ? 'blurred-text' : ''}">${item.location}</td>
            `;
            
            // Always add click event, but handle differently based on blur status
            row.addEventListener('click', () => {
                if (tab === 'found' && !item.matchesUserItem) {
                    // Show blurred details for non-matching found items
                    showFoundItemDetailBlurred(item);
                } else {
                    showItemDetail(item, tab);
                }
            });
            
            resultsBody.appendChild(row);
        });
    }
}

// Function to show blurred found item details
function showFoundItemDetailBlurred(item) {
    lostItemDetail.style.display = 'none';
    foundItemDetail.style.display = 'block';
    backText.textContent = 'Back to Items Found';
    
    // Hide match notice
    matchNotice.style.display = 'none';
    
    // Remove any existing security notices
    const existingNotices = document.querySelectorAll('.security-notice-detail');
    existingNotices.forEach(notice => notice.remove());
    
    // Add security notice in red
    const securityNotice = document.createElement('div');
    securityNotice.className = 'security-notice-detail';
    securityNotice.innerHTML = `
        <p><strong>Security Notice</strong></p>
        <p>For security reasons, you can only view details of found items that match with your uploaded lost items.</p>
        <p>If you believe this item might be yours, please report your lost item first.</p>
    `;
    foundItemDetail.insertBefore(securityNotice, foundItemDetail.firstChild);
    
    // Populate found item details with blurred content
    document.getElementById('detail-title-found').textContent = item.title;
    document.getElementById('detail-title-found').classList.add('blurred-text');
    
    document.getElementById('detail-category-found').textContent = item.category;
    document.getElementById('detail-category-found').classList.add('blurred-text');
    
    document.getElementById('detail-location-found').textContent = item.location;
    document.getElementById('detail-location-found').classList.add('blurred-text');
    
    document.getElementById('detail-date-found').textContent = formatDate(item.date);
    document.getElementById('detail-date-found').classList.add('blurred-text');
    
    document.getElementById('detail-description-found').textContent = item.description;
    document.getElementById('detail-description-found').classList.add('blurred-text');
    
    // Hide contact info for non-matching items
    document.getElementById('detail-contact-found').textContent = 'Contact info hidden for security';
    document.getElementById('detail-contact-found').classList.remove('blurred-text');
    
    const detailImage = document.getElementById('detail-image-found');
    detailImage.innerHTML = item.image ? 
        `<img src="${item.image}" alt="${item.title}" class="blurred-image">` : 
        '<div class="blurred-text">Image</div>';
        
    // Hide claim button for non-matching items
    document.getElementById('claim-btn').style.display = 'none';
    
    itemModal.style.display = 'block';
}

// Function to show item details in modal (for matching items)
function showItemDetail(item, tab) {
    if (tab === 'lost') {
        lostItemDetail.style.display = 'block';
        foundItemDetail.style.display = 'none';
        backText.textContent = 'Back to Items Lost';
        
        // Remove any blur classes
        document.getElementById('detail-title-lost').classList.remove('blurred-text');
        document.getElementById('detail-category-lost').classList.remove('blurred-text');
        document.getElementById('detail-location-lost').classList.remove('blurred-text');
        document.getElementById('detail-date-lost').classList.remove('blurred-text');
        document.getElementById('detail-description-lost').classList.remove('blurred-text');
        
        // Remove any security notices
        const securityNotices = document.querySelectorAll('.security-notice-detail');
        securityNotices.forEach(notice => notice.remove());
        
        // Hide match notice
        matchNotice.style.display = 'none';
        
        // Populate lost item details
        document.getElementById('detail-title-lost').textContent = item.title;
        document.getElementById('detail-category-lost').textContent = item.category;
        document.getElementById('detail-location-lost').textContent = item.location;
        document.getElementById('detail-date-lost').textContent = formatDate(item.date);
        document.getElementById('detail-contact-lost').textContent = item.contact;
        document.getElementById('detail-description-lost').textContent = item.description;
        
        const detailImage = document.getElementById('detail-image-lost');
        detailImage.innerHTML = item.image ? 
            `<img src="${item.image}" alt="${item.title}">` : 
            'Image';
            
    } else {
        lostItemDetail.style.display = 'none';
        foundItemDetail.style.display = 'block';
        backText.textContent = 'Back to Items Found';
        
        // Remove any blur classes
        document.getElementById('detail-title-found').classList.remove('blurred-text');
        document.getElementById('detail-category-found').classList.remove('blurred-text');
        document.getElementById('detail-location-found').classList.remove('blurred-text');
        document.getElementById('detail-date-found').classList.remove('blurred-text');
        document.getElementById('detail-description-found').classList.remove('blurred-text');
        
        // Remove any security notices
        const securityNotices = document.querySelectorAll('.security-notice-detail');
        securityNotices.forEach(notice => notice.remove());
        
        // Show match notice for matching items
        if (item.matchesUserItem) {
            matchNotice.style.display = 'block';
        } else {
            matchNotice.style.display = 'none';
        }
        
        // Populate found item details
        document.getElementById('detail-title-found').textContent = item.title;
        document.getElementById('detail-category-found').textContent = item.category;
        document.getElementById('detail-location-found').textContent = item.location;
        document.getElementById('detail-date-found').textContent = formatDate(item.date);
        document.getElementById('detail-description-found').textContent = item.description;
        
        // Show contact info for matching found items
        document.getElementById('detail-contact-found').textContent = item.contact;
        
        const detailImage = document.getElementById('detail-image-found');
        detailImage.innerHTML = item.image ? 
            `<img src="${item.image}" alt="${item.title}">` : 
            'Image';
            
        // Show claim button for matching items
        document.getElementById('claim-btn').style.display = 'block';
    }
    
    itemModal.style.display = 'block';
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to load items from database
async function loadItems(tab, searchTerm = '') {
    try {
        const items = await databaseService.searchItems(searchTerm, tab);
        displayItems(items, tab);
    } catch (error) {
        console.error('Error loading items:', error);
        displayItems([], tab);
    }
}

// Tab click handlers
lostTab.addEventListener('click', function() {
    this.classList.add('active');
    foundTab.classList.remove('active');
    currentTab = 'lost';
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    loadItems('lost', searchTerm);
});

foundTab.addEventListener('click', function() {
    this.classList.add('active');
    lostTab.classList.remove('active');
    currentTab = 'found';
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    loadItems('found', searchTerm);
});

// Search functionality
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value.trim().toLowerCase();
        loadItems(currentTab, searchTerm);
    }
});

// Modal functionality
closeModal.addEventListener('click', function() {
    itemModal.style.display = 'none';
});

backButton.addEventListener('click', function() {
    itemModal.style.display = 'none';
});

// Report Found button
reportFoundBtn.addEventListener('click', function() {
    // This would update the database to mark item as found
    alert('Item reported as found! The owner will be notified.');
    showContactPopup('finder@email.com | 073 456 7890');
});

// Claim button
claimBtn.addEventListener('click', function() {
    // This would verify ownership and show contact info
    showContactPopup('finder@email.com | 073 456 7890');
});

// Contact popup functionality
function showContactPopup(contactInfo) {
    popupContactDetails.textContent = contactInfo;
    contactPopup.style.display = 'block';
    contactPopupOverlay.style.display = 'block';
}

closePopup.addEventListener('click', function() {
    contactPopup.style.display = 'none';
    contactPopupOverlay.style.display = 'none';
});

contactPopupOverlay.addEventListener('click', function() {
    contactPopup.style.display = 'none';
    this.style.display = 'none';
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        const text = this.textContent.trim();
        
        if (text === 'Home') {
            window.location.href = 'index.html';
        } else if (text === "User Guide") {
            // Temporary user guide information
            alert('User Guide:\n\n1. SEARCH: Use the search bar to find items\n2. REPORT: Click "Report" to report lost/found items\n3. VIEW: Click on items to see details\n4. CONTACT: Use contact info to claim items');
        } if (this.querySelector('.fa-user')) {
            window.location.href = 'account.html';
        } else if (text === "Report") {
            window.location.href = 'index.html#report';
        } else if (text === "Contact") {
            window.location.href = 'index.html#contact';
        } else if (text === "Items") {
            window.location.href = 'index.html#items';
        } 
    });
});
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we have a search parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery) {
        searchInput.value = searchQuery;
        loadItems(currentTab, searchQuery);
    } else {
        // Load lost items by default
        loadItems('lost');
    }
});

// Close modal if clicked outside
window.addEventListener('click', function(event) {
    if (event.target === itemModal) {
        itemModal.style.display = 'none';
    }
});

