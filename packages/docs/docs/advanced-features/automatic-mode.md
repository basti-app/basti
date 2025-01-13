---
sidebar_position: 2
---

# Automatic Mode

Basti's automatic mode enables non-interactive usage, perfect for CI/CD pipelines and automation scripts.

## Basic Usage

### Initialization

```bash
# Initialize RDS target
basti init --non-interactive \
  --rds-instance your-instance-id \
  --subnet subnet-id

# Initialize custom target
basti init --non-interactive \
  --custom-target \
  --vpc vpc-id \
  --target-host 10.0.0.1 \
  --target-port 5432
```

### Connection

```bash
# Connect to target
basti connect --non-interactive \
  --rds-instance your-instance-id \
  --local-port 5432
```

## Environment Variables

Basti supports configuration through environment variables:

```bash
# AWS credentials
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-west-2

# Basti configuration
export BASTI_NON_INTERACTIVE=true
export BASTI_DEFAULT_INSTANCE_TYPE=t3.micro
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Database Migration
on: [push]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-west-2
      
      - name: Install Basti
        run: npm install -g basti
      
      - name: Initialize and connect to database
        run: |
          basti init --non-interactive \
            --rds-instance ${{ secrets.DB_INSTANCE }} \
            --subnet ${{ secrets.SUBNET_ID }}
          
          basti connect --non-interactive \
            --rds-instance ${{ secrets.DB_INSTANCE }} \
            --local-port 5432 &
          
          # Wait for connection to be established
          sleep 10
          
          # Run migrations
          npm run migrate
```

### GitLab CI Example

```yaml
variables:
  BASTI_NON_INTERACTIVE: "true"

database-migration:
  script:
    - npm install -g basti
    - |
      basti init \
        --rds-instance $DB_INSTANCE \
        --subnet $SUBNET_ID
    - |
      basti connect \
        --rds-instance $DB_INSTANCE \
        --local-port 5432 &
    - sleep 10
    - npm run migrate
```

## Error Handling

In automatic mode:
- Errors result in non-zero exit codes
- Error messages are written to stderr
- Detailed logs help troubleshooting

Example error handling:

```bash
#!/bin/bash
set -e

if ! basti init --non-interactive --rds-instance $DB_ID; then
  echo "Failed to initialize target"
  exit 1
fi

if ! basti connect --non-interactive --rds-instance $DB_ID --local-port 5432; then
  echo "Failed to connect to target"
  exit 1
fi
```

## Best Practices

1. **Always specify timeouts**
   ```bash
   # Add timeout to connection
   timeout 5m basti connect --non-interactive ...
   ```

2. **Use environment variables for sensitive data**
   ```bash
   basti init --non-interactive \
     --rds-instance $DB_INSTANCE \
     --subnet $SUBNET_ID
   ```

3. **Implement proper cleanup**
   ```bash
   # Cleanup on script exit
   trap "basti cleanup --force" EXIT
   ```

## Next Steps

Learn about:
- [Configuration File](./configuration-file)
- [Infrastructure as Code](./infrastructure-as-code)
- [Team Usage](../team-usage/shared-configuration)
