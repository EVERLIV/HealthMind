import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

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

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("Registration attempt:", { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    console.log("Checking if user exists...");
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log("User already exists");
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(password);
    console.log("Password hashed successfully");

    // Create user
    console.log("Creating user in database...");
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];
    const username = email.split('@')[0];
    
    const result = await pool.query(
      'INSERT INTO users (email, username, password_hash, name, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, username, name',
      [email, username, hashedPassword, fullName]
    );

    console.log("User created successfully:", result.rows[0]);
    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, username, password_hash, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name
      },
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Health check with database
app.get("/api/health/database", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: "ok",
      database: "connected",
      current_time: result.rows[0].current_time,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database health check error:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

// Debug endpoint
app.get("/api/debug/env", async (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    HAS_DATABASE_URL: !!process.env.DATABASE_URL,
    HAS_JWT_SECRET: !!process.env.JWT_SECRET,
    DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + "...",
    timestamp: new Date().toISOString()
  });
});

// Check if users table exists
app.get("/api/debug/tables", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    res.json({
      users_table_exists: result.rows.length > 0,
      tables: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Table check error:", error);
    res.status(500).json({
      error: "Failed to check tables",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

// Check table structure
app.get("/api/debug/table-structure", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    res.json({
      columns: result.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Table structure check error:", error);
    res.status(500).json({
      error: "Failed to check table structure",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

// Create users table if it doesn't exist
app.post("/api/debug/create-table", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    res.json({
      message: "Users table created successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Table creation error:", error);
    res.status(500).json({
      error: "Failed to create table",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

// Serve static files in production
console.log("🗂️  Starting production static file server");
console.log("Current working directory:", process.cwd());

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
  console.log(`Serving static files from: ${distPath}`);
  
  // Serve static files with proper MIME types
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      }
    }
  }));
  
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