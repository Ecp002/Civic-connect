// Signup page logic
const signupForm = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    signupBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';

    try {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) throw error;

        await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                full_name: name,
                email: email,
                role: 'citizen'
            });

        showToast('Account created successfully!', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);

    } catch (error) {
        console.error('Error:', error);
        showToast(error.message || 'Signup failed. Please try again.', 'error');
    } finally {
        signupBtn.disabled = false;
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
    }
});
