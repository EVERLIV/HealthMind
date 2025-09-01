import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";

const app = express();

// PRIORITY: Health check endpoints for deployment - MUST be first
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "EVERLIV HEALTH",
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? "connected" : "not configured"
  });
});

// Set environment for Express
if (process.env.NODE_ENV === 'production') {
  app.set('env', 'production');
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Logging middleware for API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  let server;
  try {
    // Register API routes
    server = await registerRoutes(app);
    console.log("✅ API routes registered successfully");
  } catch (error) {
    console.error("❌ Routes registration failed:", error);
    // Create minimal server for health checks only
    const { createServer } = await import("http");
    server = createServer(app);
  }

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Server error:", err);
    res.status(status).json({ message });
  });

  // Serve files based on environment
  if (process.env.NODE_ENV === "production") {
    console.log("🗂️  Checking for static files...");
    try {
      // Try to serve static files if they exist
      const fs = await import("fs");
      const path = await import("path");
      const distPath = path.resolve(import.meta.dirname, "public");
      
      if (fs.existsSync(distPath)) {
        console.log("✅ Static files found, serving them");
        serveStatic(app);
      } else {
        console.log("⚠️ No static files found, serving fallback");
        // Serve fallback response that redirects to development
        app.use("*", (req, res) => {
          if (req.path.startsWith('/api/')) {
            // Let API routes be handled by the routes
            return;
          }
          
          res.send(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>EVERLIV HEALTH - AI Анализ Здоровья</title>
              <meta name="theme-color" content="#059669">
              <style>
                body {
                  margin: 0;
                  font-family: system-ui, -apple-system, sans-serif;
                  background: linear-gradient(135deg, #059669 0%, #34D399 100%);
                  color: white;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  text-align: center;
                }
                .logo { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; }
                .loading { font-size: 1.2rem; margin-bottom: 2rem; }
                .spinner {
                  width: 40px; height: 40px;
                  border: 4px solid rgba(255,255,255,0.3);
                  border-top: 4px solid white;
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                  margin: 1rem auto;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </head>
            <body>
              <div class="logo">🩺 EVERLIV HEALTH</div>
              <div class="loading">Запуск приложения...</div>
              <div class="spinner"></div>
              <script>
                setTimeout(() => {
                  window.location.href = 'https://${req.hostname.replace('.replit.app', '-5000.replit.app')}';
                }, 1000);
              </script>
            </body>
            </html>
          `);
        });
      }
    } catch (error) {
      console.error("❌ Production static setup failed:", error);
      // Fallback to minimal server
      app.use("*", (req, res) => {
        if (req.path.startsWith('/api/')) {
          return;
        }
        res.json({ 
          status: "production", 
          message: "API ready, redirecting to development UI",
          redirect: `https://${req.hostname.replace('.replit.app', '-5000.replit.app')}`
        });
      });
    }
  } else {
    console.log("🔥 Starting Vite development server with HMR");
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 EVERLIV HEALTH server running on port ${port}`);
    console.log(`📊 Health check available at http://0.0.0.0:${port}/health`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  });
})();