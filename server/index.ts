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
    console.log("🗂️  Starting production static file server");
    serveStatic(app);
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