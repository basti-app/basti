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

  private inProgress: boolean = false;

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

  out(text: string): void {
    this.progressStop();

    console.log(this.indentText(text));
  }

  info(text: string, symbol: string = fmt.blue("ⓘ")): void {
    this.out("\n");
    this.out(`${symbol} ${text}`);
  }

  error(text: string): void {
    this.out("\n");
    this.out(fmt.red(`❌ ${text}`));
  }

  progressStart(text: string): void {
    this.inProgress = true;
    this.spinner.start(text);
  }

  progressStop(): void {
    if (!this.inProgress) {
      return;
    }
    this.inProgress = false;
    this.spinner.stop();
  }

  progressSuccess(text?: string, symbol?: string): void {
    this.inProgress = false;
    symbol
      ? this.spinner.stopAndPersist({ symbol })
      : this.spinner.succeed(text);
  }

  progressFailure(text?: string): void {
    this.inProgress = false;
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

  private indentText(text: string): string {
    return (
      this.getIndentStr() +
      text.replace(NEW_LINE_REGEX, (newLine) => newLine + this.getIndentStr())
    );
  }

  private getIndentStr(): string {
    return " ".repeat(this.indent);
  }
}

export const cli = Cli.create();
