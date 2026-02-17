// Authentication utilities
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function checkAdminAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        showToast('Access denied. Admin only.', 'error');
        window.location.href = 'index.html';
        return null;
    }

    return session;
}

async function requireAuth() {
    const session = await checkAuth();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return session;
}

// Update auth link in navigation
async function updateAuthLink() {
    const authLink = document.getElementById('authLink');
    if (!authLink) return;

    const session = await checkAuth();
    
    if (session) {
        authLink.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"></path>
            </svg>
            Logout
        `;
        authLink.href = 'javascript:void(0)';
        authLink.style.cursor = 'pointer';
        authLink.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await supabase.auth.signOut();
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        };
    } else {
        authLink.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Login
        `;
        authLink.href = 'login.html';
        authLink.style.cursor = 'pointer';
        authLink.onclick = (e) => {
            e.stopPropagation();
            // Let the default link behavior work
        };
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize auth link on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAuthLink);
} else {
    updateAuthLink();
}
