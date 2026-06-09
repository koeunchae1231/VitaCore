const authService = require("../services/authService");

async function requestVerification(req, res, next) {
  try {
    const result = await authService.requestVerification({
      email: req.body.email,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const result = await authService.verifyEmail({
      email: req.body.email,
      code: req.body.code,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function signup(req, res, next) {
  try {
    const result = await authService.signup({
      ...req.body,
      ipAddress: req.ip,
    });

    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login({
      ...req.body,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function sendFindEmailCode(req, res, next) {
  try {
    const result = await authService.sendFindEmailCode({
      name: req.body.name,
      email: req.body.email,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyFindEmail(req, res, next) {
  try {
    const result = await authService.verifyFindEmail({
      name: req.body.name,
      email: req.body.email,
      code: req.body.code,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function sendPublicPasswordResetCode(req, res, next) {
  try {
    const result = await authService.sendPublicPasswordResetCode({
      email: req.body.email,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function confirmPublicPasswordReset(req, res, next) {
  try {
    const result = await authService.confirmPublicPasswordReset({
      email: req.body.email,
      code: req.body.code,
      newPassword: req.body.newPassword,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const result = await authService.getMe({
      userId: req.user.userId,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requestVerification,
  verifyEmail,
  signup,
  login,
  sendFindEmailCode,
  verifyFindEmail,
  sendPublicPasswordResetCode,
  confirmPublicPasswordReset,
  me,
};
