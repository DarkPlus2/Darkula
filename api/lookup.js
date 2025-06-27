const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ 
            success: false,
            message: 'User ID is required' 
        });
    }
    
    // Validate Discord ID format (18-digit number)
    if (!/^\d{17,20}$/.test(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Discord ID format'
        });
    }

    try {
        const response = await fetch(`https://discord.com/api/v9/users/${id}`, {
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }
            throw new Error(`Discord API returned ${response.status}`);
        }
        
        const userData = await response.json();
        return res.status(200).json({
            success: true,
            data: userData
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};
