import chalk from 'chalk';

export class Fmt {
  value(message: string): string {
    return chalk.cyan(message);
  }

  resourceName({ id, name }: { id: string; name?: string }): string {
    return name ? `${id} - ${name}` : id;
  }

  list(items: string[], indent: number = 0): string {
    const prefix = this.getListItemPrefix(indent);

    return prefix + items.join('\n' + prefix);
  }

  code(message: string): string {
    return chalk.gray.italic(`\`${message}\``);
  }

  green(message: string): string {
    return chalk.green(message);
  }

  red(message: string): string {
    return chalk.red(message);
  }

  yellow(message: string): string {
    return chalk.yellow(message);
  }

  blue(message: string): string {
    return chalk.blue(message);
  }

  capitalize(message: string): string {
    return message.charAt(0).toUpperCase() + message.slice(1);
  }

  lower(message: string): string {
    return message.charAt(0).toLowerCase() + message.slice(1);
  }

  private getListItemPrefix(indent: number): string {
    return ' '.repeat(indent).concat('• ');
  }
}

export const fmt = new Fmt();
