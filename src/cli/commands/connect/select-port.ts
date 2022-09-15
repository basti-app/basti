import inquirer from 'inquirer';

export async function selectPort(message: string): Promise<number> {
  const { localPort } = await inquirer.prompt({
    type: 'input',
    name: 'localPort',
    message,
    validate: validatePort,
  });

  return localPort;
}

function validatePort(input: unknown): boolean | string {
  const inputNumber = Number(input);

  if (isNaN(inputNumber) || inputNumber < 1 || inputNumber > 65535) {
    return 'Invalid port number';
  }

  return true;
}
