const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }
    
    try {
        const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ message: 'User not found' });
            }
            throw new Error(`Discord API returned ${response.status}`);
        }
        
        const userData = await response.json();
        return res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
