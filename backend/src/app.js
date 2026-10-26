const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Explicit allowed localhost development origins
const allowedOrigins = [
  'http://localhost:57179',
  'http://127.0.0.1:57179',
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

// CORS configuration supporting http://localhost:57179 and dynamic localhost ports
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) with no origin header
    if (!origin) {
      return callback(null, true);
    }

    // Check against explicit allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Support any local development port on localhost or 127.0.0.1
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost) {
      return callback(null, true);
    }

    // Reject unknown external origins
    return callback(new Error(`CORS policy violation: Origin ${origin} is not allowed.`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Legacy browsers support for 200 status on preflight
};

// 1. Apply CORS middleware first, before routes and body parsers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle all preflight requests

// 2. Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request logger for development insight
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root level health check for convenience
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'University API is running',
    success: true,
    timestamp: new Date().toISOString()
  });
});

// 4. Mount API Routes (/api/*)
app.use('/api', apiRoutes);

// 5. 404 handler for unknown endpoints
app.use(notFoundHandler);

// 6. Centralized error handling
app.use(errorHandler);

module.exports = app;
