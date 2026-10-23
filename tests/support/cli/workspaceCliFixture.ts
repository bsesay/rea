import { cliTest } from "./cliFixture.js";
import {
  createTestWorkspace,
  removeTestWorkspace,
  type TestWorkspace,
} from "../workspace/workspaceFixture.js";

/** CLI fixture with an optional test-scoped filesystem workspace. */
export const workspaceCliTest = cliTest.extend<{ workspace: TestWorkspace }>({
  workspace: async ({ processes }, use) => {
    const workspace = await createTestWorkspace();
    try {
      await use(workspace);
    } finally {
      // Windows keeps a live child's working directory locked. Retain the
      // workspace if owned process shutdown fails instead of deleting beneath it.
      await processes.shutdown();
      await removeTestWorkspace(workspace.root);
    }
  },
});
