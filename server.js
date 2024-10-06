// Import required packages
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const cors = require('cors');

// Initialize Express and Discord bot
const app = express();
const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Discord bot login
bot.login(process.env.DISCORD_BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*'  // Change this to your frontend URL for better security
}));

// Endpoint to assign timezone role
app.post('/assign-role', async (req, res) => {
    const { userId, gmtOffset } = req.body;

    if (!userId || !gmtOffset) {
        return res.status(400).json({ message: 'Missing userId or gmtOffset' });
    }

    try {
        const guild = await bot.guilds.fetch(process.env.GUILD_ID);
        const member = await guild.members.fetch(userId);

        if (!member) {
            return res.status(404).json({ message: 'User not found in the guild' });
        }

        // Define role name based on GMT offset
        const roleName = `GMT${gmtOffset >= 0 ? `+${gmtOffset}` : gmtOffset}`;

        // Find or create the role
        let role = guild.roles.cache.find(r => r.name === roleName);
        if (!role) {
            role = await guild.roles.create({
                name: roleName,
                color: 'BLUE', // You can change the color
                reason: 'Timezone role for user',
            });
        }

        // Assign the role to the user
        await member.roles.add(role);
        res.json({ message: `Role ${roleName} assigned to user ${userId}` });
    } catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
