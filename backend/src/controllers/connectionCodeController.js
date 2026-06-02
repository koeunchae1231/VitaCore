// backend/src/controllers/connectionCodeController.js
const connectionCodeService = require("../services/connectionCodeService");

async function createConnectionCode(req, res, next) {
  try {
    const result = await connectionCodeService.createConnectionCode({
      userId: req.user.userId,
      characterId: req.body.characterId,
      ipAddress: req.ip,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyConnectionCode(req, res, next) {
  try {
    const result = await connectionCodeService.verifyConnectionCode({
      code: req.body.code,
      deviceIdentifier: req.body.deviceIdentifier,
      deviceName: req.body.deviceName,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getConnectionCode(req, res, next) {
  try {
    const result = await connectionCodeService.getConnectionCode({
      userId: req.user.userId,
      code: req.params.code,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getConnectionStatus(req, res, next) {
  try {
    const result = await connectionCodeService.getConnectionStatus({
      userId: req.user.userId,
      characterId: req.params.id,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createConnectionCode,
  getConnectionCode,
  verifyConnectionCode,
  getConnectionStatus,
};
