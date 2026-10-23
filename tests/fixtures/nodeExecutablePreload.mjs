import { existsSync } from "node:fs";
import { basename, relative } from "node:path";
import { pathToFileURL } from "node:url";
// Only copied Node executables beside an explicit fixture script are redirected.
if (basename(process.execPath).toLowerCase() === "gh.exe") {
  const script = process.execPath.slice(0, -4);
  if (!existsSync(script))
    throw new Error("Missing owned executable fixture script");
  // Node resolves its script argument before preloads run; restore the CLI argument.
  if (process.argv[1] !== undefined)
    process.argv[1] = relative(process.cwd(), process.argv[1]);
  process.argv.splice(1, 0, script);
  await import(pathToFileURL(script).href);
  await Promise.all(
    [process.stdout, process.stderr].map(
      (stream) =>
        new Promise((resolve, reject) =>
          stream.write("", (error) => (error ? reject(error) : resolve())),
        ),
    ),
  );
  process.exit();
}
