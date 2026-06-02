const {
  archiveOldSecurityEvents,
  getCharacterSecurityEvents,
  logSecurityEvent,
} = require("../services/securityEventService");

const ALLOWED_CLIENT_EVENTS = new Set([
  "COMMAND_APPLIED",
  "MANUAL_VITAL_UPDATED",
  "ANOMALY_DETECTED",
  "VITAL_WARNING",
]);

async function createClientSecurityEvent(req, res, next) {
  try {
    const eventType = String(req.body.eventType || "").trim().toUpperCase();

    if (!ALLOWED_CLIENT_EVENTS.has(eventType)) {
      return res.status(400).json({
        message: "허용되지 않은 보안 이벤트입니다.",
        code: "INVALID_SECURITY_EVENT_TYPE",
      });
    }

    await logSecurityEvent({
      userId: req.user.userId,
      eventType,
      targetType: req.body.targetType || null,
      targetId: req.body.targetId || null,
      description: req.body.description || null,
      ipAddress: req.ip,
    });

    return res.status(201).json({ message: "보안 이벤트가 기록되었습니다." });
  } catch (err) {
    next(err);
  }
}

async function getCharacterEvents(req, res, next) {
  try {
    const characterId = Number(req.params.id);
    if (!Number.isInteger(characterId) || characterId <= 0) {
      return res.status(400).json({
        message: "Invalid characterId.",
        code: "INVALID_CHARACTER_ID",
      });
    }

    const result = await getCharacterSecurityEvents({
      userId: req.user.userId,
      characterId,
      limit: req.query.limit,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function archiveSecurityEvents(req, res, next) {
  try {
    const result = await archiveOldSecurityEvents(req.body.days);

    return res.status(200).json({
      message: "보안 이벤트 로그가 아카이브되었습니다.",
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  archiveSecurityEvents,
  createClientSecurityEvent,
  getCharacterEvents,
};
