const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const { v4: uuidv4 } = require('uuid');

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  try {
    const userRes = await pool.query("SELECT id, email, created_at FROM users LIMIT 1");
    if (userRes.rows.length === 0) {
      console.log("No users found.");
      return;
    }
    const user = userRes.rows[0];
    console.log("Selected user:", user.email);
    console.log("User Registration Date:", new Date(user.created_at).toLocaleDateString());

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);
    // Generate a valid UUIDv4 for PostgreSQL
    const sessionId = uuidv4();

    console.log("\n--- POSTing Welcome Greeting to verify timeline prompt injection ---");
    const welcomeRes = await fetch("http://localhost:3001/api/chats/welcome", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId })
    });
    console.log("Welcome Status:", welcomeRes.status);
    const welcomeData = await welcomeRes.json();
    console.log("Welcome Response Text:", welcomeData.reply.text);

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await pool.end();
  }
}

run();
