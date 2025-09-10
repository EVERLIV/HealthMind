import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { createClient } from '@supabase/supabase-js';

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// PRIORITY: Health check endpoints for deployment - MUST be first
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "EVERLIV HEALTH",
    timestamp: new Date().toISOString(),
    database: supabase ? "connected" : "not configured",
    supabase: supabase ? "connected" : "disconnected"
  });
});

// Supabase health check
app.get("/api/health/supabase", async (_req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({
        status: 'error',
        supabase: 'disconnected',
        message: 'Supabase not configured'
      });
    }

    // Test connection by trying to fetch from a table
    const { data, error } = await supabase
      .from('biomarkers')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(503).json({
        status: 'error',
        supabase: 'disconnected',
        error: error.message
      });
    }

    res.json({
      status: 'ok',
      supabase: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      supabase: 'error',
      error: 'Health check failed'
    });
  }
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

// Basic API routes
app.get("/api/test", (_req, res) => {
  res.json({ message: "API is working!", timestamp: new Date().toISOString() });
});

// Simple Supabase API routes
app.get("/api/biomarkers", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('biomarkers')
      .select('*')
      .limit(50);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching biomarkers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/biomarkers/category/:category", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('biomarkers')
      .select('*')
      .eq('category', req.params.category)
      .limit(50);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching biomarkers by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // For now, create a simple mock authentication
    // In production, you would hash the password and verify against database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Mock password verification (in production, use bcrypt)
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a simple token (in production, use JWT)
    const token = `mock_token_${user.id}_${Date.now()}`;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        subscriptionType: user.subscription_type
      },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { email, username, password, name } = req.body;

    if (!email || !username || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user (in production, hash the password)
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: password, // In production, hash this
        name,
        role: 'user',
        subscription_type: 'basic'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate a simple token
    const token = `mock_token_${user.id}_${Date.now()}`;

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        subscriptionType: user.subscription_type
      },
      token
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/api/auth/me", async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Extract user ID from mock token (in production, verify JWT)
    const userId = token.split('_')[2];
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      subscriptionType: user.subscription_type
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  // In a real app, you might invalidate the token
  res.json({ message: 'Logged out successfully' });
});

console.log("✅ API routes registered successfully");

// Serve static files in production
console.log("🗂️  Starting production static file server");
console.log("Current working directory:", process.cwd());
console.log("__dirname equivalent:", import.meta.url);

// Check if dist directory exists and serve static files
const possibleDistPaths = [
  path.resolve(process.cwd(), "dist", "public"),
  path.resolve(process.cwd(), "..", "dist", "public"),
  path.resolve("/vercel/path0", "dist", "public"),
  path.resolve("/vercel/path0", "..", "dist", "public"),
  path.resolve("/vercel/path0", "..", "..", "dist", "public")
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

if (distPath) {
  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));
  
  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
} else {
  console.log("Static files not found, serving basic response");
  app.use("*", (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>EVERLIV HEALTH</title></head>
        <body>
          <h1>EVERLIV HEALTH</h1>
          <p>API is working! Static files not found.</p>
          <p>Current directory: ${process.cwd()}</p>
        </body>
      </html>
    `);
  });
}

export default app;
