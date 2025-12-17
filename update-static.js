const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'output');
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'data.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    console.log('Output directory does not exist.');
    process.exit(0);
}

// Get all GIF files
const files = fs.readdirSync(OUTPUT_DIR);
const gifs = files
    .filter(f => f.toLowerCase().endsWith('.gif'))
    .map(f => {
        const stats = fs.statSync(path.join(OUTPUT_DIR, f));
        return {
            name: f,
            url: `output/${f}`, // Relative path for static hosting
            mtime: stats.mtime
        };
    })
    .sort((a, b) => b.mtime - a.mtime); // Sort by newest

// Write to data.json
fs.writeFileSync(MANIFEST_FILE, JSON.stringify(gifs, null, 2));

console.log(`Successfully generated manifest with ${gifs.length} files.`);
console.log(`Saved to: ${MANIFEST_FILE}`);
