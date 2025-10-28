// Recent Items functionality
const itemsGrid = document.getElementById('items-grid');
const emptyState = document.getElementById('empty-state');

// Function to add a new item to the recent items section
function addNewItem(itemName, itemLocation, imageData = null) {
    // Hide empty state when first item is added
    if (emptyState && emptyState.style.display !== 'none') {
        emptyState.style.display = 'none';
    }
    
    // Create the item card
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    itemCard.style.display = 'block';
    
    // Create image element
    const itemImageDiv = document.createElement('div');
    itemImageDiv.className = 'item-image';
    
    const img = document.createElement('img');
    if (imageData) {
        img.src = imageData;
    } else {
        img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23E8E8E8'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%23999'>Item Image</text></svg>";
    }
    img.alt = itemName;
    
    itemImageDiv.appendChild(img);
    
    // Create info element
    const itemInfoDiv = document.createElement('div');
    itemInfoDiv.className = 'item-info';
    
    const itemNameHeading = document.createElement('h3');
    itemNameHeading.className = 'item-name';
    itemNameHeading.textContent = itemName;
    
    const itemLocationPara = document.createElement('p');
    itemLocationPara.className = 'item-location';
    itemLocationPara.textContent = itemLocation;
    
    itemInfoDiv.appendChild(itemNameHeading);
    itemInfoDiv.appendChild(itemLocationPara);
    
    // Assemble the card
    itemCard.appendChild(itemImageDiv);
    itemCard.appendChild(itemInfoDiv);
    
    // Add to grid (at the beginning to show newest first)
    if (itemsGrid) {
        itemsGrid.insertBefore(itemCard, itemsGrid.firstChild);
        
        // If there are more than 4 items, remove the oldest one
        const itemCards = itemsGrid.querySelectorAll('.item-card');
        if (itemCards.length > 4) {
            itemsGrid.removeChild(itemCards[itemCards.length - 1]);
        }
    }
}

// Function to show empty state if no items
function checkEmptyState() {
    if (!itemsGrid || !emptyState) return;
    
    const itemCards = itemsGrid.querySelectorAll('.item-card');
    if (itemCards.length === 0) {
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
    }
}
// Load existing items from database (or localStorage for now)

async function loadExistingItems() {
    try {
        if (!itemsGrid) return;
        
        itemsGrid.innerHTML = '';
        
        const items = await databaseService.getRecentItems(4);
        
        if (items.length === 0) {
            checkEmptyState();
            return;
        }
        
        items.forEach(item => {
            addNewItem(item.title, item.location, item.image, item.id);
        });
        
        checkEmptyState();
    } catch (error) {
        console.error('Error loading items:', error);
        checkEmptyState();
    }
}

// Initialize recent items when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadExistingItems();
});