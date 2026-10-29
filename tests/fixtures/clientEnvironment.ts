import { vi } from "vitest";

import { PRODUCT_IDENTITY } from "../../src/identity.js";

/** The package runner's POSIX argv, before any host launcher shim. */
const npxArguments = [
  "npx",
  "-y",
  PRODUCT_IDENTITY.registrationPackageSpecifier,
  "mcp",
] as const;

/** The default npx registration command setup writes on this test host. */
export const NPX_REGISTRATION_COMMAND =
  process.platform === "win32"
    ? (["cmd.exe", "/d", "/c", ...npxArguments] as const)
    : npxArguments;

/** Environment variables that redirect where supported clients keep config. */
export const CLIENT_LOCATION_ENVIRONMENT = [
  "APPDATA",
  "CLAUDE_CONFIG_DIR",
  "CODEX_HOME",
  "DSH_HOME",
  "DSH_AGENTS_HOME",
  "COPILOT_HOME",
  "GROK_HOME",
  "GEMINI_CLI_HOME",
  "GEMINI_CLI_TRUST_WORKSPACE",
  "GEMINI_RESTRICTED_MODE",
  "GEMINI_CLI_TRUSTED_FOLDERS_PATH",
  "GEMINI_CLI_SYSTEM_SETTINGS_PATH",
  "GEMINI_CLI_SYSTEM_DEFAULTS_PATH",
  "HERMES_DATA_DIR_SUFFIX",
  "HERMES_HOME",
  "KIMI_CODE_HOME",
  "LOCALAPPDATA",
  "OMP_PROFILE",
  "OPENCODE_CONFIG",
  "OPENCODE_CONFIG_DIR",
  "PI_CODING_AGENT_DIR",
  "PI_CONFIG_DIR",
  "PI_PROFILE",
  "QODER_CONFIG_DIR",
  "QWEN_HOME",
  "SAND_DATA_ROOT",
  "XDG_CONFIG_HOME",
] as const;

/** Clear the developer's client locations so tests resolve only their temporary homes. */
export const clearClientLocationEnvironment = (): void => {
  for (const name of CLIENT_LOCATION_ENVIRONMENT) vi.stubEnv(name, undefined);
};
