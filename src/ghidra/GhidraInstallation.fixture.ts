import { ok as javaProbeOk } from "../domain/result.js";
import type { GhidraJavaObservation } from "./GhidraJavaProbe.js";
import { err } from "../domain/result.js";
import type { GhidraJavaProbeFailure } from "./GhidraJavaProbe.js";
import type { GhidraInstallationHost } from "./GhidraInstallation.js";
import { win32 } from "node:path";

/** Let a simulated Linux host read test files on Windows' current drive. */
export const ghidraProfileFixturePath = (directory: string): string => {
  if (process.platform !== "win32" || !/^[a-z]:[\\/]/iu.test(directory))
    return directory;
  if (
    win32.parse(directory).root.toLowerCase() !==
    win32.parse(process.cwd()).root.toLowerCase()
  )
    throw new Error(
      "A simulated POSIX installation must use the current Windows drive",
    );
  return directory.slice(2).replaceAll("\\", "/");
};

/** Simulated valid installation for profile tests; never starts Ghidra or Java. */
export const ghidraProfileInstallationHost: GhidraInstallationHost = {
  platform: "linux",
  architecture: "x64",
  readText: () => "application.version=12.1.4\napplication.java.min=21\n",
  executable: () => true,
  probeJava: () =>
    javaProbeOk<GhidraJavaObservation>({
      version: "21.0.11",
      major: 21,
      home: "/jdk-21",
      bits: 64,
      runtime: "jdk",
      osArch: "amd64",
      osName: "Linux",
    }),
};

/** A confirmed absent Java command for installation admission fixtures. */
export const missingJavaProbe = err<GhidraJavaProbeFailure>({
  _tag: "GhidraJavaProbeFailure",
  code: "runtime_missing",
  detail: "Java command was not found",
});
