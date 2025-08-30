import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve React app (use development version if production build missing)
const publicPath = path.join(__dirname, 'dist/public');
const hasProductionBuild = fs.existsSync(path.join(publicPath, 'index.html'));

if (hasProductionBuild) {
    console.log('📦 Serving production build from dist/public');
    app.use(express.static(publicPath));
} else {
    console.log('🔧 Serving development build (Replit filesystem issue workaround)');
    // Redirect to development version
    app.get('*', (req, res) => {
        res.redirect('http://' + req.headers.host.replace('.replit.app', '-5000.replit.app') + req.url);
    });
}

// Import and register API routes
import('./server/routes.js').then(({ registerRoutes }) => {
    registerRoutes(app).then(httpServer => {
        httpServer.listen(port, '0.0.0.0', () => {
            console.log(`🚀 EVERLIV HEALTH Production Server`);
            console.log(`📱 Port: ${port}`);
            console.log(`✅ Features: Auth, DeepSeek AI, Biomarkers, PWA`);
            if (!hasProductionBuild) {
                console.log(`⚠️  Using development version due to Replit filesystem limitations`);
            }
        });
    });
}).catch(err => {
    // If routes fail, just serve the frontend
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 EVERLIV HEALTH Frontend Only - Port ${port}`);
    });
});
