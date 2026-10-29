import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
/** Compile a controlled stdout-only PE fixture using Windows' existing framework compiler. */
export const writeWindowsConsoleFixture = async (
  executable: string,
  output: string,
): Promise<void> => {
  const source = `${executable}.cs`;
  await writeFile(
    source,
    `using System; class Fixture { static void Main(string[] args) { Console.Write(${JSON.stringify(output)}); } }`,
  );
  await promisify(execFile)(
    join(
      process.env.SystemRoot ?? "C:\\Windows",
      "Microsoft.NET",
      "Framework64",
      "v4.0.30319",
      "csc.exe",
    ),
    ["/nologo", "/target:exe", `/out:${executable}`, source],
  );
};
