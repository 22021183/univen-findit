// Report Tab Functionality
function initializeReportSection() {
    const reportLostTab = document.getElementById('report-lost-tab');
    const reportFoundTab = document.getElementById('report-found-tab');
    const lostItemForm = document.getElementById('lost-item-form');
    const foundItemForm = document.getElementById('found-item-form');
    const lostLocationInput = document.getElementById('lost-location-input');
    const foundLocationInput = document.getElementById('found-location-input');
    
    if (!reportLostTab || !reportFoundTab) return;
    
    // Set up location placeholders
    if (lostLocationInput) lostLocationInput.placeholder = "Lost at [Location]";
    if (foundLocationInput) foundLocationInput.placeholder = "Found at [Location]";
    
    // Tab switching
    reportLostTab.addEventListener('click', function() {
        this.classList.add('active');
        reportFoundTab.classList.remove('active');
        if (lostItemForm) lostItemForm.classList.add('active');
        if (foundItemForm) foundItemForm.classList.remove('active');
    });
    
    reportFoundTab.addEventListener('click', function() {
        this.classList.add('active');
        reportLostTab.classList.remove('active');
        if (foundItemForm) foundItemForm.classList.add('active');
        if (lostItemForm) lostItemForm.classList.remove('active');
    });
    
    // Form submission
    if (lostItemForm) {
        lostItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitItem('lost');
        });
    }
    
    if (foundItemForm) {
        foundItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitItem('found');
        });
    }
    
    // Setup image upload for both forms
    setupImageUpload('lost');
    setupImageUpload('found');
}


// Submit item (lost or found)
async function submitItem(type) {
    try {

       const user = databaseService.getCurrentUser();
        if (!user) {
            alert('Please log in to report an item');
            window.location.href = 'login.html';
            return;
        }

        const form = type === 'lost' ? document.getElementById('lost-item-form') : document.getElementById('found-item-form');
        if (!form) return;
        
        const title = form.querySelector('input[placeholder="Item Name"]').value;
        const category = form.querySelector('.category-select').value;
        
        const lostLocationInput = document.getElementById('lost-location-input');
        const foundLocationInput = document.getElementById('found-location-input');
        
        const location = type === 'lost' ? 
            `Lost at ${lostLocationInput.value.replace('Lost at ', '')}` : 
            `Found at ${foundLocationInput.value.replace('Found at ', '')}`;
        
        const date = form.querySelector('input[type="date"]').value;
        const contact = form.querySelector('input[placeholder="Email or phone number"]').value;
        const description = form.querySelector('textarea').value;
        
        // Get image data
        const previewContainer = type === 'lost' ? 
            document.getElementById('preview-container-lost') : 
            document.getElementById('preview-container-found');
        const imageElement = previewContainer ? previewContainer.querySelector('img') : null;
        const imageData = imageElement ? imageElement.src : null;
        
        // Validation
        if (!title || !category || !location || !date || !contact || !description) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create item object
        const itemData = {
            title,
            category,
            location,
            date,
            contact,
            description,
            type,
            image: imageData
        };
        
        // Save to database (currently localStorage, later Firebase)
        const newItem = await databaseService.addItem(itemData);
        
        // Show success message
        alert(`${type === 'lost' ? 'Lost' : 'Found'} item submitted successfully!`);
        
        // Reset form
        form.reset();
        
        // Clear image preview
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
            
            const uploadContent = type === 'lost' ? 
                document.querySelector('#image-upload-lost .upload-content') : 
                document.querySelector('#image-upload-found .upload-content');
            if (uploadContent) uploadContent.style.display = 'block';
        }
        
        // Add to recent items
        if (typeof addNewItem === 'function') {
            addNewItem(newItem.title, newItem.location, newItem.image, newItem.id);
        }
        
    } catch (error) {
        console.error('Error submitting item:', error);
        alert('Error: ' + error.message);
    }
}
function saveItem(item, type) {
    const key = type === 'lost' ? 'lostItems' : 'foundItems';
    const items = JSON.parse(localStorage.getItem(key)) || [];
    items.push(item);
    localStorage.setItem(key, JSON.stringify(items));
}

// Image upload functionality
function setupImageUpload(type) {
    const imageUpload = document.getElementById(`image-upload-${type}`);
    const fileInput = document.getElementById(`file-input-${type}`);
    const previewContainer = document.getElementById(`preview-container-${type}`);
    
    if (!imageUpload || !fileInput || !previewContainer) return;
    
    const uploadContent = imageUpload.querySelector('.upload-content');
    
    imageUpload.addEventListener('click', (e) => {
        if (!e.target.closest('.preview-container') && !e.target.classList.contains('remove-image')) {
            fileInput.click();
        }
    });
    
    fileInput.addEventListener('change', function() {
        handleFiles(this.files, type);
    });
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        imageUpload.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        imageUpload.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        imageUpload.addEventListener(eventName, unhighlight, false);
    });
    
    imageUpload.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files, type);
    }
    
    function handleFiles(files, type) {
        if (files.length > 0) {
            const file = files[0];
            
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Maximum size is 5MB.');
                return;
            }
            
            const reader = new FileReader();
            const previewContainer = document.getElementById(`preview-container-${type}`);
            const uploadContent = document.querySelector(`#image-upload-${type} .upload-content`);
            
            reader.onload = function(e) {
                uploadContent.style.display = 'none';
                previewContainer.style.display = 'block';
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <p class="remove-image" onclick="removeImage('${type}')">Remove image</p>
                `;
            };
            
            reader.readAsDataURL(file);
        }
    }
}

function removeImage(type) {
    const previewContainer = document.getElementById(`preview-container-${type}`);
    const uploadContent = document.querySelector(`#image-upload-${type} .upload-content`);
    const fileInput = document.getElementById(`file-input-${type}`);
    
    if (fileInput) fileInput.value = '';
    if (previewContainer) {
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
    }
    if (uploadContent) uploadContent.style.display = 'block';
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    this.classList.add('drag-over');
}

function unhighlight() {
    this.classList.remove('drag-over');
}

// Initialize report section when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeReportSection();
});