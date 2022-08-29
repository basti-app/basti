import * as cp from "child_process";
import * as readline from "readline";

export class OutputOptimizedChildProcess {
  readonly process: cp.ChildProcessWithoutNullStreams;

  private readonly outputLines: readline.Interface;
  private readonly errorOutputLines: readline.Interface;

  private readonly output: string[] = [];
  private readonly errorOutput: string[] = [];

  constructor(childProcess: cp.ChildProcessWithoutNullStreams) {
    this.process = childProcess;

    this.outputLines = readline.createInterface({ input: this.process.stdout });
    this.errorOutputLines = readline.createInterface({
      input: this.process.stderr,
    });

    this.outputLines.on("line", (line) => this.output.push(line));
    this.errorOutputLines.on("line", (line) => this.errorOutput.push(line));
  }

  onLine(listener: (line: string) => void): this {
    this.outputLines.on("line", listener);

    return this;
  }

  onErrorLine(listener: (line: string) => void): this {
    this.errorOutputLines.on("line", listener);

    return this;
  }

  collectOutput(): string {
    return this.output.join("\n");
  }

  collectErrorOutput(): string {
    return this.errorOutput.join("\n");
  }
}

export function spawnProcess(
  command: string,
  args: string[]
): OutputOptimizedChildProcess {
  const childProcess = cp.spawn(command, args, { stdio: "pipe" });

  return new OutputOptimizedChildProcess(childProcess);
}
