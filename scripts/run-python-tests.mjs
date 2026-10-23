import { spawnSync } from "node:child_process";

const python = process.platform === "win32" ? "python" : "python3";
const suites = [
  [
    "-m",
    "unittest",
    "bridge/native/test_rea_lldb_tracer.py",
    "bridge/mitmproxy/test_capture.py",
    "-v",
  ],
  [
    "-m",
    "unittest",
    "discover",
    "-s",
    "experiments/analysis-efficiency",
    "-p",
    "test_*.py",
    "-v",
  ],
];
for (const args of suites) {
  const result = spawnSync(python, args, { stdio: "inherit" });
  if (result.error !== undefined) console.error(result.error.message);
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    break;
  }
}
