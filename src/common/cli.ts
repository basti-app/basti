import chalk from "chalk";
import ora, { Ora } from "ora";

interface CliPrivateInput {
  spinner?: Ora;
  indent?: number;
}

export type CliInput = Omit<CliPrivateInput, "spinner">;

export class Cli {
  private readonly indent: number;
  private readonly spinner: Ora;

  private constructor({ indent, spinner }: CliPrivateInput) {
    this.indent = indent || 0;
    this.spinner = spinner || ora();
  }

  static create(input: CliInput = {}): Cli {
    return new Cli(input);
  }

  createSubInstance(input: CliInput = {}): Cli {
    const { indent } = input;

    const subInput = indent
      ? {
          ...input,
          spinner: ora({ indent }),
        }
      : input;

    return new Cli(subInput);
  }

  info(message: string): void {
    this.progressStop();

    console.log(this.indentStr() + message);
  }

  error(message: string): void {
    this.progressStop();

    console.log("\n");
    console.log(chalk.red(this.indentStr() + message));
  }

  progressStart(message: string): void {
    this.spinner.start(message);
  }

  progressStop(): void {
    this.spinner.stop();
  }

  progressSuccess(message: string): void {
    this.spinner.succeed(message);
  }

  progressFailure(message: string): void {
    this.spinner.fail(message);
  }

  private indentStr(): string {
    return " ".repeat(this.indent);
  }
}

export const cli = Cli.create();
