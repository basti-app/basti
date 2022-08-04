import inquirer from "inquirer";

export async function selectLocalPort(): Promise<number> {
  const { localPort } = await inquirer.prompt({
    type: "number",
    name: "localPort",
    message: "Local port",
  });

  return localPort;
}
