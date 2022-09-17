import { cli } from '~/common/cli.js';

export async function selectPort(message: string): Promise<number> {
  const { localPort } = await cli.prompt({
    type: 'input',
    name: 'localPort',
    message,
    validate: validatePort,
  });

  return localPort;
}

function validatePort(input: unknown): boolean | string {
  const inputNumber = Number(input);

  if (Number.isNaN(inputNumber) || inputNumber < 1 || inputNumber > 65_535) {
    return 'Invalid port number';
  }

  return true;
}
