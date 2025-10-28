// main.js - COMPLETE FIXED VERSION

// Global flag to prevent multiple initializations
let authInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded:', window.location.pathname);
    
    // Setup basic navigation
    setupNavigation();
    
    // Initialize auth UI only once
    initializeAuth();
});

function initializeAuth() {
    if (authInitialized) {
        console.log('Auth already initialized, skipping...');
        return;
    }
    
    authInitialized = true;
    console.log('Initializing authentication...');
    
    // Single auth state change listener
    if (typeof databaseService !== 'undefined') {
        databaseService.onAuthStateChanged((user) => {
            console.log('Auth state changed - User:', user ? user.email : 'None');
            updateAuthUI();
            checkPageAccess(user);
        });
    } else {
        console.log('databaseService not available yet, retrying...');
        setTimeout(initializeAuth, 100);
    }
}

function checkPageAccess(user) {
    const currentPage = window.location.pathname;
    const protectedPages = ['account.html', 'report.html'];
    const isProtectedPage = protectedPages.some(page => currentPage.includes(page));
    
    if (!user && isProtectedPage) {
        console.log('Access denied to protected page, redirecting to login');
        if (!currentPage.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
    
    if (user && (currentPage.includes('login.html') || currentPage.includes('signup.html'))) {
        console.log('User already logged in, redirecting to home');
        if (!currentPage.includes('index.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        }
    }
}

function updateAuthUI() {
    const user = databaseService ? databaseService.getCurrentUser() : null;
    const userIcons = document.querySelectorAll('.nav-item:has(.fa-user)');
    
    userIcons.forEach(iconContainer => {
        // Clear existing content
        iconContainer.innerHTML = '<i class="fas fa-user"></i>';
        
        if (user) {
            const userName = user.displayName || user.email.split('@')[0];
            const nameSpan = document.createElement('span');
            nameSpan.className = 'user-name-nav';
            nameSpan.textContent = userName;
            iconContainer.appendChild(nameSpan);
        }
        
        // Add click handler
        iconContainer.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (user) {
                if (!window.location.href.includes('account.html')) {
                    window.location.href = 'account.html';
                }
            } else {
                if (!window.location.href.includes('login.html')) {
                    window.location.href = 'login.html';
                }
            }
        });
        
        iconContainer.style.cursor = 'pointer';
        iconContainer.title = user ? `Account (${user.email})` : 'Login';
    });
}

// SINGLE navigation function (removed duplicates)
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        // Skip if it's the user icon (handled separately)
        if (item.querySelector('.fa-user')) {
            return;
        }
        
        item.addEventListener('click', function() {
            const text = this.textContent.trim();
            handleNavigation(text);
        });
    });
}

function handleNavigation(text) {
    switch(text) {
        case 'Home':
            window.location.href = 'index.html';
            break;
        case 'User Guide':
            alert('User Guide:\n\n1. SEARCH: Use the search bar to find items\n2. REPORT: Click "Report" to report lost/found items\n3. VIEW: Click on items to see details\n4. CONTACT: Use contact info to claim items');
            break;
        case 'Report':
            window.location.href = 'report.html';
            break;
        case 'Items':
            window.location.href = 'search-results.html';
            break;
        case 'Contact':
            // Scroll to contact section on home page, or go to home
            if (window.location.href.includes('index.html')) {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = 'index.html#contact';
            }
            break;
    }
}