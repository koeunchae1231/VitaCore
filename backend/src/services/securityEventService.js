const db = require("../config/db");
const dbQuery = require("../utils/dbQuery");

async function ensureSecurityEventArchiveTable(connection = null) {
  await dbQuery(
    "CREATE TABLE IF NOT EXISTS security_event_archives LIKE security_events",
    [],
    connection
  );
}

async function logSecurityEvent({
  userId = null,
  eventType,
  targetType = null,
  targetId = null,
  description = null,
  ipAddress = null,
}) {
  const insertSql = `
  INSERT INTO security_events
  (user_id, type, target_type, target_id, ip_address, description)
  VALUES (?, ?, ?, ?, ?, ?)
  `;

  await dbQuery(insertSql, [
    userId,
    eventType,
    targetType,
    targetId,
    ipAddress,
    description || null,
  ]);
}

async function getCharacterSecurityEvents({ userId, characterId, limit = 20 }) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 50));
  const sql = `
    SELECT id, type, target_type, target_id, description, created_at
    FROM security_events
    WHERE user_id = ?
      AND target_type = 'character'
      AND target_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `;

  const rows = await dbQuery(sql, [userId, characterId, safeLimit]);

  return {
    events: rows.map((row) => ({
      id: row.id,
      type: row.type,
      targetType: row.target_type,
      targetId: row.target_id,
      description: row.description,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    })),
  };
}

async function archiveOldSecurityEvents(days = 90) {
  const retentionDays = Number.isFinite(Number(days)) && Number(days) > 0
    ? Math.floor(Number(days))
    : 90;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await ensureSecurityEventArchiveTable(connection);

    const countRows = await dbQuery(
      `
      SELECT COUNT(*) AS count
      FROM security_events
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      `,
      [retentionDays],
      connection
    );
    const archivedCount = Number(countRows[0]?.count || 0);

    if (archivedCount > 0) {
      await dbQuery(
        `
        INSERT IGNORE INTO security_event_archives
        SELECT *
        FROM security_events
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `,
        [retentionDays],
        connection
      );

      await dbQuery(
        `
        DELETE FROM security_events
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        `,
        [retentionDays],
        connection
      );
    }

    await connection.commit();

    return {
      archivedCount,
      retentionDays,
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = {
  ensureSecurityEventArchiveTable,
  getCharacterSecurityEvents,
  logSecurityEvent,
  archiveOldSecurityEvents,
};
