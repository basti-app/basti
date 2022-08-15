import ora, { Ora } from "ora";
import { fmt } from "./fmt.js";

interface CliPrivateInput {
  spinner?: Ora;
  indent?: number;
}

export type CliInput = Omit<CliPrivateInput, "spinner">;

const NEW_LINE_REGEX = /(\r\n|\r|\n)/g;

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

  info(text: string): void {
    this.progressStop();

    console.log(this.indentStr() + text);
  }

  error(text: string): void {
    this.progressStop();

    console.log("\n");
    console.log(fmt.red(this.indentStr() + text));
  }

  progressStart(text: string): void {
    this.spinner.start(text);
  }

  progressStop(): void {
    this.spinner.stop();
  }

  progressSuccess(text?: string): void {
    this.spinner.succeed(text);
  }

  progressFailure(text?: string): void {
    this.spinner.fail(text);
  }

  progressWarn(input?: { text?: string; warnText: string }): void {
    const currentText = this.spinner.text;
    const text =
      input && `${input.text || currentText} - ${fmt.yellow(input.warnText)}`;

    this.spinner.stopAndPersist({
      symbol: fmt.yellow("⚠"),
      text,
    });
  }

  private indentNewLines(message: string): string {
    return message.replace(
      NEW_LINE_REGEX,
      (newLine) => this.indentStr() + newLine
    );
  }

  private indentStr(): string {
    return " ".repeat(this.indent);
  }
}

export const cli = Cli.create();
