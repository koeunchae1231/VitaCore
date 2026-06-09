function errorMiddleware(err, req, res, next) {
  console.error("[ERROR]", err);

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const message =
    isProduction && statusCode === 500
      ? "서버 내부 오류가 발생했습니다."
      : err.message || "서버 내부 오류가 발생했습니다.";

  const code = err.code || "INTERNAL_SERVER_ERROR";

  if (err.isHtmlResponse) {
    return res.status(statusCode).send(err.html);
  }

  return res.status(statusCode).json({
    message,
    code,
  });
}

module.exports = errorMiddleware;
