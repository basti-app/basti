---
sidebar_position: 5
---

# Cleanup

When you no longer need a connection target, you can remove all associated AWS resources to avoid any ongoing costs.

## Interactive Cleanup

The safest way to clean up resources is using the interactive mode:

```bash
basti cleanup
```

This will:
1. List all resources that will be removed
2. Ask for confirmation before proceeding
3. Remove the resources after confirmation

## Non-Interactive Cleanup

For automation scripts, use the force flag:

```bash
basti cleanup --force
```

> ⚠️ Use `--force` with caution as it will remove resources without confirmation

## What Gets Removed

The cleanup process removes:
- Bastion EC2 instance
- Associated security groups
- IAM roles and policies
- Other related resources

## Verification

After cleanup, verify that resources were removed:

```bash
# Should show no initialized targets
basti list

# Check AWS Console for any remaining resources
```

## Best Practices

1. **Before Cleanup**
   - Ensure no active connections are using the target
   - Back up any important configuration
   - Document settings if you plan to reinitialize later

2. **After Cleanup**
   - Verify all resources are removed
   - Update any documentation or scripts referencing the target
   - Remove related entries from configuration files

## Next Steps

Learn about:
- [Advanced Features](../advanced-features/initialization-options)
- [Team Usage](../team-usage/shared-configuration)
- [Security Considerations](../security/network-security)
