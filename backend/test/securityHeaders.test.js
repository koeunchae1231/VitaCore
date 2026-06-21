const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = require("../src/app");

function request(path) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path,
          method: "GET",
        },
        (res) => {
          let responseBody = "";
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            responseBody += chunk;
          });
          res.on("end", () => {
            server.close();
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: responseBody,
            });
          });
        }
      );

      req.on("error", (err) => {
        server.close();
        reject(err);
      });
      req.end();
    });
  });
}

test("security headers are applied to backend responses", async () => {
  const response = await request("/");

  assert.equal(response.statusCode, 200);
  assert.match(response.body, /VitaCore backend server is running/);
  assert.match(response.headers["content-security-policy"], /default-src 'self'/);
  assert.match(response.headers["content-security-policy"], /frame-ancestors 'self'/);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
  assert.equal(
    response.headers["referrer-policy"],
    "strict-origin-when-cross-origin"
  );
  assert.match(response.headers["permissions-policy"], /camera=\(\)/);
  assert.match(response.headers["permissions-policy"], /microphone=\(\)/);
  assert.match(response.headers["permissions-policy"], /geolocation=\(\)/);
});
