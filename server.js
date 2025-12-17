const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const url = require('url');

const PORT = 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure output directory exists for listing
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    // Decode Chinese characters in URL (e.g. %E4%B8%AD -> 中)
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // API: List generated files
    if (pathname === '/api/list') {
        fs.readdir(OUTPUT_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read output directory' }));
                return;
            }
            const gifs = files.filter(f => f.toLowerCase().endsWith('.gif')).map(f => {
                const stats = fs.statSync(path.join(OUTPUT_DIR, f));
                return {
                    name: f,
                    url: `/output/${f}`,
                    mtime: stats.mtime
                };
            }).sort((a, b) => b.mtime - a.mtime); // Sort by newest first

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(gifs));
        });
        return;
    }

    // API: Generate character
    if (pathname === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { char } = JSON.parse(body);
                if (!char) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Character is required' }));
                    return;
                }

                console.log(`Received request to generate: ${char}`);

                // Run generate.js
                // Note: generate.js uses process.argv[2] for the character
                const child = spawn('node', ['generate.js', char], {
                    cwd: __dirname
                });

                child.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                });

                child.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                });

                child.on('close', (code) => {
                    if (code === 0) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: `Generated ${char}` }));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Generation failed', code }));
                    }
                });

            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Serve Output Files
    if (pathname.startsWith('/output/')) {
        const filePath = path.join(__dirname, pathname);
        serveStaticFile(res, filePath);
        return;
    }

    // Serve Dashboard (Home)
    if (pathname === '/' || pathname === '/index.html') {
        serveStaticFile(res, path.join(__dirname, 'dashboard.html'));
        return;
    }

    // Serve Static Assets (if any)
    if (pathname.startsWith('/assets/')) {
        // ... (Not implemented yet, putting CSS/JS in HTML for now)
        return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
});

function serveStaticFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Server Error');
            }
        } else {
            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Open your browser to view the generator dashboard.`);
});
