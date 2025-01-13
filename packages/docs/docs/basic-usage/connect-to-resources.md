---
sidebar_position: 3
---

# Connect to Resources

After initializing a target, you can establish a secure connection that makes the target available on your localhost.

## Interactive Connection

The simplest way to connect is using the interactive mode:

```bash
basti connect
```

This will:
1. List your initialized targets
2. Let you select the target to connect to
3. Prompt for a local port to forward the connection to
4. Establish a secure port forwarding session

## Non-Interactive Connection

For automation or scripts, use command-line arguments:

```bash
# Connect to RDS instance
basti connect --rds-instance your-instance-id --local-port 5432

# Connect to custom target
basti connect --custom-target your-target-name --local-port 6379
```

## Connection Process

When you run the connect command, Basti:

1. Starts the bastion instance (if it's stopped)
2. Waits for the instance to be ready
3. Establishes a secure port forwarding session using AWS Session Manager
4. Makes the target available on your specified localhost port

## Session Management

Basti maintains the connection by:
- Automatically restarting failed sessions
- Handling expired sessions
- Managing the bastion instance lifecycle

To end a connection:
1. Press `Ctrl+C` in your terminal
2. Basti will gracefully close the session
3. The bastion instance will be stopped after a configurable idle timeout

## Troubleshooting

If you encounter connection issues:

1. Verify your AWS credentials are valid
2. Check if the target was properly initialized
3. Ensure the local port isn't in use
4. Review the [Security & IAM](../security/iam-permissions) requirements

## Next Steps

Now that you're connected:
- [Use Your Resource Locally](./using-resources)
- [Configure Automatic Mode](../advanced-features/automatic-mode)
- [Set Up Team Usage](../team-usage/shared-configuration)
