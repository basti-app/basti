---
sidebar_position: 2
---

# Initialize Target

Before you can connect to a resource in your AWS VPC, you need to initialize it as a connection target. This is a one-time setup that creates the necessary infrastructure in your AWS account.

## Supported Target Types

Basti provides first-class support for:
- RDS instances
- Aurora clusters
- Elasticache clusters
- Custom targets (any TCP service in your VPC)

## Interactive Initialization

The simplest way to initialize a target is using the interactive mode:

```bash
basti init
```

This command will:
1. Prompt you to select a target type
2. List available resources of that type
3. Ask you to select a public VPC subnet for the bastion instance
4. Set up the required infrastructure

## Non-Interactive Initialization

For CI/CD pipelines or automation scripts, you can use command-line arguments:

```bash
# For RDS instance
basti init --rds-instance your-instance-id

# For custom target
basti init --custom-target --vpc vpc-id --target-host 10.0.0.1 --target-port 5432
```

## Initialization Options

During initialization, you can customize various aspects:

- Resource tags
- Bastion instance type
- Public IP assignment
- VPC subnet selection

See [Advanced Initialization Options](../advanced-features/initialization-options) for more details.

## Verification

After initialization, you can verify the setup by running:

```bash
basti list
```

This will show all initialized targets in your AWS account.

## Next Steps

Once your target is initialized, you can:
- [Connect to Your Resource](./connect-to-resources)
- [Use the Resource Locally](./using-resources)
- [Clean Up Resources](./cleanup)
