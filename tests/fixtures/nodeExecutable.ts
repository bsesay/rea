import { chmod, copyFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
export const nodeFixturePreload = `--import=${new URL("./nodeExecutablePreload.mjs", import.meta.url).href}`;
/** Execute the same controlled Node script through a native Windows executable. */
export const installNodeExecutable = async (
  script: string,
  moduleType: "commonjs" | "module",
): Promise<void> => {
  // A fixture may live beneath an unrelated package scope, including this repo.
  await writeFile(
    join(dirname(script), "package.json"),
    JSON.stringify({ type: moduleType }),
    { flag: "wx" },
  );
  if (process.platform === "win32")
    await copyFile(process.execPath, `${script}.exe`);
  else await chmod(script, 0o755);
};
