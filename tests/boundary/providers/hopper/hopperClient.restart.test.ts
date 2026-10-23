import { describe, expect, it, onTestFinished } from "vitest";
import { HopperClient } from "../../../../src/hopper/HopperClient.js";

import {
  HopperFixtureLauncher as FixtureLauncher,
  startHopperFixtureClient as startClient,
} from "./hopperClient.fixture.js";

// Hopper has a POSIX Unix-domain socket transport and no Windows provider lane.
const unixSocketTest = it.skipIf(process.platform === "win32");

describe("HopperClient restart", () => {
  unixSocketTest(
    "does not finish startup after an immediate close",
    async () => {
      const client = new HopperClient({
        launcher: new FixtureLauncher(),
        startupTimeoutMs: 1_000,
      });
      onTestFinished(async () => {
        await client.close();
      });

      const starting = client.start();
      await client.close();

      const result = await starting;
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error._tag).toBe("HopperProtocolError");
    },
  );

  unixSocketTest("starts a fresh session after close completes", async () => {
    const client = await startClient();
    await client.close();

    await expect(client.start()).resolves.toEqual({
      ok: true,
      value: {
        name: "REA Hopper bridge",
        version: "1.0.0",
        processId: expect.any(Number),
      },
    });
  });

  unixSocketTest(
    "serializes a restart requested while close is in progress",
    async () => {
      const client = await startClient();
      const closing = client.close();
      const restarting = client.start();

      await closing;
      await expect(restarting).resolves.toEqual({
        ok: true,
        value: {
          name: "REA Hopper bridge",
          version: "1.0.0",
          processId: expect.any(Number),
        },
      });
      await expect(
        client.callTool("echo", { value: "fresh" }),
      ).resolves.toEqual({
        ok: true,
        value: { value: "fresh" },
      });
    },
  );
});
