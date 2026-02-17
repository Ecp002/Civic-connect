// User dashboard logic
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const reportsGrid = document.getElementById('reportsGrid');

async function loadUserReports() {
    const session = await requireAuth();
    if (!session) return;

    try {
        const { data: issues, error } = await supabase
            .from('issues')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        loadingState.style.display = 'none';

        if (!issues || issues.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        reportsGrid.innerHTML = issues.map(issue => `
            <div class="report-item card">
                <div class="report-header">
                    <div>
                        <h3 class="report-title">${issue.title}</h3>
                        <p class="report-category">${issue.category}</p>
                    </div>
                    <span class="status-badge status-${issue.status.toLowerCase().replace(' ', '')}">${issue.status}</span>
                </div>
                <p class="report-description">${issue.description}</p>
                <div class="report-meta">
                    <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${issue.location}
                    </span>
                </div>
                
                <!-- Timeline -->
                <div style="background: #F3F4F6; padding: 12px; border-radius: 8px; margin: 12px 0; font-size: 13px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span><strong>Reported:</strong> ${new Date(issue.created_at).toLocaleDateString()}</span>
                    </div>
                    ${issue.processing_at ? `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                        </svg>
                        <span><strong>Processing:</strong> ${new Date(issue.processing_at).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                    ${issue.resolved_at ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span><strong>Resolved:</strong> ${new Date(issue.resolved_at).toLocaleDateString()}</span>
                    </div>
                    ` : ''}
                </div>
                
                <!-- Before/After Images -->
                <div style="display: grid; grid-template-columns: ${issue.after_image_url ? '1fr 1fr' : '1fr'}; gap: 12px; margin: 12px 0;">
                    ${issue.before_image_url ? `
                    <div>
                        <p style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">Before</p>
                        <img src="${issue.before_image_url}" alt="Before" class="report-image">
                    </div>
                    ` : ''}
                    ${issue.after_image_url ? `
                    <div>
                        <p style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">After</p>
                        <img src="${issue.after_image_url}" alt="After" class="report-image">
                    </div>
                    ` : ''}
                </div>
                
                <!-- Satisfaction Form (only if resolved and not yet rated) -->
                ${issue.status === 'Resolved' && !issue.satisfaction_status ? `
                <div style="background: #FEF3C7; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #92400E;">Rate this resolution</h4>
                    <p style="font-size: 13px; margin-bottom: 12px; color: #78350F;">Are you satisfied with the resolution?</p>
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <button onclick="window.submitFeedback('${issue.id}', 'Satisfied')" class="btn-primary btn-small">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Satisfied
                        </button>
                        <button onclick="window.submitFeedback('${issue.id}', 'Not Satisfied')" class="btn-secondary btn-small">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 4px;">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            Not Satisfied
                        </button>
                    </div>
                </div>
                ` : ''}
                
                <!-- Show feedback if already submitted -->
                ${issue.satisfaction_status ? `
                <div style="background: #F0FDF4; padding: 12px; border-radius: 8px; margin-top: 12px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #10B981;">Your Feedback</h4>
                    <p style="font-size: 13px; margin: 4px 0;"><strong>Status:</strong> ${issue.satisfaction_status}</p>
                    ${issue.satisfaction_rating ? `<p style="font-size: 13px; margin: 4px 0;"><strong>Rating:</strong> ${'⭐'.repeat(issue.satisfaction_rating)}</p>` : ''}
                    ${issue.feedback_text ? `<p style="font-size: 13px; margin: 4px 0;"><strong>Comment:</strong> ${issue.feedback_text}</p>` : ''}
                </div>
                ` : ''}
                
                <div style="margin-top: 12px;">
                    <a href="report-detail.html?id=${issue.id}" class="btn-secondary btn-small" style="text-decoration: none; display: inline-block;">View Full Details</a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load reports', 'error');
    }
}

// Submit satisfaction feedback
window.submitFeedback = async (issueId, satisfactionStatus) => {
    const rating = prompt(`Rate your satisfaction (1-5 stars):`);
    if (!rating || rating < 1 || rating > 5) {
        showToast('Please enter a valid rating between 1 and 5', 'error');
        return;
    }

    const feedbackText = prompt('Optional: Add a comment about the resolution:');

    try {
        const { error } = await supabase
            .from('issues')
            .update({
                satisfaction_status: satisfactionStatus,
                satisfaction_rating: parseInt(rating),
                feedback_text: feedbackText || null
            })
            .eq('id', issueId);

        if (error) throw error;

        showToast('Thank you for your feedback!', 'success');
        loadUserReports();

    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to submit feedback', 'error');
    }
};

loadUserReports();
