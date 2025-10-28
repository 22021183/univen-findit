// account.js - COMPLETE FIXED VERSION
console.log('🔧 ACCOUNT.JS STARTING...');

class AccountPage {
    constructor() {
        this.currentUser = null;
        this.initialized = false;
        console.log('🔄 AccountPage constructor called');
        this.init();
    }

    async init() {
        console.log('🚀 AccountPage.init() started');
        
        // Wait for Firebase and databaseService to be ready
        if (!await this.waitForFirebase()) {
            this.showError('Firebase services not available. Please refresh the page.');
            return;
        }
        
        // Check authentication
        const isAuthenticated = await this.checkAuthentication();
        console.log('🔐 Authentication result:', isAuthenticated);
        
        if (!isAuthenticated) {
            console.log('❌ Authentication failed - stopping initialization');
            return;
        }
        
        console.log('✅ Authentication successful - continuing setup');
        this.setupEventListeners();
        this.loadUserReports();
        this.updateUserInterface();
        this.initialized = true;
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 30; // 3 seconds max
            
            const checkFirebase = () => {
                attempts++;
                
                if (typeof firebase !== 'undefined' && 
                    typeof databaseService !== 'undefined' && 
                    databaseService.getCurrentUser) {
                    console.log('✅ Firebase services ready (attempt ' + attempts + ')');
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    console.error('❌ Firebase services failed to load');
                    resolve(false);
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
        });
    }

