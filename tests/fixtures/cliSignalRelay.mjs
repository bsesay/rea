// Windows child.kill("SIGINT") terminates without dispatching JavaScript
// handlers. Relay a controlled event to exercise the real CLI cleanup path;
// this fixture does not establish native console Ctrl+C delivery.
process.once("message", (signal) => {
  if (signal !== "SIGINT" && signal !== "SIGTERM")
    throw new Error("Unexpected CLI cancellation signal");
  process.disconnect();
  process.emit(signal);
});
