'use strict';

// Load .env file FIRST before anything else imports process.env
require('dotenv').config();

// Trigger env validation — process.exit(1) if any required var is missing
const config = require('./config/env');

// Now safe to bring in the Express app (which uses config)
const app = require('./app');

const port = config.port;

app.listen(port, () => {
  console.log(`[Server] Relate API listening on port ${port} (${config.nodeEnv})`);
});
