const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Allow your frontend to talk to your backend
app.use(cors());
app.use(express.json());

// The Autocomplete Search Endpoint
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    
    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        // Query the fuzzy search RPC function we made in Supabase
        const { data, error } = await supabase.rpc('search_pois', { search_text: query });

        if (error) throw error;

        // Return the clean search array back to the frontend
        return res.json(data);
    } catch (error) {
        console.error('Search API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Bykea Core Engine running on port ${PORT}`);
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Bykea Core Engine running locally on port ${PORT}`);
    });
}

// Export for Vercel Serverless environment
module.exports = app;