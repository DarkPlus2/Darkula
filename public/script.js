document.addEventListener('DOMContentLoaded', () => {
    const lookupBtn = document.getElementById('lookup-btn');
    const userIdInput = document.getElementById('user-id');
    
    // Handle button click
    lookupBtn.addEventListener('click', handleLookup);
    
    // Handle Enter key press
    userIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLookup();
        }
    });
});

async function handleLookup() {
    const userId = document.getElementById('user-id').value.trim();
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const loader = document.getElementById('loader');
    
    // Clear previous results
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
    
    if (!userId) {
        showError('Please enter a Discord User ID');
        return;
    }
    
    // Show loader
    loader.classList.remove('hidden');
    
    try {
        const response = await fetch(`/api/lookup?id=${encodeURIComponent(userId)}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch user data');
        }
        
        displayUserData(data.data);
    } catch (error) {
        showError(error.message);
    } finally {
        // Hide loader
        loader.classList.add('hidden');
    }
}

function displayUserData(user) {
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Set avatar
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
    
    document.getElementById('avatar').src = avatarUrl;
    
    // Set username and discriminator
    document.getElementById('username').textContent = user.username || 'Unknown';
    document.getElementById('discriminator').textContent = user.discriminator ? `#${user.discriminator}` : '';
    
    // Set other details
    document.getElementById('user-id-display').textContent = user.id;
    
    const creationDate = new Date(parseInt(user.id) / 4194304 + 1420070400000);
    document.getElementById('creation-date').textContent = creationDate.toLocaleString();
    
    document.getElementById('public-flags').textContent = user.public_flags || 'None';
    
    // Show result
    resultDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}
