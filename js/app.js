// Main app logic for reporting issues
const reportForm = document.getElementById('reportForm');
const loginPrompt = document.getElementById('loginPrompt');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const fileLabel = document.querySelector('.file-upload-label span');
const getLocationBtn = document.getElementById('getLocationBtn');
const locationStatus = document.getElementById('locationStatus');

// Geo-location handler
if (getLocationBtn) {
    getLocationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        locationStatus.textContent = 'Getting location...';
        getLocationBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('latitude').value = position.coords.latitude;
                document.getElementById('longitude').value = position.coords.longitude;
                locationStatus.textContent = `✓ Location captured (${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)})`;
                locationStatus.style.color = '#10B981';
                getLocationBtn.disabled = false;
                showToast('Location captured successfully', 'success');
            },
            (error) => {
                locationStatus.textContent = '✗ Failed to get location';
                locationStatus.style.color = '#EF4444';
                getLocationBtn.disabled = false;
                showToast('Could not get location. Please enable GPS.', 'error');
            }
        );
    });
}

// Check if user is logged in and show/hide form accordingly
async function checkLoginStatus() {
    const session = await checkAuth();
    
    if (session) {
        // User is logged in, show form
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (reportForm) reportForm.style.display = 'block';
    } else {
        // User is not logged in, show login prompt
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (reportForm) reportForm.style.display = 'none';
    }
}

// Call on page load
checkLoginStatus();

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navCloseBtn = document.getElementById('navCloseBtn');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

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
        // Only toggle off if it's currently active (prevents unnecessary logic on desktop)
        if (navMenu.classList.contains('active')) {
            toggleMenu(false);
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Skip if this is the auth link
        if (this.id === 'authLink') return;
        
        const href = this.getAttribute('href');
        // Skip if href is just "#" or "javascript:void(0)"
        if (href === '#' || href === 'javascript:void(0)') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Image preview
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                if (fileLabel) fileLabel.textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Form submission
if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const session = await checkAuth();
        if (!session) {
            showToast('Please login to submit a report', 'error');
            setTimeout(() => window.location.href = 'login.html', 1500);
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
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;
            const imageFile = imageInput.files[0];

            let beforeImageUrl = null;

            if (imageFile) {
                const fileName = `${Date.now()}_${imageFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(fileName);

                beforeImageUrl = publicUrl;
            }

            const { error: insertError } = await supabase
                .from('issues')
                .insert({
                    title,
                    description,
                    location,
                    area,
                    category,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    before_image_url: beforeImageUrl,
                    user_id: session.user.id,
                    status: 'Reported'
                });

            if (insertError) throw insertError;

            showToast('Issue reported successfully!', 'success');
            reportForm.reset();
            imagePreview.innerHTML = '';
            if (fileLabel) fileLabel.textContent = 'Choose before image';
            if (locationStatus) locationStatus.textContent = '';

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
}
