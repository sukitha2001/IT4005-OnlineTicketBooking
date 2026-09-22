'use strict';

require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🎟️  Online Ticket Booking System running at http://localhost:${PORT}`);
    console.log(`   Demo accounts (password: Password123!):`);
    console.log(`     Admin:     admin@test.com`);
    console.log(`     Organizer: organizer@test.com`);
    console.log(`     Customer:  customer@test.com`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
