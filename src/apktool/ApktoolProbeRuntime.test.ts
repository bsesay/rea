import { mkdir, access, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { ApktoolCommandCleanup } from "./ApktoolCommandCleanup.js";
import { inspectApktoolClient } from "./ApktoolConfiguration.js";
import { PrivateRuntimeRoot } from "../process/PrivateRuntimeRoot.js";
import { runOwnedCommand } from "../process/OwnedCommand.js";
import { AnalysisError } from "../domain/analysisErrorBase.js";

vi.mock("../process/OwnedCommand.js", async (original) => ({
  ...(await original<typeof import("../process/OwnedCommand.js")>()),
  runOwnedCommand: vi.fn(),
}));

let commands = new ApktoolCommandCleanup();
afterEach(async () => {
  await commands.close();
  commands = new ApktoolCommandCleanup();
  vi.restoreAllMocks();
});

const probe = (signal?: AbortSignal) =>
  inspectApktoolClient(
    {
      command: resolve("authored-apktool"),
      commandSource: "environment",
    },
    commands,
    {
      platform: "linux",
      environment: {},
      ...(signal === undefined ? {} : { signal }),
    },
  );

const installProbe = (text = "3.0.3") => {
  let root = "";
  vi.mocked(runOwnedCommand).mockImplementation(async (spawn, limits) => {
    root = spawn.hostEnvironment?.TEMP ?? "";
    expect(root).not.toBe("");
    expect(spawn.hostEnvironment).toMatchObject({
      TEMP: root,
      TMP: root,
      TMPDIR: root,
    });
    await mkdir(join(root, "hsperfdata_authored"));
    await writeFile(
      join(root, "JavaLauncher.log"),
      "controlled launcher diagnostic",
    );
    const output = {
      stdout: { text: `${text}\n` },
      stderr: { text: "" },
    } as Awaited<ReturnType<typeof runOwnedCommand>>;
    limits.observeCompleted?.(output);
    return output;
  });
  return () => root;
};

it("removes Java launcher diagnostics and performance directories with the private probe root", async () => {
  const root = installProbe();
  expect((await probe()).version).toBe("3.0.3");
  await expect(access(root())).rejects.toMatchObject({ code: "ENOENT" });
});

it("retains a denied probe root and clears its cleanup error after an owning retry", async () => {
  const root = installProbe();
  vi.spyOn(PrivateRuntimeRoot.prototype, "close").mockRejectedValueOnce(
    new Error("authored removal denial"),
  );
  const failure = await probe().catch((cause: unknown) => cause);
  expect(failure).toBeInstanceOf(AnalysisError);
  expect(failure).toMatchObject({
    cleanupIncomplete: true,
    cleanupResources: [root()],
    diagnostics: { client: { version: "3.0.3" } },
  });
  await expect(access(root())).resolves.toBeUndefined();
  await commands.close();
  expect(failure).toMatchObject({ cleanupIncomplete: false });
  await expect(access(root())).rejects.toMatchObject({ code: "ENOENT" });
});

it("preserves the completed version and caller reason when cancelled during root cleanup", async () => {
  const root = installProbe();
  const controller = new AbortController();
  const reason = { caller: "during probe root cleanup" };
  const close = PrivateRuntimeRoot.prototype.close;
  vi.spyOn(PrivateRuntimeRoot.prototype, "close").mockImplementationOnce(
    async function (this: PrivateRuntimeRoot) {
      controller.abort(reason);
      await close.call(this);
    },
  );
  await expect(probe(controller.signal)).rejects.toMatchObject({
    _tag: "AnalysisCancelledError",
    cause: reason,
    diagnostics: { client: { version: "3.0.3" } },
  });
  await expect(access(root())).rejects.toMatchObject({ code: "ENOENT" });
});

it("preserves a physical version refusal when probe root removal also fails", async () => {
  const root = installProbe("not-a-version");
  vi.spyOn(PrivateRuntimeRoot.prototype, "close").mockRejectedValueOnce(
    new Error("authored removal denial"),
  );
  const failure = await probe().catch((cause: unknown) => cause);
  expect(failure).toMatchObject({
    cleanupIncomplete: true,
    cleanupPrimary: { cause: { code: "version_unresolved" } },
  });
  await commands.close();
  expect(failure).toMatchObject({ cleanupIncomplete: false });
  await expect(access(root())).rejects.toMatchObject({ code: "ENOENT" });
});
