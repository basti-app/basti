---
sidebar_position: 1
---

# Advanced Initialization Options

Basti provides several advanced options during target initialization to customize the setup according to your needs.

## Resource Tags

You can apply AWS tags to all resources created by Basti in three ways:

### 1. Interactive Mode

```bash
basti init
# Select "Advanced Options" when prompted
# Enter tags in the format: key=value
```

### 2. Command Line Tags

```bash
basti init --tag Project=my-project --tag Environment=production
```

### 3. Tags File

Create a JSON file with your tags:
```json
{
  "Project": "my-project",
  "Environment": "production",
  "CostCenter": "team-a"
}
```

Use the file during initialization:
```bash
basti init --tags-file ./my-tags.json
```

> 💡 Tags with the same name are overwritten in order of specification, with --tag having highest priority

## Bastion Instance Type

Customize the EC2 instance type used for the bastion:

```bash
basti init --bastion-instance-type t3.micro
```

Default: `t2.micro`

Consider factors like:
- Network performance requirements
- Cost constraints
- AWS region availability

## Public IP Address

By default, Basti assigns a public IP to enable outbound-only AWS service connections.

Disable public IP:
```bash
basti init --bastion-assign-public-ip false
```

Requirements when disabling public IP:
- VPC must have NAT Gateway
- Proper routing to AWS Session Manager endpoints
- Appropriate security group rules

## VPC Subnet Selection

Choose specific subnets for the bastion instance:

```bash
basti init --subnet subnet-id
```

Considerations:
- Must be a public subnet (unless using private subnets with NAT)
- Should have route to internet (for Session Manager)
- Appropriate NACL rules

## Complete Example

Combining multiple options:

```bash
basti init \
  --rds-instance my-db \
  --bastion-instance-type t3.micro \
  --bastion-assign-public-ip true \
  --subnet subnet-123 \
  --tag Project=my-project \
  --tags-file ./my-tags.json
```

## Next Steps

Learn about:
- [Automatic Mode](./automatic-mode)
- [Configuration File](./configuration-file)
- [Infrastructure as Code](./infrastructure-as-code)
