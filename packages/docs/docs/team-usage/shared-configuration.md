---
sidebar_position: 1
---

# Shared Configuration

Learn how to effectively share Basti configuration across your team or organization.

## Configuration Structure

### Project Layout

```
your-project/
├── .basti/
│   ├── config.json             # Default configuration
│   ├── config.dev.json         # Development environment
│   ├── config.staging.json     # Staging environment
│   └── config.prod.json        # Production environment
├── .gitignore
└── README.md
```

### Base Configuration

```json
{
  "defaultInstanceType": "t3.micro",
  "defaultRegion": "us-west-2",
  "defaultTags": {
    "Project": "your-project",
    "ManagedBy": "basti"
  },
  "targets": {
    "dev-db": {
      "type": "rds",
      "instanceId": "${DEV_DB_INSTANCE_ID}",
      "region": "us-west-2",
      "localPort": 5432
    }
  }
}
```

### Environment-Specific Configuration

```json
{
  "extends": "./config.json",
  "defaultTags": {
    "Environment": "production"
  },
  "targets": {
    "prod-db": {
      "type": "rds",
      "instanceId": "${PROD_DB_INSTANCE_ID}",
      "region": "us-west-2",
      "localPort": 5432
    }
  }
}
```

## Version Control Integration

### Git Configuration

```gitignore
# .gitignore
!.basti/
.basti/*.local.json
```

### Environment Variables

```bash
# .env.example
DEV_DB_INSTANCE_ID=your-dev-db
PROD_DB_INSTANCE_ID=your-prod-db
```

## Team Workflows

### Developer Setup

1. Clone repository:
   ```bash
   git clone your-project
   cd your-project
   ```

2. Copy environment template:
   ```bash
   cp .env.example .env
   ```

3. Configure environment:
   ```bash
   # .env
   DEV_DB_INSTANCE_ID=your-dev-db
   ```

### Using Shared Targets

```bash
# Development
basti connect --config .basti/config.dev.json dev-db

# Production
basti connect --config .basti/config.prod.json prod-db
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
          
      - name: Install Basti
        run: npm install -g basti
        
      - name: Run Database Migration
        env:
          PROD_DB_INSTANCE_ID: ${{ secrets.PROD_DB_INSTANCE_ID }}
        run: |
          basti connect \
            --config .basti/config.prod.json \
            --non-interactive \
            prod-db
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  script:
    - npm install -g basti
    - |
      basti connect \
        --config .basti/config.prod.json \
        --non-interactive \
        prod-db
  only:
    - main
```

## Best Practices

1. **Configuration Management**
   - Use version control
   - Separate environments
   - Document variables

2. **Security**
   - Never commit secrets
   - Use environment variables
   - Implement access controls

3. **Team Communication**
   - Document setup process
   - Share best practices
   - Maintain changelog

4. **Maintenance**
   - Regular updates
   - Configuration reviews
   - Clean up unused targets

## Example Scenarios

### Multiple Teams

```json
{
  "targets": {
    "team-a-db": {
      "type": "rds",
      "instanceId": "${TEAM_A_DB_ID}",
      "tags": {
        "Team": "team-a"
      }
    },
    "team-b-db": {
      "type": "rds",
      "instanceId": "${TEAM_B_DB_ID}",
      "tags": {
        "Team": "team-b"
      }
    }
  }
}
```

### Cross-Account Access

```json
{
  "targets": {
    "prod-db": {
      "type": "rds",
      "instanceId": "db-123",
      "roleArn": "arn:aws:iam::ACCOUNT_ID:role/BastiCrossAccountRole"
    }
  }
}
```

## Next Steps

Learn about:
- [Usage Audit](./usage-audit)
- [Minimal IAM Permissions](./minimal-iam)
- [Security](../security/iam-permissions)
