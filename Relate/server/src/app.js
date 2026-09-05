'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/env');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.clientOrigin,
  credentials: true // required so the browser sends HttpOnly cookies cross-origin
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Cookie parsing ────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Guest-ID middleware (global — applied before all routes) ──────────────────
const guestIdMiddleware = require('./middleware/guestId.middleware');
app.use(guestIdMiddleware);

// ── MongoDB connection ────────────────────────────────────────────────────────
mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log('[MongoDB] Connected successfully');
  })
  .catch(err => {
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  });

// ── Routes (registered here as they are implemented) ─────────────────────────
const authRouter = require('./routes/auth.routes');
app.use('/api/auth', authRouter);

const worldsRouter = require('./routes/worlds.routes');
app.use('/api/worlds', worldsRouter);

const analogyRouter = require('./routes/analogy.routes');
app.use('/api/analogies', analogyRouter);

const libraryRouter = require('./routes/library.routes');
app.use('/api/library', libraryRouter);

const practiceRouter = require('./routes/practice.routes');
app.use('/api/practice', practiceRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv });
});

module.exports = app;
