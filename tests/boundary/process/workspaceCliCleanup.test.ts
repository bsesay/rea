import { once } from "node:events";
import { expect } from "vitest";

import { workspaceCliTest } from "../../support/cli/workspaceCliFixture.js";

workspaceCliTest(
  "stops a live workspace child before removing its working directory",
  async ({ processes, workspace }) => {
    const child = processes.spawn(
      process.execPath,
      ["-e", 'process.stdout.write("ready\\n"); setInterval(() => {}, 1000);'],
      { cwd: workspace.root },
    );
    const [ready] = await once(child.stdout, "data");
    expect(String(ready)).toBe("ready\n");
    expect(child.exitCode).toBeNull();
    // Fixture teardown must stop this owned child before deleting its Windows cwd.
  },
);
