---
sidebar_position: 4
---

# Infrastructure as Code

Basti can be integrated with Infrastructure as Code (IaC) tools to manage your connection targets as part of your infrastructure.

## Terraform Integration

### Resource Definitions

```hcl
# bastion.tf

# Create Basti bastion instance
resource "aws_instance" "basti_bastion" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.micro"
  subnet_id     = var.public_subnet_id
  
  tags = {
    Name = "basti-bastion"
    Project = var.project_name
  }
  
  vpc_security_group_ids = [aws_security_group.basti_bastion.id]
  iam_instance_profile   = aws_iam_instance_profile.basti_bastion.name
}

# Security group for bastion
resource "aws_security_group" "basti_bastion" {
  name        = "basti-bastion"
  description = "Security group for Basti bastion instance"
  vpc_id      = var.vpc_id
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "basti-bastion-sg"
    Project = var.project_name
  }
}

# IAM role for bastion
resource "aws_iam_role" "basti_bastion" {
  name = "basti-bastion-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Attach required policies
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.basti_bastion.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
```

### Outputs

```hcl
# outputs.tf

output "bastion_instance_id" {
  value = aws_instance.basti_bastion.id
}

output "bastion_security_group_id" {
  value = aws_security_group.basti_bastion.id
}
```

### Variables

```hcl
# variables.tf

variable "vpc_id" {
  description = "VPC ID where Basti resources will be created"
  type        = string
}

variable "public_subnet_id" {
  description = "Public subnet ID for bastion instance"
  type        = string
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
}
```

## CloudFormation Integration

### Template

```yaml
# basti-stack.yaml

Resources:
  BastionInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t3.micro
      ImageId: !Ref AmazonLinux2AMI
      SubnetId: !Ref PublicSubnetId
      SecurityGroupIds: 
        - !Ref BastionSecurityGroup
      IamInstanceProfile: !Ref BastionInstanceProfile
      Tags:
        - Key: Name
          Value: basti-bastion
        
  BastionSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for Basti bastion instance
      VpcId: !Ref VpcId
      SecurityGroupEgress:
        - IpProtocol: -1
          FromPort: -1
          ToPort: -1
          CidrIp: 0.0.0.0/0
          
  BastionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: ec2.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

Parameters:
  VpcId:
    Type: AWS::EC2::VPC::Id
    Description: VPC where Basti resources will be created
    
  PublicSubnetId:
    Type: AWS::EC2::Subnet::Id
    Description: Public subnet for bastion instance
    
  AmazonLinux2AMI:
    Type: AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>
    Default: /aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2

Outputs:
  BastionInstanceId:
    Description: ID of the Basti bastion instance
    Value: !Ref BastionInstance
    
  BastionSecurityGroupId:
    Description: ID of the Basti security group
    Value: !Ref BastionSecurityGroup
```

## Pulumi Integration

### TypeScript Example

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create bastion instance
const bastionInstance = new aws.ec2.Instance("basti-bastion", {
    instanceType: "t3.micro",
    ami: aws.getAmi({
        mostRecent: true,
        owners: ["amazon"],
        filters: [{
            name: "name",
            values: ["amzn2-ami-hvm-*-x86_64-gp2"],
        }],
    }).then(ami => ami.id),
    subnetId: config.publicSubnetId,
    vpcSecurityGroupIds: [bastionSg.id],
    iamInstanceProfile: bastionInstanceProfile.name,
    tags: {
        Name: "basti-bastion",
        Project: config.projectName,
    },
});

// Export resources
export const bastionInstanceId = bastionInstance.id;
export const bastionSecurityGroupId = bastionSg.id;
```

## Best Practices

1. **Resource Naming**
   - Use consistent naming conventions
   - Add descriptive tags
   - Include environment indicators

2. **Security**
   - Follow least privilege principle
   - Use security groups effectively
   - Enable proper logging

3. **Maintainability**
   - Modularize your code
   - Use variables for configuration
   - Document your infrastructure

4. **Cost Management**
   - Use appropriate instance types
   - Implement auto-shutdown
   - Monitor resource usage

## Next Steps

Learn about:
- [Team Usage](../team-usage/shared-configuration)
- [Security](../security/iam-permissions)
- [Configuration File](./configuration-file)
