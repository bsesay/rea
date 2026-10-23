import { createTestTempDirectory } from "./temporaryDirectory.js";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdtemp } from "node:fs/promises";

let sid: string | undefined;
/** Apply the bridge producer's current-user/SYSTEM ACL only to a newly created fixture. */
export const cutterPrivateTempDirectory = async (
  prefix: string,
): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), prefix));
  hardenCutterFixtureDirectory(directory);
  return directory;
};

/** Only for newly created, test-owned fixture directories. */
export const hardenCutterFixtureDirectory = (directory: string): void => {
  if (process.platform === "win32") {
    sid ??= execFileSync(
      join(process.env.SystemRoot ?? "C:\\Windows", "System32", "whoami.exe"),
      ["/user", "/fo", "csv", "/nh"],
      {
        encoding: "utf8",
      },
    ).match(/S-1-5-[0-9-]+/u)?.[0];
    if (sid === undefined) throw new Error("Cannot identify the fixture owner");
    execFileSync(
      join(process.env.SystemRoot ?? "C:\\Windows", "System32", "icacls.exe"),
      [
        directory,
        "/inheritance:r",
        "/grant:r",
        `*${sid}:(OI)(CI)F`,
        "*S-1-5-18:(OI)(CI)F",
      ],
      { stdio: "pipe" },
    );
    execFileSync(
      join(process.env.SystemRoot ?? "C:\\Windows", "System32", "icacls.exe"),
      [directory, "/setowner", `*${sid}`],
      {
        stdio: "pipe",
      },
    );
  }
};

export const createCutterTestDirectory = async (
  prefix: string,
): Promise<string> => {
  const directory = await createTestTempDirectory(prefix);
  hardenCutterFixtureDirectory(directory);
  return directory;
};
