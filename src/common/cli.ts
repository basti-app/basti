import chalk from "chalk";

export class Cli {
  info(message: string): void {
    console.log(message);
  }

  error(message: string): void {
    console.log("\n");
    console.log(chalk.red(message));
  }
}

export const cli = new Cli();
