// // const express = require('express');
// // const cors = require('cors');
// // const { createClient } = require('@supabase/supabase-js');
// // require('dotenv').config();

// // const app = express();
// // const PORT = process.env.PORT || 5000;

// // // Initialize Supabase
// // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// // // Allow your frontend to talk to your backend
// // app.use(cors());
// // app.use(express.json());

// // // The Autocomplete Search Endpoint
// // app.get('/api/search', async (req, res) => {
// //     const query = req.query.q;
    
// //     if (!query || query.length < 2) {
// //         return res.json([]);
// //     }

// //     try {
// //         // Query the fuzzy search RPC function we made in Supabase
// //         const { data, error } = await supabase.rpc('search_pois', { search_text: query });

// //         if (error) throw error;

// //         // Return the clean search array back to the frontend
// //         return res.json(data);
// //     } catch (error) {
// //         console.error('Search API Error:', error);
// //         return res.status(500).json({ error: 'Internal server error' });
// //     }
// // });

// // // Start the server
// // app.listen(PORT, () => {
// //     console.log(`🚀 Bykea Core Engine running on port ${PORT}`);
// // });


// // if (process.env.NODE_ENV !== 'production') {
// //     app.listen(PORT, () => {
// //         console.log(`🚀 Bykea Core Engine running locally on port ${PORT}`);
// //     });
// // }

// // // Export for Vercel Serverless environment
// // module.exports = app;


// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const Fuse = require('fuse.js');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// // 1. Load your clean Gemini JSON data straight from the file system
// const dataPath = path.join(__dirname, 'karachi_clean.json');
// let pois = [];

// try {
//     pois = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
//     console.log(`📦 Loaded ${pois.length} POIs successfully into server memory.`);
// } catch (error) {
//     console.error("❌ Failed to read karachi_clean.json:", error);
// }

// // 2. Configure Fuse.js for heavy-duty fuzzy matching matching Bykea's constraints
// const fuseOptions = {
//     keys: ['name', 'keywords', 'amenity'], // Fields to scan
//     threshold: 0.4, // Lower = stricter matching, Higher = more forgiving typos
//     includeScore: true
// };

// const fuse = new Fuse(pois, fuseOptions);

// // 3. The Core Search Endpoint
// app.get('/api/search', (req, res) => {
//     const query = req.query.q;
    
//     if (!query || query.length < 2) {
//         return res.json([]);
//     }

//     console.time(`⏱️ In-Memory Search for "${query}"`);
    
//     // Perform the fuzzy search execution
//     const searchResults = fuse.search(query);
    
//     console.timeEnd(`⏱️ In-Memory Search for "${query}"`);

//     // Format results to match your original front-end expectations
//     const responseData = searchResults.slice(0, 5).map(result => ({
//         id: result.refIndex, // Unique fallback index id
//         name_clean: result.item.name,
//         category: result.item.amenity,
//         alternative_names: result.item.keywords.join(', '),
//         latitude: result.item.latitude,
//         longitude: result.item.longitude
//     }));

//     return res.json(responseData);
// });

// // Root route for sanity check
// app.get('/', (req, res) => {
//     res.send('🚀 Bykea In-Memory Search Engine is live!');
// });

// if (process.env.NODE_ENV !== 'production') {
//     app.listen(PORT, () => {
//         console.log(`🔥 Database-Free Engine running on http://localhost:${PORT}`);
//     });
// }

// module.exports = app;


// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const path = require('path');
// const Fuse = require('fuse.js');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // 1. Fully unlock CORS using the middleware for standard requests
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
// }));

// // 2. Explicit manual override headers to force Vercel's edge network to play nice
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
//     res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
//     // Intercept preflight OPTIONS requests instantly before hitting any routing logic
//     if (req.method === 'OPTIONS') {
//         return res.status(200).end();
//     }
//     next();
// });

// app.use(express.json());

// // 3. Load your clean Gemini JSON data straight from the file system
// const dataPath = path.join(__dirname, 'karachi_clean.json');
// let pois = [];

