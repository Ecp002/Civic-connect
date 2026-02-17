// Admin dashboard logic
const loadingState = document.getElementById('loadingState');
const reportsTable = document.getElementById('reportsTable');
const statusFilter = document.getElementById('statusFilter');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');

let allIssues = [];
let map = null;
let markers = [];
let issueMap = null;
let issueMarker = null;

// Initialize map
function initMap() {
    map = L.map('map').setView([20.5937, 78.9629], 5); // Default to India center
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Add markers to map
function updateMap(issues) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    const issuesWithLocation = issues.filter(i => i.latitude && i.longitude);
    
    if (issuesWithLocation.length === 0) return;

    // Add markers
    issuesWithLocation.forEach(issue => {
        const color = issue.status === 'Reported' ? '#EF4444' : 
                     issue.status === 'Processing' ? '#F59E0B' : '#10B981';
        
        const marker = L.circleMarker([issue.latitude, issue.longitude], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px;">${issue.title}</h3>
                <p style="margin: 4px 0; font-size: 12px; color: #6B7280;">${issue.area || issue.location}</p>
                <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: ${color}; color: white; margin: 4px 0;">${issue.status}</span>
                <br>
                <button onclick="window.viewIssue('${issue.id}')" style="margin-top: 8px; padding: 4px 12px; background: #1E3A8A; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">View Details</button>
            </div>
        `);

        markers.push(marker);
    });

    // Fit map to markers
    if (issuesWithLocation.length > 0) {
        const bounds = L.latLngBounds(issuesWithLocation.map(i => [i.latitude, i.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

async function loadAdminDashboard() {
    const session = await checkAdminAuth();
    if (!session) return;

    // Initialize map
    initMap();

    try {
        // Fetch issues
        const { data: issues, error: issuesError } = await supabase
            .from('issues')
            .select('*')
            .order('created_at', { ascending: false });

        if (issuesError) throw issuesError;

        // Fetch all user profiles
        const userIds = [...new Set(issues.map(i => i.user_id))];
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);

        if (profilesError) throw profilesError;

        // Map profiles to issues
        const profileMap = {};
        profiles.forEach(p => {
            profileMap[p.id] = p;
        });

        allIssues = issues.map(issue => ({
            ...issue,
            profiles: profileMap[issue.user_id] || null
        }));

        updateStats(allIssues);
        updateMap(allIssues);
        displayIssues(allIssues);
        loadingState.style.display = 'none';

    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load dashboard', 'error');
        loadingState.style.display = 'none';
    }
}

function updateStats(issues) {
    document.getElementById('totalReports').textContent = issues.length;
    document.getElementById('pendingReports').textContent = issues.filter(i => i.status === 'Reported').length;
    document.getElementById('inProgressReports').textContent = issues.filter(i => i.status === 'Processing').length;
    document.getElementById('resolvedReports').textContent = issues.filter(i => i.status === 'Resolved').length;
}

function displayIssues(issues) {
    if (!issues || issues.length === 0) {
        reportsTable.innerHTML = '<div class="empty-state"><p>No reports found</p></div>';
        return;
    }

    reportsTable.innerHTML = issues.map(issue => `
        <div class="table-item">
            <div>
                <div class="item-title">${issue.title}</div>
                <div class="item-subtitle">${issue.profiles?.full_name || 'Unknown'} • ${issue.category}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${issue.location}</span>
            </div>
            <div><span class="status-badge status-${issue.status.toLowerCase().replace(' ', '')}">${issue.status}</span></div>
            <div class="item-subtitle">${new Date(issue.created_at).toLocaleDateString()}</div>
            <div class="item-actions">
                <button class="btn-secondary btn-small" onclick="window.viewIssue('${issue.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                </button>
            </div>
        </div>
    `).join('');
}

statusFilter.addEventListener('change', (e) => {
    const filter = e.target.value;
    const filtered = filter === 'all' ? allIssues : allIssues.filter(i => i.status === filter);
    displayIssues(filtered);
    updateMap(filtered);
});

window.viewIssue = async (issueId) => {
    const issue = allIssues.find(i => i.id === issueId);
    if (!issue) return;

    // Highlight marker on map
    if (issue.latitude && issue.longitude) {
        map.setView([issue.latitude, issue.longitude], 15);
    }

    // Timeline HTML
    const timelineHTML = `
        <div style="background: #F3F4F6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Timeline
            </h3>
            <div style="display: flex; flex-direction: column; gap: 10px; padding-left: 8px; border-left: 3px solid #E5E7EB;">
                <div style="display: flex; align-items: start; gap: 12px; padding-left: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #FEE2E2; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">Reported</div>
                        <div style="font-size: 13px; color: #6B7280;">${new Date(issue.created_at).toLocaleString()}</div>
                    </div>
                </div>
                ${issue.processing_at ? `
                <div style="display: flex; align-items: start; gap: 12px; padding-left: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #FEF3C7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">Processing Started</div>
                        <div style="font-size: 13px; color: #6B7280;">${new Date(issue.processing_at).toLocaleString()}</div>
                    </div>
                </div>
                ` : ''}
                ${issue.resolved_at ? `
                <div style="display: flex; align-items: start; gap: 12px; padding-left: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #D1FAE5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #111827; margin-bottom: 2px;">Resolved</div>
                        <div style="font-size: 13px; color: #6B7280;">${new Date(issue.resolved_at).toLocaleString()}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;

    modalBody.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
            <div>
                <h2 style="margin: 0 0 8px 0;">${issue.title}</h2>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <span class="status-badge status-${issue.status.toLowerCase().replace(' ', '')}">${issue.status}</span>
                    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; background: #F3F4F6; border-radius: 12px; font-size: 13px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${issue.category}
                    </span>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; padding: 16px; background: #F9FAFB; border-radius: 8px;">
            <div>
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">Location</div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style="font-weight: 500;">${issue.location}</span>
                </div>
            </div>
            ${issue.area ? `
            <div>
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">Area</div>
                <div style="font-weight: 500;">${issue.area}</div>
            </div>
            ` : ''}
            ${issue.latitude && issue.longitude ? `
            <div>
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">GPS Coordinates</div>
                <div style="font-family: monospace; font-size: 13px;">${issue.latitude.toFixed(6)}, ${issue.longitude.toFixed(6)}</div>
            </div>
            ` : ''}
            <div>
                <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px; text-transform: uppercase; font-weight: 600;">Reported By</div>
                <div style="font-weight: 500;">${issue.profiles?.full_name || 'Unknown'}</div>
                <div style="font-size: 12px; color: #6B7280;">${issue.profiles?.email || 'N/A'}</div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px; text-transform: uppercase; font-weight: 600;">Description</div>
            <p style="margin: 0; line-height: 1.6; color: #374151;">${issue.description}</p>
        </div>
        
        ${issue.latitude && issue.longitude ? `
        <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Location Map
            </h3>
            <div id="issueMap" style="height: 350px; border-radius: 8px; border: 2px solid #E5E7EB;"></div>
        </div>
        ` : ''}
        
        ${timelineHTML}
        
        <div style="margin: 16px 0;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                Photographic Evidence
            </h3>
            <div class="evidence-images-container">
                ${issue.before_image_url ? `
                <div class="evidence-image-wrapper">
                    <div class="evidence-label before-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        Before Resolution
                    </div>
                    <img src="${issue.before_image_url}" alt="Before" class="evidence-image">
                </div>
                ` : ''}
                ${issue.after_image_url ? `
                <div class="evidence-image-wrapper">
                    <div class="evidence-label after-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        After Resolution
                    </div>
                    <img src="${issue.after_image_url}" alt="After" class="evidence-image">
                </div>
                ` : ''}
            </div>
        </div>
        
        ${issue.satisfaction_status ? `
        <div style="background: linear-gradient(135deg, #F0FDF4 0%, #D1FAE5 100%); padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10B981;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #065F46; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Citizen Feedback
            </h4>
            <div style="display: grid; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 600; color: #065F46;">Status:</span>
                    <span style="padding: 4px 12px; background: white; border-radius: 12px; font-size: 13px; font-weight: 500;">${issue.satisfaction_status}</span>
                </div>
                ${issue.satisfaction_rating ? `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-weight: 600; color: #065F46;">Rating:</span>
                    <span style="font-size: 16px;">${'⭐'.repeat(issue.satisfaction_rating)} <span style="color: #6B7280; font-size: 13px;">(${issue.satisfaction_rating}/5)</span></span>
                </div>
                ` : ''}
                ${issue.feedback_text ? `
                <div>
                    <span style="font-weight: 600; color: #065F46;">Comment:</span>
                    <p style="margin: 4px 0 0 0; color: #047857; font-style: italic;">"${issue.feedback_text}"</p>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #E5E7EB;">
            <h4 style="margin: 0 0 12px 0; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                </svg>
                Update Status
            </h4>
            ${!issue.after_image_url && issue.status !== 'Reported' ? `
            <div style="margin-bottom: 12px; padding: 12px; background: #FEF3C7; border-radius: 6px; border-left: 3px solid #F59E0B;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 600; color: #92400E;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Upload After Image (Required for Resolved)
                </label>
                <input type="file" id="afterImageInput" accept="image/*" class="input" style="font-size: 14px;">
            </div>
            ` : ''}
            <div class="modal-actions">
                <button class="btn-secondary btn-small" onclick="window.updateStatus('${issue.id}', 'Reported')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Reported
                </button>
                <button class="btn-warning btn-small" onclick="window.updateStatus('${issue.id}', 'Processing')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    Processing
                </button>
                <button class="btn-primary btn-small" onclick="window.updateStatus('${issue.id}', 'Resolved')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Resolved
                </button>
            </div>
        </div>
    `;

    modal.classList.add('show');
    
    // Initialize issue map if coordinates exist
    if (issue.latitude && issue.longitude) {
        // Wait for modal to be fully rendered
        setTimeout(() => {
            const mapContainer = document.getElementById('issueMap');
            if (!mapContainer) {
                console.error('Map container not found');
                return;
            }
            
            // Remove existing map if any
            if (issueMap) {
                issueMap.remove();
                issueMap = null;
            }
            
            try {
                // Initialize map
                issueMap = L.map('issueMap', {
                    center: [issue.latitude, issue.longitude],
                    zoom: 16,
                    scrollWheelZoom: true,
                    dragging: true
                });
                
                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(issueMap);
                
                // Determine marker color based on status
                const color = issue.status === 'Reported' ? '#EF4444' : 
                             issue.status === 'Processing' ? '#F59E0B' : '#10B981';
                
                // Create custom marker
                const markerIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4); transform: rotate(-45deg);"><div style="width: 10px; height: 10px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div></div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });
                
                // Add marker
                issueMarker = L.marker([issue.latitude, issue.longitude], {
                    icon: markerIcon
                }).addTo(issueMap);
                
                // Add popup
                issueMarker.bindPopup(`
                    <div style="text-align: center; padding: 4px;">
                        <strong style="font-size: 14px;">${issue.title}</strong><br>
                        <span style="font-size: 12px; color: #6B7280;">${issue.location}</span>
                    </div>
                `).openPopup();
                
                // Force map to recalculate size
                setTimeout(() => {
                    issueMap.invalidateSize();
                }, 100);
                
                console.log('Map initialized successfully at', issue.latitude, issue.longitude);
            } catch (error) {
                console.error('Error initializing map:', error);
            }
        }, 250);
    }
};

document.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('show');
    if (issueMap) {
        issueMap.remove();
        issueMap = null;
    }
});

