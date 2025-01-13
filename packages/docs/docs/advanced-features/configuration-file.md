---
sidebar_position: 3
---

# Configuration File

Basti supports configuration files to store common settings and share them across your team.

## Configuration File Location

Basti looks for configuration in the following locations (in order):
1. Path specified by `--config` flag
2. `.basti/config.json` in current directory
3. `~/.basti/config.json` in home directory

## Basic Configuration

Create a `config.json` file:

```json
{
  "defaultInstanceType": "t3.micro",
  "defaultTags": {
    "Project": "my-project",
    "Environment": "development"
  },
  "targets": {
    "prod-db": {
      "type": "rds",
      "instanceId": "my-rds-instance",
      "region": "us-west-2",
      "localPort": 5432
    },
    "staging-redis": {
      "type": "elasticache",
      "clusterId": "my-redis-cluster",
      "region": "us-east-1",
      "localPort": 6379
    }
  }
}
```

## Configuration Options

### Global Settings

```json
{
  "defaultInstanceType": "t3.micro",
  "defaultRegion": "us-west-2",
  "defaultTags": {
    "Project": "my-project"
  },
  "bastion": {
    "assignPublicIp": true,
    "subnetId": "subnet-123",
    "idleTimeout": 3600
  }
}
```

### Target Configuration

```json
{
  "targets": {
    "target-name": {
      // RDS target
      "type": "rds",
      "instanceId": "instance-id",
      "region": "us-west-2",
      "localPort": 5432,
      
      // Custom target
      "type": "custom",
      "vpcId": "vpc-id",
      "host": "10.0.0.1",
      "port": 5432,
      
      // Override global settings
      "instanceType": "t3.small",
      "tags": {
        "Environment": "production"
      }
    }
  }
}
```

## Using Configuration

### Command Line

Specify config file:
```bash
basti init --config ./my-config.json
```

Reference target:
```bash
basti connect prod-db
```

### Environment Variables

Override config values:
```bash
export BASTI_CONFIG_FILE=./my-config.json
export BASTI_DEFAULT_REGION=us-east-1
```

## Sharing Configuration

### Team Usage

1. Store in version control:
   ```bash
   # .gitignore
   !.basti/config.json
   ```

2. Use environment variables for secrets:
   ```json
   {
     "targets": {
       "prod-db": {
         "instanceId": "${PROD_DB_INSTANCE}"
       }
     }
   }
   ```

### Multiple Environments

Create environment-specific configs:

```
.basti/
  ├── config.json          # Default config
  ├── config.dev.json      # Development
  ├── config.staging.json  # Staging
  └── config.prod.json     # Production
```

Select environment:
```bash
basti connect --config .basti/config.prod.json prod-db
```

## Best Practices

1. **Version Control**
   - Commit configuration files
   - Use environment variables for secrets
   - Document required variables

2. **Organization**
   - Group related targets
   - Use consistent naming
   - Add comments for clarity

3. **Security**
   - Don't store sensitive data
   - Use IAM roles for authentication
   - Validate configuration files

## Next Steps

Learn about:
- [Infrastructure as Code](./infrastructure-as-code)
- [Team Usage](../team-usage/shared-configuration)
- [Security](../security/iam-permissions)
