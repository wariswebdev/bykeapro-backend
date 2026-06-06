const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function autocompleteSearch(query) {
    console.time(`⏱️ Search execution time for "${query}"`);

    // Call the fuzzy search RPC function we just created
    const { data, error } = await supabase.rpc('search_pois', { search_text: query });

    if (error) {
        console.error('❌ Search failed:', error);
        return;
    }

    console.timeEnd(`⏱️ Search execution time for "${query}"`);
    console.log(`\n🔎 Top Results Found:`);
    console.table(data.map(item => ({
        Name: item.name_clean,
        Category: item.category,
        Matches: item.alternative_names
    })));
}

// Simulate a user typing with a bad typo or using alternative phrases
async function runTests() {
    await autocompleteSearch('duncan');  // Typo for Dunkin' Donuts
    await autocompleteSearch('شیل');    // Urdu script for Shell
    await autocompleteSearch('k-bees');  // Alternative phrasing for Kaybees
}

runTests();