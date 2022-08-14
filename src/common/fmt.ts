import chalk from "chalk";

export class Fmt {
  value(message: string): string {
    return chalk.cyan(message);
  }

  name({ id, name }: { id: string; name?: string }): string {
    return name ? `${id} - ${name}` : id;
  }

  list(items: string[], indent: number = 0): string {
    const prefix = this.getListItemPrefix(indent);

    return prefix + items.join("\n" + prefix);
  }

  private getListItemPrefix(indent: number): string {
    return " ".repeat(indent).concat("• ");
  }
}

export const fmt = new Fmt();
