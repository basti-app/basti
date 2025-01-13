---
sidebar_position: 4
---

# Using Resources Locally

Once Basti establishes a connection, you can use your AWS resources as if they were running locally on your machine.

## Database Clients

### PostgreSQL Example

```bash
# Connect using psql
psql -h localhost -p 5432 -U your_username -d your_database

# Using connection string
postgresql://your_username:your_password@localhost:5432/your_database
```

### MySQL Example

```bash
# Connect using mysql client
mysql -h localhost -P 3306 -u your_username -p

# Using connection string
mysql://your_username:your_password@localhost:3306/your_database
```

### Redis Example

```bash
# Connect using redis-cli
redis-cli -h localhost -p 6379

# Using connection string
redis://localhost:6379
```

## Application Configuration

Update your application's configuration to use localhost:

```javascript
// Node.js example
const config = {
  host: 'localhost',
  port: 5432,
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
};
```

```python
# Python example
config = {
    'host': 'localhost',
    'port': 5432,
    'user': 'your_username',
    'password': 'your_password',
    'database': 'your_database'
}
```

## Custom TCP Services

For custom targets, use the appropriate client software configured to connect to localhost on your specified port.

## Best Practices

1. **Keep the Connection Active**
   - Basti will maintain the connection
   - The session will automatically reconnect if interrupted
   - The bastion instance remains running while in use

2. **Resource Cleanup**
   - Press `Ctrl+C` to end the connection when done
   - The bastion instance will stop automatically after idle timeout
   - Run `basti cleanup` to remove resources if no longer needed

3. **Security**
   - Use strong passwords and credentials
   - Keep your AWS credentials secure
   - Follow the principle of least privilege with IAM roles

## Next Steps

Learn about advanced features:
- [Automatic Mode](../advanced-features/automatic-mode)
- [Configuration File](../advanced-features/configuration-file)
- [Infrastructure as Code](../advanced-features/infrastructure-as-code)
