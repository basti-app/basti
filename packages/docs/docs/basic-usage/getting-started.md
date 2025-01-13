---
sidebar_position: 1
---

# Getting Started

## Prerequisites

Before you start using Basti, ensure you have:

1. **AWS Credentials** configured in your system - Basti uses AWS SDK and relies on credentials to be configured in your system. You can use any of [the supported methods](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html) to configure credentials.

> 💡 If you can use AWS CLI in your terminal, Basti should work as well.

2. **Node.js** (if installing via npm) or **Homebrew** (if installing via brew)

## Installation

Choose one of the following installation methods:

### Using Homebrew

```bash
brew install basti
```

### Using npm

```bash
npm install --global basti
```

## Verifying Installation

After installation, verify that Basti is properly installed by running:

```bash
basti --version
```

This should display the current version of Basti installed on your system.

## Next Steps

Now that you have Basti installed, you can proceed to:
- [Initialize Your First Target](./initialize-target)
- [Connect to Resources](./connect-to-resources)
- [Using Resources Locally](./using-resources)
