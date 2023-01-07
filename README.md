# Basti

Basti is a CLI tool for connecting to DB instances and other resources in AWS private networks on a budget.

![demo](./docs/demo/demo.gif)

## How it works

In order to establish a connection, Basti sets up a so called bastion EC2 instance in the same VPC as the connection target. The instance is then used together with the AWS Session Manager to establish a secure port forwarding session and make the target available on your localhost. Basti takes care of keeping the bastion instance stopped when it's not used to make the solution cost as low as 0.001 USD per minute of connection plus 0.01 USD per month for maintaining the instance in a stopped state. Please, refer to the [Security](#security) section for more information on the secureness of using Basti.

TODO: calculate the actual usage prices.

## Simple usage

First, initialize your connection target for use with Basti. You only need to do this once.

```sh
basti init
```

The command will set up all the infrastructure required to start a connection. You will be prompted for a target to initialize and a public VPC subnet to create the bastion EC2 instance in.

<br/>

Now, you can connect to your target.

```sh
basti connect
```

This command will establish a secure port forwarding session and make the target available on your localhost. You will be prompted for the target to connect to as well as the local port to forward the connection to.

<br/>

Finally, you can use your target the same way as it was running on your localhost.

```sh
psql -h localhost -p 5432
```

<br/>

You can remove all the resources created by Basti in you AWS account.

```sh
basti cleanup
```

The list of resources will be displayed and you will be prompted to confirm the cleanup.

## Installation

```sh
npm install --global basti
```

Other, NodeJS-independent, installation options are coming soon!
