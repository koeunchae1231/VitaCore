const db = require("../config/db");

async function dbQuery(sql, params = [], connection = null) {
  const executor = connection || db;
  const [results] = await executor.query(sql, params);
  return results;
}

module.exports = dbQuery;
