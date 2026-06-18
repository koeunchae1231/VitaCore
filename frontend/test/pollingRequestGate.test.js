import assert from "node:assert/strict";
import test from "node:test";

import { createPollingRequestGate } from "../src/utils/pollingRequestGate.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function waitForMicrotasks() {
  return new Promise((resolve) => setImmediate(resolve));
}

test("polling gate prevents duplicate in-flight requests", async () => {
  const pending = deferred();
  let startedCount = 0;
  const gate = createPollingRequestGate();

  const first = gate.run(() => {
    startedCount += 1;
    return pending.promise;
  });
  const second = gate.run(() => {
    startedCount += 1;
    return Promise.resolve();
  });

  assert.equal(first.started, true);
  assert.equal(second.started, false);
  await waitForMicrotasks();
  assert.equal(startedCount, 1);

  pending.resolve();
  await waitForMicrotasks();
});

test("polling gate aborts active requests and skips aborted results", async () => {
  const pending = deferred();
  const gate = createPollingRequestGate();
  let capturedSignal;
  let applied = false;

  const run = gate.run(
    (signal) => {
      capturedSignal = signal;
      return pending.promise;
    },
    {
      onResult: () => {
        applied = true;
      },
    }
  );

  assert.equal(run.started, true);
  await waitForMicrotasks();
  gate.abort();
  assert.equal(capturedSignal.aborted, true);

  pending.resolve({ value: "stale" });
  await waitForMicrotasks();

  assert.equal(applied, false);
  assert.equal(gate.isRunning(), false);
});
