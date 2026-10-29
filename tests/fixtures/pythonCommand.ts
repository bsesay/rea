// Windows exposes the installed interpreter as python.exe; python3 may be a Store alias.
export const pythonCommand =
  process.platform === "win32" ? "python" : "python3";
