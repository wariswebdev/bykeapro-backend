const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
require('dotenv').config();

// Initialize the free Gemini tier
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Load your newly saved Shahrah-e-Faisal data
const rawData = JSON.parse(fs.readFileSync('karachi_raw.json', 'utf8'));

// Take the first 15 items to test and ensure it operates perfectly
const features = rawData.features.slice(0, 15); 

async function cleanData() {
    const processedPOIs = [];

    console.log(`🚀 Starting data ingestion pipeline for ${features.length} POIs...`);

    for (const item of features) {
        if (!item.geometry || !item.geometry.coordinates) continue;

        const rawName = item.properties.name || "Unknown POI";
        const longitude = item.geometry.coordinates[0];
        const latitude = item.geometry.coordinates[1];
        const rawAmenity = item.properties.amenity || "unknown";

        console.log(`Processing: "${rawName}"`);

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an expert geospatial data engineer for Bykea in Karachi, Pakistan. 
                Clean, sanitize, and fix this Point of Interest (POI). 
                
                Tasks:
                1. Fix the Urdu-to-English transliteration errors (e.g., convert "sharah-e-faisal" to standard "Shahrah-e-Faisal").
                2. Fix obvious typos or bad casing.
                3. Generate an array of regional variations, spelling mistakes, or Urdu terms people might type in autocomplete for this place.

                Raw Name: "${rawName}"
                Category: "${rawAmenity}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            clean_name: { type: "STRING" },
                            search_keywords: {
                                type: "ARRAY",
                                items: { type: "STRING" }
                            }
                        },
                        required: ["clean_name", "search_keywords"]
                    }
                }
            });

            const aiResult = JSON.parse(response.text);

            processedPOIs.push({
                name: aiResult.clean_name,
                amenity: rawAmenity,
                keywords: aiResult.search_keywords,
                latitude: latitude,
                longitude: longitude
            });

        } catch (error) {
            console.error(`⚠️ Failed processing "${rawName}", applying fallback format.`, error);
            processedPOIs.push({
                name: rawName,
                amenity: rawAmenity,
                keywords: [rawName.toLowerCase()],
                latitude: latitude,
                longitude: longitude
            });
        }
    }

    fs.writeFileSync('karachi_clean.json', JSON.stringify(processedPOIs, null, 2));
    console.log("\n✅ Success! Clean data output saved to 'karachi_clean.json'");
}

cleanData();