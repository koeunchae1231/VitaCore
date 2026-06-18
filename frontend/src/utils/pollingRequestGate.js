export function createPollingRequestGate({
  createAbortController = () => new AbortController(),
} = {}) {
  let activeRequest = null;
  let latestAppliedRequestId = 0;
  let nextRequestId = 0;

  function run(task, { onResult, onError } = {}) {
    if (activeRequest && !activeRequest.controller.signal.aborted) {
      return { started: false, requestId: activeRequest.requestId };
    }

    const controller = createAbortController();
    const requestId = ++nextRequestId;
    activeRequest = { controller, requestId };

    Promise.resolve()
      .then(() => task(controller.signal, requestId))
      .then((result) => {
        if (controller.signal.aborted || requestId < latestAppliedRequestId) {
          return;
        }

        latestAppliedRequestId = requestId;
        onResult?.(result, requestId);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === "AbortError") {
          return;
        }

        onError?.(err, requestId);
      })
      .finally(() => {
        if (activeRequest?.requestId === requestId) {
          activeRequest = null;
        }
      });

    return { started: true, requestId, controller };
  }

  function abort() {
    if (activeRequest) {
      activeRequest.controller.abort();
      activeRequest = null;
    }
  }

  function isRunning() {
    return Boolean(activeRequest && !activeRequest.controller.signal.aborted);
  }

  return {
    run,
    abort,
    isRunning,
  };
}
