import ora, { Ora } from 'ora';
import { fmt } from './fmt.js';

type CliContext = 'info' | 'warn' | 'error' | 'progress' | 'success' | 'none';

type ContextChangeHook = (context: CliContext) => void;

interface CliPrivateInput {
  spinner?: Ora;
  indent?: number;
  context?: CliContext;
  onContextChange?: ContextChangeHook;
}

export type CliInput = Omit<
  CliPrivateInput,
  'spinner' | 'context' | 'onContextChange'
>;

const NEW_LINE_REGEX = /(\r\n|\r|\n)/g;

export class Cli {
  private readonly indent: number;
  private readonly spinner: Ora;

  private context: CliContext;
  private readonly onContextChange?: ContextChangeHook;

  private constructor({
    indent,
    spinner,
    context,
    onContextChange,
  }: CliPrivateInput) {
    this.indent = indent ?? 0;
    this.spinner = spinner ?? ora();
    this.context = context ?? 'none';
    this.onContextChange = onContextChange;
  }

  static create(input: CliInput = {}): Cli {
    return new Cli(input);
  }

  createSubInstance(input: CliInput = {}): Cli {
    const subSpinner =
      input.indent !== undefined ? ora({ indent: input.indent }) : this.spinner;

    return new Cli({
      ...input,
      spinner: subSpinner,
      context: this.context,
      onContextChange: context => this.changeContext(context),
    });
  }

  out(text: string): void {
    this.changeContext('none');

    this.print(text);
  }

  info(text: string, symbol: string = fmt.blue('ⓘ')): void {
    this.enterContext('info');

    this.out(`${symbol} ${text}`);
  }

  success(text: string): void {
    this.enterContext('success');

    this.out(`${fmt.green('✔')} ${text}`);
  }

  warn(text: string): void {
    this.enterContext('warn');

    this.out(fmt.yellow(`⚠ ${text}`));
  }

  error(text: string): void {
    this.enterContext('error');

    this.out(fmt.red(`❌ ${text}`));
  }

  progressStart(text: string): void {
    this.changeContext('progress');

    this.spinner.start(text);
  }

  progressStop(): void {
    if (this.context !== 'progress') {
      return;
    }
    this.changeContext('none');

    this.spinner.stop();
  }

  progressSuccess(text?: string, symbol?: string): void {
    this.changeContext('none');

    symbol !== undefined
      ? this.spinner.stopAndPersist({ symbol })
      : this.spinner.succeed(text);
  }

  progressFailure(text?: string): void {
    this.changeContext('none');

    this.spinner.fail(text);
  }

  progressWarn(input?: { text?: string; warnText: string }): void {
    this.changeContext('none');

    const currentText = this.spinner.text;
    const text =
      input && `${input.text ?? currentText} - ${fmt.yellow(input.warnText)}`;

    this.spinner.stopAndPersist({
      symbol: fmt.yellow('⚠'),
      text,
    });
  }

  private print(text: string): void {
    this.progressStop();

    console.log(this.indentText(text));
  }

  private enterContext(context: CliContext): void {
    if (this.context !== context) {
      this.out('\n');
    }
    this.changeContext(context);
  }

  private indentText(text: string): string {
    return (
      this.getIndentStr() +
      text.replace(NEW_LINE_REGEX, newLine => newLine + this.getIndentStr())
    );
  }

  private changeContext(context: CliContext): void {
    this.context = context;
    this.onContextChange?.(context);
  }

  private getIndentStr(): string {
    return ' '.repeat(this.indent);
  }
}

export const cli = Cli.create();
