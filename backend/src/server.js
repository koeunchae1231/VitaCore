require("dotenv").config();

const app = require("./app");
const {
  ensureSecurityEventArchiveTable,
} = require("./services/securityEventService");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await ensureSecurityEventArchiveTable();
  } catch (err) {
    console.error("security_event_archives table check failed:", err.message);
  }

  app.listen(PORT, () => {
    console.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
