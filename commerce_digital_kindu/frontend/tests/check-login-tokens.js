import axios from "axios";

const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:8000/api";
const REGISTER_URL = `${API_BASE}/auth/register/`;
const LOGIN_URL = `${API_BASE}/auth/login/`;

async function run() {
  try {
    const timestamp = Date.now();
    const username = `test_user_${timestamp}`;
    const email = `test_${timestamp}@example.com`;
    const password = `P@ssw0rd${timestamp}`;

    console.log("Using endpoint:", REGISTER_URL, "and", LOGIN_URL);

    // register
    const reg = await axios.post(
      REGISTER_URL,
      { username, email, password },
      { timeout: 10000 },
    );
    console.log("Register status:", reg.status);

    // attempt login
    const loginResp = await axios.post(
      LOGIN_URL,
      { username, password },
      { timeout: 10000 },
    );
    console.log("Login status:", loginResp.status);
    console.log("Login response data:", loginResp.data);

    const data = loginResp.data || {};
    const access = data.access || data.tokens?.access || data.token?.access;
    const refresh = data.refresh || data.tokens?.refresh || data.token?.refresh;

    if (access && refresh) {
      console.log("\n✅ OK — login returned access and refresh tokens");
      console.log("access (truncated):", String(access).slice(0, 40) + "...");
      console.log("refresh (truncated):", String(refresh).slice(0, 40) + "...");
      process.exit(0);
    }

    console.error("\n❌ Tokens not found in login response.");
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
