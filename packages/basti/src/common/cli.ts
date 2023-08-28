import inquirer from 'inquirer';
import ora from 'ora';

import { isDebugMode } from './debug.js';
import { fmt } from './fmt.js';
import { toArray } from './data-structures.js';

import type { Ora } from 'ora';

type CliContext =
  | 'info'
  | 'warn'
  | 'error'
  | 'debug'
  | 'progress'
  | 'success'
  | 'none';

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

export class Cli {
  private static readonly NEW_LINE_REGEXP = /(\r\n|\r|\n)/g;

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

  exitContext(): void {
    this.changeContext('none');
  }

  out(text: string): void {
    this.exitContext();

    this.print(text);
  }

  info(text: string, symbol: string = 'ℹ️'): void {
    this.enterContext('info');

    this.print(`${symbol} ${text}`);
  }

  success(text: string): void {
    this.enterContext('success');

    this.print(`${fmt.green('✔')} ${text}`);
  }

  warn(text: string): void {
    this.enterContext('warn');

    this.print(fmt.yellow(`⚠ ${text}`));
  }

  error(text: string): void {
    this.enterContext('error');

    this.print(fmt.red(`❌ ${text}`));
  }

  debug(text: string): void {
    if (!isDebugMode()) {
      return;
    }

    this.enterContext('debug');

    this.print(fmt.gray(text));
  }

  progressStart(text: string): void {
    this.changeContext('progress');

    this.spinner.start(text);
  }

  progressStop(): void {
    if (this.context !== 'progress') {
      return;
    }
    this.exitContext();

    this.spinner.stop();
  }

  progressSuccess(text?: string, symbol?: string): void {
    if (this.context !== 'progress') {
      return;
    }
    this.exitContext();

    symbol !== undefined
      ? this.spinner.stopAndPersist({ symbol })
      : this.spinner.succeed(text);
  }

  progressFailure(text?: string): void {
    if (this.context !== 'progress') {
      return;
    }
    this.exitContext();

    this.spinner.fail(text);
  }

  progressWarn(input?: { text?: string; warnText: string }): void {
    if (this.context !== 'progress') {
      return;
    }
    this.exitContext();

    const currentText = this.spinner.text;
    const text =
      input && `${input.text ?? currentText} - ${fmt.yellow(input.warnText)}`;

    this.spinner.stopAndPersist({
      symbol: fmt.yellow('⚠'),
      text,
    });
  }

  prompt<T extends inquirer.Answers>(
    questions:
      | inquirer.DistinctQuestion<T>
      | ReadonlyArray<inquirer.DistinctQuestion<T>>,
    initialAnswers?: Partial<T>
  ): ReturnType<typeof inquirer.prompt<T>> {
    const unifiedQuestions = toArray(questions).map(question => {
      const { message, prefix } = question;
      return {
        ...question,
        message:
          typeof message === 'function'
            ? async (answers: T) => fmt.reset(await message(answers))
            : typeof message === 'string'
            ? fmt.reset(message)
            : message,
        prefix: this.indentText(prefix ?? fmt.green('?')),
      };
    });

    this.changeContext('none');
    return inquirer.prompt(unifiedQuestions, initialAnswers);
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
      text.replace(
        Cli.NEW_LINE_REGEXP,
        newLine => newLine + this.getIndentStr()
      )
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