// try {
//     pois = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
//     console.log(`📦 Loaded ${pois.length} POIs successfully into server memory.`);
// } catch (error) {
//     console.error("❌ Failed to read karachi_clean.json:", error);
// }

// // 4. Configure Fuse.js for heavy-duty fuzzy matching matching Bykea's constraints
// const fuseOptions = {
//     keys: ['name', 'keywords', 'amenity'], // Fields to scan
//     threshold: 0.4, // Lower = stricter matching, Higher = more forgiving typos
//     includeScore: true
// };

// const fuse = new Fuse(pois, fuseOptions);

// // 5. The Core Search Endpoint
// app.get('/api/search', (req, res) => {
//     const query = req.query.q;
    
//     if (!query || query.length < 2) {
//         return res.json([]);
//     }

//     console.time(`⏱️ In-Memory Search for "${query}"`);
    
//     // Perform the fuzzy search execution
//     const searchResults = fuse.search(query);
    
//     console.timeEnd(`⏱️ In-Memory Search for "${query}"`);

//     // Format results to match your frontend autocomplete expectations
//     const responseData = searchResults.slice(0, 5).map(result => ({
//         id: result.refIndex, // Unique fallback index id
//         name_clean: result.item.name,
//         category: result.item.amenity,
//         alternative_names: result.item.keywords.join(', '),
//         latitude: result.item.latitude,
//         longitude: result.item.longitude
//     }));

//     return res.json(responseData);
// });

// // Root route for sanity check
// app.get('/', (req, res) => {
//     res.send('🚀 Bykea In-Memory Search Engine is live!');
// });

// // Start listening locally if not on production Vercel servers
// if (process.env.NODE_ENV !== 'production') {
//     app.listen(PORT, () => {
//         console.log(`🔥 Database-Free Engine running on http://localhost:${PORT}`);
//     });
// }

// // Export the application factory instance for Vercel's Serverless Wrapper
// module.exports = app;



const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Fully unlock CORS using the middleware for standard requests
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Explicit manual override headers to force Vercel's edge network to play nice
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Intercept preflight OPTIONS requests instantly before hitting any routing logic
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json());

// 3. Serverless Friendly File Loading Resolution
// process.cwd() forces Vercel to find the file relative to the root project directory
const dataPath = path.join(process.cwd(), 'karachi_clean.json');
let pois = [];

try {
    pois = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`📦 Loaded ${pois.length} POIs successfully into server memory.`);
} catch (error) {
    console.error("❌ Failed to read karachi_clean.json:", error);
}

// 4. Configure Fuse.js for heavy-duty fuzzy matching matching Bykea's constraints
const fuseOptions = {
    keys: ['name', 'keywords', 'amenity'], // Fields to scan
    threshold: 0.4, // Lower = stricter matching, Higher = more forgiving typos
    includeScore: true
};

const fuse = new Fuse(pois, fuseOptions);

// 5. The Core Search Endpoint
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    
    if (!query || query.length < 2) {
        return res.json([]);
    }

    console.time(`⏱️ In-Memory Search for "${query}"`);
    
    // Perform the fuzzy search execution
    const searchResults = fuse.search(query);
    
    console.timeEnd(`⏱️ In-Memory Search for "${query}"`);

    // Format results to match your frontend autocomplete expectations
    const responseData = searchResults.slice(0, 5).map(result => ({
        id: result.refIndex, // Unique fallback index id
        name_clean: result.item.name,
        category: result.item.amenity,
        alternative_names: result.item.keywords.join(', '),
        latitude: result.item.latitude,
        longitude: result.item.longitude
    }));

    return res.json(responseData);
});

// Root route for sanity check
app.get('/', (req, res) => {
    res.send('🚀 Bykea In-Memory Search Engine is live!');
});

// Start listening locally if not on production Vercel servers
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🔥 Database-Free Engine running on http://localhost:${PORT}`);
    });
}

// Export the application factory instance for Vercel's Serverless Wrapper
module.exports = app;