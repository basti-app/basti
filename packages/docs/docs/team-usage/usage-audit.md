---
sidebar_position: 2
---

# Usage Audit

Learn how to audit and monitor Basti usage across your organization.

## CloudTrail Logging

### Enable CloudTrail

```json
{
  "Version": "1.0",
  "Trail": {
    "Name": "basti-audit-trail",
    "S3BucketName": "your-audit-bucket",
    "IncludeGlobalServiceEvents": true,
    "IsMultiRegionTrail": true,
    "EnableLogFileValidation": true,
    "KmsKeyId": "arn:aws:kms:region:account-id:key/key-id",
    "LogFilePrefix": "basti-audit/"
  }
}
```

### Relevant Events

1. **Session Manager Events**
   - `StartSession`
   - `TerminateSession`
   - `ResumeSession`

2. **EC2 Events**
   - `RunInstances`
   - `StartInstances`
   - `StopInstances`
   - `TerminateInstances`

## CloudWatch Metrics

### Custom Metrics

```bash
aws cloudwatch put-metric-data \
  --namespace "Basti" \
  --metric-name "ActiveSessions" \
  --value $(basti list --active | wc -l)
```

### Dashboard

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["Basti", "ActiveSessions"]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-west-2",
        "title": "Active Basti Sessions"
      }
    }
  ]
}
```

## Cost Monitoring

### Cost Tags

```json
{
  "defaultTags": {
    "CostCenter": "basti",
    "Service": "database-access"
  }
}
```

### Cost Explorer

```python
import boto3

def get_basti_costs():
    client = boto3.client('ce')
    
    response = client.get_cost_and_usage(
        TimePeriod={
            'Start': '2023-01-01',
            'End': '2023-12-31'
        },
        Granularity='MONTHLY',
        Filter={
            'Tags': {
                'Key': 'Service',
                'Values': ['database-access']
            }
        },
        Metrics=['UnblendedCost']
    )
    return response
```

## Usage Reports

### Session Report

```python
import boto3
from datetime import datetime, timedelta

def generate_session_report():
    client = boto3.client('cloudtrail')
    
    response = client.lookup_events(
        LookupAttributes=[
            {
                'AttributeKey': 'EventName',
                'AttributeValue': 'StartSession'
            }
        ],
        StartTime=datetime.now() - timedelta(days=30)
    )
    return response
```

### Resource Usage

```python
def get_resource_usage():
    ec2 = boto3.client('ec2')
    
    instances = ec2.describe_instances(
        Filters=[
            {
                'Name': 'tag:ManagedBy',
                'Values': ['basti']
            }
        ]
    )
    return instances
```

## Monitoring and Alerts

### CloudWatch Alarms

```json
{
  "AlarmName": "BastionInstanceCount",
  "ComparisonOperator": "GreaterThanThreshold",
  "EvaluationPeriods": 1,
  "MetricName": "RunningInstances",
  "Namespace": "Basti",
  "Period": 300,
  "Statistic": "Average",
  "Threshold": 10,
  "AlarmActions": [
    "arn:aws:sns:region:account-id:topic-name"
  ]
}
```

### SNS Notifications

```python
def notify_team(message):
    sns = boto3.client('sns')
    
    response = sns.publish(
        TopicArn='arn:aws:sns:region:account-id:topic-name',
        Message=message,
        Subject='Basti Usage Alert'
    )
    return response
```

## Best Practices

1. **Regular Auditing**
   - Daily usage reports
   - Weekly cost analysis
   - Monthly compliance review

2. **Monitoring Setup**
   - Set up alerts
   - Track metrics
   - Monitor costs

3. **Documentation**
   - Audit procedures
   - Alert responses
   - Cost allocation

4. **Compliance**
   - Data retention
   - Access controls
   - Audit trails

## Example Scripts

### Usage Summary

```python
#!/usr/bin/env python3

import boto3
from datetime import datetime, timedelta

def get_usage_summary():
    # Initialize clients
    cloudtrail = boto3.client('cloudtrail')
    ec2 = boto3.client('ec2')
    
    # Get session information
    sessions = cloudtrail.lookup_events(
        LookupAttributes=[
            {
                'AttributeKey': 'EventName',
                'AttributeValue': 'StartSession'
            }
        ],
        StartTime=datetime.now() - timedelta(days=7)
    )
    
    # Get instance information
    instances = ec2.describe_instances(
        Filters=[
            {
                'Name': 'tag:ManagedBy',
                'Values': ['basti']
            }
        ]
    )
    
    return {
        'sessions': sessions['Events'],
        'instances': instances['Reservations']
    }

if __name__ == '__main__':
    summary = get_usage_summary()
    print(f"Sessions last 7 days: {len(summary['sessions'])}")
    print(f"Active instances: {len(summary['instances'])}")
```

## Next Steps

Learn about:
- [Minimal IAM Permissions](./minimal-iam)
- [Shared Configuration](./shared-configuration)
- [Security](../security/iam-permissions)
