import { resolve } from "node:path";
import { expect, it } from "vitest";

import {
  expectConfigurationRefusal,
  serveCli as serve,
} from "./cliServeHarness.js";

const missingCommand = resolve("/nonexistent/apktool");

it.each([
  [
    ["inspect-apktool-client", "--json"],
    missingCommand,
    `The selected apktool launcher was not found: ${missingCommand}. Set REA_APKTOOL_COMMAND`,
  ],
  [
    ["decode-android-resources", "/targets/app.apk", "--json"],
    missingCommand,
    `The selected apktool launcher was not found: ${missingCommand}. Set REA_APKTOOL_COMMAND`,
  ],
  [
    ["decode-android-resources", "/targets/app.apk", "--json"],
    "relative/apktool",
    "REA_APKTOOL_COMMAND must be an absolute path to the apktool launcher.",
  ],
])(
  "%j with REA_APKTOOL_COMMAND=%s names the host requirement",
  async (argv, command, reason) => {
    const result = await serve(argv, { REA_APKTOOL_COMMAND: command });
    expectConfigurationRefusal(result, reason);
  },
);

it("validates the locale option before launching apktool", async () => {
  const result = await serve([
    "decode-android-resources",
    "/targets/app.apk",
    "--locale",
    "not a locale",
    "--json",
  ]);
  expect(result.exitCode).toBe(1);
  expect(JSON.parse(result.stdout)).toMatchObject({
    code: "VALIDATION_ERROR",
    fieldErrors: [
      {
        code: "invalid_format",
        path: "locale",
      },
    ],
  });
});
