require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { globalLimiter } = require('./middleware/rateLimit');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.set('trust proxy', 1); // Render/Proxies: required for secure cookies + correct client IP

// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for simplicity in development/production if needed
}));
const corsOrigins =
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(cors({
  origin: corsOrigins.length
    ? corsOrigins
    : [
      'https://pinkman69.netlify.app',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Apply global rate limiting
app.use(globalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Serve Static Files in Production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  const indexHtmlPath = path.join(frontendPath, 'index.html');

  // Only attempt to serve the bundled frontend if it actually exists.
  // This prevents Render backend-only deployments from crashing with ENOENT.
  if (fs.existsSync(indexHtmlPath)) {
    app.use(express.static(frontendPath));
    app.get('/*', (req, res) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    app.get('/', (req, res) => {
      res.send('API is running...');
    });
  }
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');

    // Optional: bootstrap an initial admin user (useful for fresh prod databases).
    // Set these in Render env vars to enable:
    // - ADMIN_USERNAME
    // - ADMIN_PASSWORD
    // - ADMIN_EXPIRY_DAYS (optional, default 3650)
    const bootstrapAdmin = async () => {
      const username = process.env.ADMIN_USERNAME;
      const password = process.env.ADMIN_PASSWORD;
      if (!username || !password) return;

      const existing = await User.findOne({ username });
      if (existing) return;

      const expiryDays = Number(process.env.ADMIN_EXPIRY_DAYS || 3650);
      const expiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      await User.create({
        username,
        password,
        role: 'admin',
        allowedSearchLimit: 999999,
        expiryDate,
        isActive: true,
      });
      console.log('Bootstrapped initial admin user:', username);
    };

    bootstrapAdmin().catch((err) => {
      console.error('Failed to bootstrap admin user:', err);
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
