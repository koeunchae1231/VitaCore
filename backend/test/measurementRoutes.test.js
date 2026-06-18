process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");
const express = require("express");
const jwt = require("jsonwebtoken");

const measurementServicePath = require.resolve("../src/services/measurementService");
const dbQueryPath = require.resolve("../src/utils/dbQuery");
const calls = [];
let deviceRecord = {
  id: 77,
  character_id: 12,
  is_active: 1,
  is_revoked: 0,
  current_token_jti: "valid-jti",
};

require.cache[measurementServicePath] = {
  id: measurementServicePath,
  filename: measurementServicePath,
  loaded: true,
  exports: {
    async createMeasurement(payload) {
      calls.push({ method: "createMeasurement", payload });
      return {
        message: "ok",
        measurementId: 123,
        anomalyDetected: false,
      };
    },
    async createMeasurementBatch(payload) {
      calls.push({ method: "createMeasurementBatch", payload });
      return {
        message: "ok",
        acceptedCount: payload.measurements.length,
        ignoredCount: 0,
        duplicateCount: 0,
        failedCount: 0,
        syncedThrough: payload.measurements[0].measuredAt.toISOString(),
        results: [],
      };
    },
  },
};

require.cache[dbQueryPath] = {
  id: dbQueryPath,
  filename: dbQueryPath,
  loaded: true,
  exports: async (sql, params = []) => {
    if (sql.includes("FROM app_devices")) {
      return deviceRecord && params[0] === deviceRecord.id ? [deviceRecord] : [];
    }

    if (sql.includes("UPDATE app_devices")) {
      return { affectedRows: 1 };
    }

    return [];
  },
};

const measurementRoutes = require("../src/routes/measurementRoutes");
const { detectMeasurementAnomaly } = require("../src/services/measurement/measurementRules");

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", measurementRoutes);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
      message: err.message,
      code: err.code,
    });
  });
  return app;
}

function request(app, { method, path, body, token }) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      const data = body ? JSON.stringify(body) : "";
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: address.port,
          path,
          method,
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(data),
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
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
              body: responseBody ? JSON.parse(responseBody) : null,
            });
          });
        }
      );

      req.on("error", (err) => {
        server.close();
        reject(err);
      });
      req.end(data);
    });
  });
}

function issueDeviceToken(overrides = {}) {
  return jwt.sign(
    {
      tokenType: "device",
      deviceId: 77,
      characterId: 12,
      userId: 3,
      jti: "valid-jti",
      ...overrides,
    },
    process.env.JWT_SECRET
  );
}

test("POST /api/measurements rejects requests without a device token", async () => {
  const app = createApp();

  const response = await request(app, {
    method: "POST",
    path: "/api/measurements",
    body: { vitalType: "HR", value: 80 },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.code, "DEVICE_TOKEN_REQUIRED");
});

test("POST /api/measurements saves when a valid device token is provided", async () => {
  const app = createApp();
  calls.length = 0;
  deviceRecord = {
    id: 77,
    character_id: 12,
    is_active: 1,
    is_revoked: 0,
    current_token_jti: "valid-jti",
  };

  const response = await request(app, {
    method: "POST",
    path: "/api/measurements",
    token: issueDeviceToken(),
    body: {
      vitalType: "HR",
      value: 80,
      measuredAt: "2026-06-18T00:00:00.000Z",
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.measurementId, 123);
  assert.equal(calls[0].method, "createMeasurement");
  assert.equal(calls[0].payload.deviceId, 77);
});

test("POST /api/measurements rejects a revoked device token", async () => {
  const app = createApp();
  deviceRecord = {
    id: 77,
    character_id: 12,
    is_active: 1,
    is_revoked: 1,
    current_token_jti: "valid-jti",
  };

  const response = await request(app, {
    method: "POST",
    path: "/api/measurements",
    token: issueDeviceToken(),
    body: {
      vitalType: "HR",
      value: 80,
      measuredAt: "2026-06-18T00:00:00.000Z",
    },
  });

  assert.equal(response.statusCode, 403);
  assert.equal(response.body.code, "DEVICE_TOKEN_REVOKED");
});

test("POST /api/measurements/batch requires device token authentication", async () => {
  const app = createApp();

  const response = await request(app, {
    method: "POST",
    path: "/api/measurements/batch",
    body: {
      measurements: [
        {
          vitalType: "HR",
          value: 80,
          measuredAt: "2026-06-18T00:00:00.000Z",
        },
      ],
    },
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.code, "DEVICE_TOKEN_REQUIRED");
});

test("measurement anomaly detection follows rule config thresholds", () => {
  assert.equal(detectMeasurementAnomaly("HR", 80), null);

  const hrAnomaly = detectMeasurementAnomaly("HR", 180);
  assert.equal(hrAnomaly.type, "ANOMALY_DETECTED");
  assert.match(hrAnomaly.description, /HR=180/);

  const mapAnomaly = detectMeasurementAnomaly("MAP", 49);
  assert.equal(mapAnomaly.type, "ANOMALY_LOW_MAP");
});
