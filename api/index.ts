import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";
import path from "path";
import fs from "fs";

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

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Server error:", err);
  res.status(status).json({ message });
});

// Register API routes
registerRoutes(app).then(() => {
  console.log("✅ API routes registered successfully");
}).catch((error) => {
  console.error("❌ Routes registration failed:", error);
});

// Serve static files in production
console.log("🗂️  Starting production static file server");
console.log("Current working directory:", process.cwd());
console.log("__dirname equivalent:", import.meta.url);

// Check if dist directory exists
const possibleDistPaths = [
  path.resolve(process.cwd(), "dist", "public"),
  path.resolve(process.cwd(), "..", "dist", "public"),
  path.resolve("/vercel/path0", "dist", "public"),
  path.resolve("/vercel/path0", "..", "dist", "public")
];

let distPath = null;
for (const possiblePath of possibleDistPaths) {
  if (fs.existsSync(possiblePath)) {
    distPath = possiblePath;
    break;
  }
}

console.log("Looking for dist at:", possibleDistPaths);
console.log("Found dist at:", distPath);

if (distPath && fs.existsSync(distPath)) {
  console.log("Dist contents:", fs.readdirSync(distPath));
}

serveStatic(app);

export default app;
