const accountService = require("../services/accountService");

async function deleteAccount(req, res, next) {
  try {
    const result = await accountService.deleteAccount({
      userId: req.user.userId,
      password: req.body.password,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function sendEmailChangeCode(req, res, next) {
  try {
    const result = await accountService.sendEmailChangeCode({
      userId: req.user.userId,
      email: req.body.email,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function changeEmail(req, res, next) {
  try {
    const result = await accountService.changeEmail({
      userId: req.user.userId,
      email: req.body.email,
      code: req.body.code,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function sendPasswordResetCode(req, res, next) {
  try {
    const result = await accountService.sendPasswordResetCode({
      userId: req.user.userId,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await accountService.resetPassword({
      userId: req.user.userId,
      code: req.body.code,
      newPassword: req.body.newPassword,
      ipAddress: req.ip,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  deleteAccount,
  sendEmailChangeCode,
  changeEmail,
  sendPasswordResetCode,
  resetPassword,
};