window.updateStatus = async (issueId, newStatus) => {
    try {
        const issue = allIssues.find(i => i.id === issueId);
        
        // Check if after image is required
        if (newStatus === 'Resolved' && !issue.after_image_url) {
            const afterImageInput = document.getElementById('afterImageInput');
            if (!afterImageInput || !afterImageInput.files[0]) {
                showToast('After image is required to mark as Resolved', 'error');
                return;
            }

            // Upload after image
            const file = afterImageInput.files[0];
            const fileName = `after_${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('myfiles')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('myfiles')
                .getPublicUrl(fileName);

            // Update with after image and status
            const updateData = {
                status: newStatus,
                after_image_url: publicUrl,
                resolved_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('issues')
                .update(updateData)
                .eq('id', issueId);

            if (error) throw error;
        } else {
            // Update status only
            const updateData = { status: newStatus };
            
            if (newStatus === 'Processing' && !issue.processing_at) {
                updateData.processing_at = new Date().toISOString();
            } else if (newStatus === 'Resolved' && !issue.resolved_at) {
                updateData.resolved_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('issues')
                .update(updateData)
                .eq('id', issueId);

            if (error) throw error;
        }

        showToast('Status updated successfully', 'success');
        modal.classList.remove('show');
        loadAdminDashboard();

    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to update status', 'error');
    }
};

loadAdminDashboard();
