import axios from "axios";

// Configure base URL via env or default
const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:8000/api";
const REGISTER_URL = `${API_BASE}/auth/register/`;

async function run() {
  try {
    const timestamp = Date.now();
    const username = `test_user_${timestamp}`;
    const email = `test_${timestamp}@example.com`;
    const password = `P@ssw0rd${timestamp}`;

    console.log("Using endpoint:", REGISTER_URL);
    console.log("Attempting to register user:", username);

    const response = await axios.post(
      REGISTER_URL,
      {
        username,
        email,
        password,
      },
      { timeout: 10000 },
    );

    const data = response.data || {};
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    // Possible shapes: { access, refresh, user } or { tokens: { access, refresh } } etc.
    const access = data.access || data.tokens?.access || data.token?.access;
    const refresh = data.refresh || data.tokens?.refresh || data.token?.refresh;

    if (access && refresh) {
      console.log("\n✅ OK — access and refresh tokens received");
      console.log("access (truncated):", String(access).slice(0, 40) + "...");
      console.log("refresh (truncated):", String(refresh).slice(0, 40) + "...");
      process.exit(0);
    }

    // Some backends return tokens only on login; check for 'user' or 'detail'
    console.error("\n❌ Tokens not found in registration response.");
    process.exit(2);
  } catch (err) {
    if (err.response) {
      console.error("Request failed:", err.response.status, err.response.data);
      process.exit(3);
    }
    console.error("Error:", err.message);
    process.exit(4);
  }
}

run();
