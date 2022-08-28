import { spawn } from "child_process";
import * as readline from "readline";

import { AwsSsmSessionDescriptor } from "../aws/ssm/types.js";
import { RuntimeError } from "../common/runtime-error.js";

export type ProcessExitedHook = (error: Error) => void;

export interface StartSessionManagerPluginInput {
  sessionDescriptor: AwsSsmSessionDescriptor;
  hooks?: {
    onProcessExited?: ProcessExitedHook;
  };
}

export async function startSessionManagerPluginProcess({
  sessionDescriptor,
  hooks,
}: StartSessionManagerPluginInput): Promise<void> {
  // Session Manager Plugin arguments could be found here:
  // https://github.com/aws/session-manager-plugin/blob/916aa5c1c241967baaf20a0f3edcde44a45e4dfb/src/sessionmanagerplugin/session/session.go#L162
  const args = [
    JSON.stringify(sessionDescriptor.response),
    sessionDescriptor.region,
    "StartSession",
    "", // AWS CLI profile
    JSON.stringify(sessionDescriptor.request),
    sessionDescriptor.endpoint,
  ];

  const sessionManager = spawn("session-manager-plugin", args, {
    stdio: "pipe",
  });

  const outputLines = readline.createInterface({
    input: sessionManager.stdout,
  });
  const errorLines = readline.createInterface({ input: sessionManager.stderr });

  const output = collectLines(outputLines);
  const errorOutput = collectLines(errorLines);

  sessionManager.on("exit", (code, signal) => {
    hooks?.onProcessExited?.(
      new SessionManagerPluginUnexpectedExitError(
        (code ?? signal)!,
        output.join("\n"),
        errorOutput.join("\n")
      )
    );
  });

  return new Promise((resolve, reject) => {
    outputLines.on("line", (line) => isPortOpened(line) && resolve());

    outputLines.on(
      "line",
      (line) =>
        isPortInUse(line) && reject(new SessionManagerPluginPortInUseError())
    );
    sessionManager.on("error", (error) => reject(parseProcessError(error)));
  });
}

export class SessionManagerPluginNonInstalledError extends RuntimeError {
  constructor() {
    super("session-manager-plugin is not installed");
  }
}

export class SessionManagerPluginPortInUseError extends RuntimeError {
  constructor() {
    super("Port is already in use");
  }
}

export class SessionManagerPluginUnexpectedExitError extends RuntimeError {
  readonly reason: number | NodeJS.Signals;
  readonly output: string;
  readonly errorOutput: string;

  constructor(
    reason: number | NodeJS.Signals,
    output: string,
    errorOutput: string
  ) {
    super("session-manager-plugin exited unexpectedly");

    this.reason = reason;
    this.output = output;
    this.errorOutput = errorOutput;
  }
}

function collectLines(lines: readline.Interface): string[] {
  const chunks: string[] = [];
  lines.on("line", (line) => chunks.push(line));
  return chunks;
}

function parseProcessError(error: NodeJS.ErrnoException): Error {
  if (error.code === "ENOENT") {
    return new SessionManagerPluginNonInstalledError();
  } else {
    return error;
  }
}

function isPortOpened(line: string): boolean {
  return line.toLowerCase().includes("waiting for connection");
}

function isPortInUse(line: string): boolean {
  return line.toLowerCase().includes("address already in use");
}