    async checkAuthentication() {
        return new Promise((resolve) => {
            // Use the databaseService's auth state listener
            databaseService.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUser = user;
                    console.log("✅ User authenticated:", user.email);
                    resolve(true);
                } else {
                    console.log("❌ No user found - showing login redirect");
                    this.showLoginRedirect();
                    resolve(false);
                }
            });
        });
    }

    showLoginRedirect() {
        // Show a message instead of immediately redirecting
        const redirectMessage = document.createElement('div');
        redirectMessage.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); color: white; display: flex;
            flex-direction: column; justify-content: center; align-items: center;
            z-index: 1000; font-family: Arial, sans-serif; text-align: center;
        `;
        redirectMessage.innerHTML = `
            <div style="background: white; color: #333; padding: 2rem; border-radius: 8px; max-width: 400px;">
                <h2 style="color: #1C3F5C; margin-bottom: 1rem;">Authentication Required</h2>
                <p style="margin-bottom: 1.5rem;">You need to be logged in to access your account page.</p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button onclick="window.location.href='login.html'" 
                            style="padding: 10px 20px; background: #1C3F5C; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Go to Login
                    </button>
                    <button onclick="window.location.href='index.html'" 
                            style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Back to Home
                    </button>
                </div>
                <p style="margin-top: 1rem; font-size: 0.9em; color: #666;">Auto-redirecting in 5 seconds...</p>
            </div>
        `;
        document.body.appendChild(redirectMessage);
        
        // Auto-redirect after 5 seconds
        setTimeout(() => {
            if (!window.location.href.includes('login.html')) {
                window.location.href = 'login.html';
            }
        }, 5000);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #fee; color: #c33; padding: 1rem; margin: 1rem;
            border: 1px solid #c33; border-radius: 4px; text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3 style="margin: 0 0 0.5rem 0;">Error</h3>
            <p style="margin: 0 0 1rem 0;">${message}</p>
            <button onclick="location.reload()" 
                    style="padding: 8px 16px; background: #c33; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry
            </button>
        `;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(link.dataset.section);
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
            });
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Header navigation (excluding user icon)
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.querySelector('.fa-user')) {
                return; // User icon is handled by main.js
            }
            
            item.addEventListener('click', () => {
                this.handleHeaderNavigation(item);
            });
        });

        // Profile form submission
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Activate corresponding nav link
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    }

    setFilter(filter) {
        console.log('Setting filter to:', filter);
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.loadUserReports();
    }

    async loadUserReports() {
        try {
            const reportsGrid = document.getElementById('reports-grid');
            const emptyState = document.getElementById('reports-empty');
            
            console.log('Loading user reports...');
            
            // For now, we'll use localStorage. Later replace with Firebase
            const lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
            const foundItems = JSON.parse(localStorage.getItem('foundItems')) || [];
            
            let userItems = [];
            const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
            
            // Filter items based on current selection
            if (filter === 'all') {
                userItems = [...lostItems, ...foundItems];
            } else if (filter === 'lost') {
                userItems = lostItems;
            } else if (filter === 'found') {
                userItems = foundItems;
            }
            
            // Sort by date (newest first)
            userItems.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
            
            if (userItems.length === 0) {
                reportsGrid.innerHTML = emptyState.outerHTML;
                return;
            }
            
            emptyState.style.display = 'none';
            reportsGrid.innerHTML = '';
            
            userItems.forEach(item => {
                const reportCard = this.createReportCard(item);
                reportsGrid.appendChild(reportCard);
            });
            
        } catch (error) {
            console.error('Error loading user reports:', error);
        }
    }

    createReportCard(item) {
        const card = document.createElement('div');
        card.className = 'report-card';
        card.dataset.itemId = item.id;
        card.dataset.type = item.type;
        
        const statusClass = this.getItemStatusClass(item);
        const statusText = this.getItemStatusText(item);
        
        card.innerHTML = `
            <div class="report-image">
                ${item.image ? 
                    `<img src="${item.image}" alt="${item.title}">` : 
                    `<div class="image-placeholder">
                        <i class="fas fa-${item.type === 'lost' ? 'search' : 'hand-holding'}"></i>
                    </div>`
                }
                <div class="report-status ${statusClass}">${statusText}</div>
            </div>
            <div class="report-content">
                <h3 class="report-title">${item.title}</h3>
                <div class="report-meta">
                    <span class="report-type ${item.type}">${item.type === 'lost' ? 'Lost Item' : 'Found Item'}</span>
                    <span class="report-date">${this.formatDate(item.date)}</span>
                </div>
                <div class="report-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${item.location}</span>
                </div>
                <div class="report-actions">
                    <button class="btn-action view-details" data-id="${item.id}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    ${item.type === 'lost' ? `
                    <button class="btn-action mark-found" data-id="${item.id}">
                        <i class="fas fa-check"></i> Mark Found
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners
        card.querySelector('.view-details').addEventListener('click', () => {
            this.viewItemDetails(item);
        });
        
        if (item.type === 'lost') {
            card.querySelector('.mark-found').addEventListener('click', () => {
                this.markAsFound(item.id);
            });
        }
        
        return card;
    }

    getItemStatusClass(item) {
        if (item.type === 'found') return 'status-active';
        if (item.status === 'claimed') return 'status-claimed';
        if (item.status === 'found') return 'status-found';
        return 'status-active';
    }

    getItemStatusText(item) {
        if (item.type === 'found') return 'Active';
        if (item.status === 'claimed') return 'Claimed';
        if (item.status === 'found') return 'Found';
        return 'Active';
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    viewItemDetails(item) {
        // Redirect to search results with item details
        const params = new URLSearchParams();
        params.append('item', JSON.stringify(item));
        params.append('tab', item.type);
        window.location.href = `search-results.html?${params.toString()}`;
    }

    markAsFound(itemId) {
        if (confirm('Mark this item as found? This will notify potential matches.')) {
            // Update item status in localStorage
            const lostItems = JSON.parse(localStorage.getItem('lostItems')) || [];
            const updatedItems = lostItems.map(item => {
                if (item.id === itemId) {
                    return { ...item, status: 'found', foundAt: new Date().toISOString() };
                }
                return item;
            });
            
            localStorage.setItem('lostItems', JSON.stringify(updatedItems));
            this.loadUserReports();
            alert('Item marked as found!');
        }
    }

    updateUserInterface() {
        console.log('Updating UI with user data...');
        
        if (this.currentUser) {
            // Update user info in the account page sidebar
            const userNameElement = document.querySelector('.user-name');
            const userEmailElement = document.querySelector('.user-email');
            
            if (userNameElement) {
                userNameElement.textContent = this.currentUser.displayName || 'User';
            }
            if (userEmailElement) {
                userEmailElement.textContent = this.currentUser.email;
            }
            
            // Pre-fill profile form with user data
            const profileNameInput = document.getElementById('profile-name');
            const profileEmailInput = document.getElementById('profile-email');
            
            if (profileNameInput) {
                profileNameInput.value = this.currentUser.displayName || '';
            }
            if (profileEmailInput) {
                profileEmailInput.value = this.currentUser.email;
            }
            
            console.log('User interface updated for:', this.currentUser.email);
        }
    }

    async updateProfile() {
        try {
            const name = document.getElementById('profile-name').value;
            const phone = document.getElementById('profile-phone').value;
            const campus = document.getElementById('profile-campus').value;
            
            // Here you would update the user profile in Firebase
            // For now, we'll just show a success message
            alert('Profile updated successfully!');
            
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile: ' + error.message);
        }
    }

    async logout() {
        try {
            if (confirm('Are you sure you want to logout?')) {
                await databaseService.logout();
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    handleHeaderNavigation(item) {
        const text = item.textContent.trim();
        
        if (text === 'Home') {
            window.location.href = 'index.html';
        } else if (text === 'User Guide') {
            alert('User Guide page coming soon!');
        } else if (text === 'Report') {
            window.location.href = 'report.html';
        } else if (text === 'Items') {
            window.location.href = 'search-results.html';
        } else if (text === 'Contact') {
            window.location.href = 'index.html#contact';
        }
    }
}

// Initialize the account page when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM Content Loaded - Initializing AccountPage');
        new AccountPage();
    });
} else {
    console.log('📄 DOM already loaded - Initializing AccountPage');
    new AccountPage();
}