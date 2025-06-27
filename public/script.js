document.getElementById('lookup-btn').addEventListener('click', async () => {
    const userId = document.getElementById('user-id').value.trim();
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Clear previous results
    resultDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    
    if (!userId) {
        showError('Please enter a Discord User ID');
        return;
    }
    
    try {
        const response = await fetch(`/api/lookup?id=${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user data');
        }
        
        const userData = await response.json();
        displayUserData(userData);
    } catch (error) {
        showError(error.message);
    }
});

function displayUserData(user) {
    const resultDiv = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    
    // Set avatar
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`
        : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
    
    document.getElementById('avatar').src = avatarUrl;
    
    // Set username and discriminator
    document.getElementById('username').textContent = user.username;
    document.getElementById('discriminator').textContent = `#${user.discriminator}`;
    
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
    
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('hidden');
}
