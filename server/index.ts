import express from "express";

const app = express();

// PRIORITY: Health check endpoints for deployment - MUST be first
app.get("/", (_req, res) => {
  res.status(200).send("OK - EVERLIV HEALTH is running!");
});

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "EVERLIV HEALTH",
    timestamp: new Date().toISOString() 
  });
});

// Basic middleware
app.use(express.json());
app.use(express.static('dist/public'));

// Catch-all for client-side routing
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'dist/public' });
});

const port = parseInt(process.env.PORT || "5000", 10);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 EVERLIV HEALTH server running on port ${port}`);
  console.log(`📊 Health check available at http://localhost:${port}/health`);
});