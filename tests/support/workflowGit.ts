import { execFile, execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

/** Execute a fixture command while retaining its output and native exit status. */
export const executeWorkflowFixture = promisify(execFile);

/** Run fixture Git commands with deterministic dates and no workstation hooks. */
export async function workflowGit(
  directory: string,
  args: readonly string[],
  date = "2026-01-04T00:00:00Z",
) {
  const result = await executeWorkflowFixture(
    "git",
    [
      "-c",
      "user.name=REA fixture",
      "-c",
      "user.email=fixture@example.invalid",
      "-c",
      "commit.gpgsign=false",
      "-c",
      `core.hooksPath=${join(directory, "no-hooks")}`,
      ...args,
    ],
    {
      cwd: directory,
      env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
    },
  );
  return result.stdout.trim();
}

/** Git Bash must invoke the selected Windows Node executable, not npm's Unix placeholder. */
export const workflowBashScript = (script: string): string => {
  if (process.platform !== "win32") return script;
  const node =
    "'" + process.execPath.replaceAll("\\", "/").replaceAll("'", "'\\''") + "'";
  return `node() { ${node} "$@"; }\n${script}`;
};

/** Select Git for Windows' Bash explicitly without shadowing native Windows tar. */
export const workflowBashCommand =
  process.platform === "win32"
    ? resolve(
        execFileSync("git", ["--exec-path"], {
          encoding: "utf8",
          windowsHide: true,
        }).trim(),
        "..",
        "..",
        "..",
        "usr",
        "bin",
        "bash.exe",
      )
    : "bash";
