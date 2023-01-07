<h1 align="center">Basti</h1>

<div align="center">
  <a href="https://makeapullrequest.com/">
    <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat">
  </a>
  <a href="https://www.npmjs.com/package/basti">
    <img alt="NPM Package" src="https://img.shields.io/npm/v/basti?color=blue">
  </a>
  <a href="./LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/BohdanPetryshyn/basti">
  </a>
</div>

<br/>

<div align="center">
  Basti <em>(from <a href="https://en.wikipedia.org/wiki/Bastion_host"><strong>Basti</strong>on Host</a>)</em> is a CLI tool for accessing DB instances and other AWS resources in private networks almost at no cost.
</div>

<br/>

<div align="center">
  <img alt="Demo" src="./docs/demo/demo.gif">
</div>

## How it works

- Basti sets up a so called _bastion EC2 instance_ in the connection target's VPC.

- The bastion instance is used together with AWS Session Manager port forwarding functionality to make the target available on your _localhost_.

- Basti takes care of keeping the bastion instance stopped when it's not used to make the solution cost as low as **≈0.01 USD** per hour of connection plus **≈0.80 USD** per month of maintaining the instance in a stopped state.

- Security completely relies on AWS Session Manager and IAM policies. The bastion instance is not accessible from the Internet and no SSH keys are used.

## Basic usage

First, _initialize_ your connection target for use with Basti. You only need to do this _once_.

```sh
basti init
```

The command will set up all the infrastructure required to start a connection. You will be prompted for a target to initialize and a public VPC subnet to create the bastion EC2 instance in.

<br/>

Now, you can _connect_ to your target.

```sh
basti connect
```

This command will establish a secure port forwarding session and make the target available on your localhost. You will be prompted for the target to connect to as well as the local port to forward the connection to.

<br/>

Finally, you can use the target the same way as it was running on your _localhost_.

```sh
psql -h localhost -p 5432
```

<br/>

You can _remove all the resources_ created by Basti in you AWS account.

```sh
basti cleanup
```

The list of resources will be displayed and you will be prompted to confirm the cleanup.

## Installation

```sh
npm install --global basti
```

Other, NodeJS-independent, installation options are coming soon!
