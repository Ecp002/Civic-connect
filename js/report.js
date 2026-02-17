// Report form logic with interactive map
let reportMap = null;
let marker = null;
let selectedLat = null;
let selectedLng = null;

// Initialize map
function initReportMap() {
    // Default center (India)
    reportMap = L.map('reportMap').setView([20.5937, 78.9629], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(reportMap);

    // Try to get user's current location
    if (navigator.geolocation) {
        showToast('Getting your location...', 'success');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Set map view
                reportMap.setView([lat, lng], 15);
                
                // Automatically set the location
                selectedLat = lat;
                selectedLng = lng;
                
                // Update hidden inputs
                document.getElementById('latitude').value = selectedLat;
                document.getElementById('longitude').value = selectedLng;
                
                // Update display
                document.getElementById('coordsDisplay').textContent = 
                    `${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`;
                document.getElementById('locationStatus').textContent = 'Current location marked ✓';
                document.getElementById('locationStatus').style.color = '#10B981';
                
                // Add marker at current location
                const markerIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: #EF4444; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); transform: rotate(-45deg);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div></div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });
                
                marker = L.marker([lat, lng], { icon: markerIcon }).addTo(reportMap);
                
                showToast('Location automatically marked. Click map to change.', 'success');
            },
            (error) => {
                console.log('Geolocation error:', error);
                showToast('Could not get your location. Please click on the map.', 'error');
            }
        );
    } else {
        showToast('Geolocation not supported. Please click on the map.', 'error');
    }

    // Click on map to set location
    reportMap.on('click', function(e) {
        selectedLat = e.latlng.lat;
        selectedLng = e.latlng.lng;
        
        // Update hidden inputs
        document.getElementById('latitude').value = selectedLat;
        document.getElementById('longitude').value = selectedLng;
        
        // Update display
        document.getElementById('coordsDisplay').textContent = 
            `${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`;
        document.getElementById('locationStatus').textContent = 'Location set ✓';
        document.getElementById('locationStatus').style.color = '#10B981';
        
        // Remove existing marker
        if (marker) {
            reportMap.removeLayer(marker);
        }
        
        // Add new marker
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #EF4444; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); transform: rotate(-45deg);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
        
        marker = L.marker([selectedLat, selectedLng], { icon: markerIcon }).addTo(reportMap);
        
        showToast('Location marked on map', 'success');
    });
}

// Image upload handling
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');

imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            showToast('Image size should be less than 10MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            uploadArea.classList.add('has-image');
            imagePreview.style.display = 'block';
            imagePreview.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="remove-image" onclick="removeImage()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#1E3A8A';
    uploadArea.style.background = '#F0F4FF';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#D1D5DB';
    uploadArea.style.background = '#F9FAFB';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#D1D5DB';
    uploadArea.style.background = '#F9FAFB';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;
        imageInput.dispatchEvent(new Event('change'));
    }
});

window.removeImage = function() {
    imageInput.value = '';
    imagePreview.style.display = 'none';
    imagePreview.innerHTML = '';
    uploadArea.classList.remove('has-image');
};

// Form submission
const reportForm = document.getElementById('reportForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

reportForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check authentication
    const session = await checkAuth();
    if (!session) {
        showToast('Please login to submit a report', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // Validate location
    if (!selectedLat || !selectedLng) {
        showToast('Please select a location on the map', 'error');
        document.getElementById('reportMap').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Validate image
    if (!imageInput.files[0]) {
        showToast('Please upload a before image', 'error');
        return;
    }

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    try {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const location = document.getElementById('location').value;
        const area = document.getElementById('area').value;
        const category = document.getElementById('category').value;
        const imageFile = imageInput.files[0];

        // Upload image
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(fileName);

        // Insert issue
        const { error: insertError } = await supabase
            .from('issues')
            .insert({
                title,
                description,
                location,
                area,
                category,
                latitude: selectedLat,
                longitude: selectedLng,
                before_image_url: publicUrl,
                user_id: session.user.id,
                status: 'Reported'
            });

        if (insertError) throw insertError;

        showToast('Issue reported successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to submit report. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
});

// Mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navCloseBtn = document.getElementById('navCloseBtn');
const navMenu = document.getElementById('navMenu');

// Create overlay element if it doesn't exist
let menuOverlay = document.querySelector('.menu-overlay');
if (!menuOverlay) {
    menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);
}

function toggleMenu(show) {
    const isActive = show !== undefined ? show : !navMenu.classList.contains('active');
    
    if (isActive) {
        navMenu.classList.add('active');
        mobileMenuBtn.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.classList.add('menu-open');
    } else {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
}

if (navCloseBtn) {
    navCloseBtn.addEventListener('click', () => {
        toggleMenu(false);
    });
}

// Close menu when clicking on overlay
menuOverlay.addEventListener('click', () => {
    toggleMenu(false);
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
            toggleMenu(false);
        }
    });
});

// Initialize map when page loads
window.addEventListener('load', () => {
    initReportMap();
});

// Check login status
async function checkLoginStatus() {
    const session = await checkAuth();
    if (!session) {
        showToast('Please login to report an issue', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
    }
}

checkLoginStatus();
