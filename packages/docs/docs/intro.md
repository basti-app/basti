---
sidebar_position: 1
slug: /
---

# Introduction

Welcome to **Basti** _(from [Bastion Host](https://en.wikipedia.org/wiki/Bastion_host))_ - a powerful CLI tool that enables secure access to your DB instances and other AWS resources in private networks at virtually no cost.

<div align="center">
  <img alt="Demo" src="https://user-images.githubusercontent.com/45905756/211385579-3ac54ad5-7c90-4b68-9b22-239f4b26ad61.gif" />
</div>

## 🌟 Key Features

- **Zero Idle Costs** - Pay only for what you use, with costs as low as ≈ 0.01 USD per connection hour
- **No SSH Keys** - Fully IAM-driven security model
- **AWS Session Manager Integration** - Leverages AWS's secure and auditable connection management
- **Team-Friendly** - Share configurations across your organization
- **Infrastructure as Code Ready** - Perfect for CI/CD pipelines
- **First-Class Support** for RDS, Aurora, and Elasticache
- **Custom Target Support** - Connect to any TCP service in your VPC

## 🚀 Quick Start

1. **Install Basti**
```bash
# Using homebrew
brew install basti

# Or using npm
npm install --global basti
```

2. **Initialize your target**
```bash
basti init
```

3. **Connect to your resource**
```bash
basti connect
```

4. **Use your resource locally**
```bash
# Example for PostgreSQL
psql -h localhost -p 5432
```

## 🔍 Why Basti?

Basti enhances AWS Session Manager by:
- Automating bastion instance management
- Providing convenient configuration storage
- Improving session stability
- Offering team-friendly sharing options

## 📚 Next Steps

Dive deeper into Basti's capabilities:

- [Basic Usage Guide](./category/basic-usage)
- [Advanced Features](./category/advanced-features)
- [Security & IAM](./category/security)
- [Team Usage](./category/team-usage)
- [Reference Documentation](./category/reference)
