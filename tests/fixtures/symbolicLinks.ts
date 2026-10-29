import { mkdtemp, rmdir, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Probe the actual test-host privilege; never replace link semantics with junctions. */
const probeSymbolicLinks = async (): Promise<boolean> => {
  const root = await mkdtemp(join(tmpdir(), "rea-symlink-capability-"));
  const target = join(root, "target");
  const link = join(root, "link");
  let linked = false;
  try {
    await writeFile(target, "fixture");
    try {
      await symlink(target, link);
      linked = true;
      return true;
    } catch (cause: unknown) {
      if (
        process.platform === "win32" &&
        cause instanceof Error &&
        "code" in cause &&
        (cause.code === "EPERM" || cause.code === "EACCES")
      )
        return false;
      throw cause;
    }
  } finally {
    if (linked) await unlink(link);
    await unlink(target);
    await rmdir(root);
  }
};

export const symbolicLinksAvailable = await probeSymbolicLinks();
