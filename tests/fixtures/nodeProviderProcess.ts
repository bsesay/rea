import { spawnOwnedProviderProcess } from "../../src/process/ProviderProcess.js";

/** Launch a controlled JavaScript producer explicitly, without POSIX shebangs. */
export const spawnNodeProviderProcess: typeof spawnOwnedProviderProcess = (
  input,
) =>
  spawnOwnedProviderProcess({
    ...input,
    command: process.execPath,
    arguments: [input.command, ...input.arguments],
    expectedCommand: null,
    hostEnvironment: {
      ...(process.platform === "win32"
        ? { SystemRoot: process.env.SystemRoot }
        : {}),
      ...input.hostEnvironment,
    },
  });
