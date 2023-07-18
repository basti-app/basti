import * as cdk from 'aws-cdk-lib';
import { aws_ec2, aws_rds } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { BastiAccessSecurityGroup, BastiInstance } from '../src';

describe('BastiAccessSecurityGroupTest', () => {
  test('normal-access-security-group', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack');

    const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

    const bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
      bastiStack,
      'bastiAccessSecurityGroup',
      {
        vpc: bastiVpc,
      }
    );

    // We also test that an RDS instance still accepts this security group.
    const rdsInstance = new aws_rds.DatabaseInstance(
      bastiStack,
      'rdsInstance',
      {
        vpc: bastiVpc,
        engine: aws_rds.DatabaseInstanceEngine.POSTGRES,
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.BURSTABLE2,
          aws_ec2.InstanceSize.MICRO
        ),
        securityGroups: [bastiAccessSecurityGroup],
      }
    );

    // Check that the properties are set correctly.
    expect(rdsInstance.connections.securityGroups).toEqual([
      bastiAccessSecurityGroup,
    ]);

    // Oke we want to check that the security group is created correctly.
    // 1. Test that it has the correct name.
    // 2. Check that it is attached to the RDS instance.

    const template = Template.fromStack(bastiStack);

    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupName: 'basti-access-2b2e6f7d',
    });

    template.hasResourceProperties('AWS::RDS::DBInstance', {
      VPCSecurityGroups: [
        {
          'Fn::GetAtt': ['bastiAccessSecurityGroup1CDB2AFB', 'GroupId'],
        },
      ],
    });
  });

  test('custom-access-security-group', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack');

    const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

    const bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
      bastiStack,
      'bastiAccessSecurityGroup',
      {
        vpc: bastiVpc,
        bastiId: 'TEST_ID',
      }
    );

    // We also test that an RDS instance still accepts this security group.
    const rdsInstance = new aws_rds.DatabaseInstance(
      bastiStack,
      'rdsInstance',
      {
        vpc: bastiVpc,
        engine: aws_rds.DatabaseInstanceEngine.POSTGRES,
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.BURSTABLE2,
          aws_ec2.InstanceSize.MICRO
        ),
        securityGroups: [bastiAccessSecurityGroup],
      }
    );

    // Check that the properties are set correctly.
    expect(rdsInstance.connections.securityGroups).toEqual([
      bastiAccessSecurityGroup,
    ]);

    // Oke we want to check that the security group is created correctly.
    // 1. Test that it has the correct name.
    // 2. Check that it is attached to the RDS instance.

    const template = Template.fromStack(bastiStack);

    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupName: 'basti-access-TEST_ID',
    });

    template.hasResourceProperties('AWS::RDS::DBInstance', {
      VPCSecurityGroups: [
        {
          'Fn::GetAtt': ['bastiAccessSecurityGroup1CDB2AFB', 'GroupId'],
        },
      ],
    });
  });

  test('access-security-group-with-basti', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack');

    const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

    const bastiAccessSecurityGroup = new BastiAccessSecurityGroup(
      bastiStack,
      'bastiAccessSecurityGroup',
      {
        vpc: bastiVpc,
      }
    );

    const basti = new BastiInstance(bastiStack, 'basti', {
      vpc: bastiVpc,
    });

    // We also test that an RDS instance still accepts this security group.
    const rdsInstance = new aws_rds.DatabaseInstance(
      bastiStack,
      'rdsInstance',
      {
        vpc: bastiVpc,
        engine: aws_rds.DatabaseInstanceEngine.POSTGRES,
        instanceType: aws_ec2.InstanceType.of(
          aws_ec2.InstanceClass.BURSTABLE2,
          aws_ec2.InstanceSize.MICRO
        ),
        securityGroups: [bastiAccessSecurityGroup],
        port: 5432,
      }
    );

    bastiAccessSecurityGroup.addBastiInstance(
      basti,
      aws_ec2.Port.tcp(rdsInstance.instanceEndpoint.port)
    );

    // Check that the properties are set correctly.
    expect(rdsInstance.connections.securityGroups).toEqual([
      bastiAccessSecurityGroup,
    ]);

    const template = Template.fromStack(bastiStack);

    template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
      IpProtocol: 'tcp',
      FromPort: {
        'Fn::GetAtt': ['rdsInstance05F4B4B0', 'Endpoint.Port'],
      },
      ToPort: {
        'Fn::GetAtt': ['rdsInstance05F4B4B0', 'Endpoint.Port'],
      },
      SourceSecurityGroupId: {
        'Fn::GetAtt': ['bastibastiinstancesg0EAC2736', 'GroupId'],
      },
    });

    template.hasResourceProperties('AWS::RDS::DBInstance', {
      VPCSecurityGroups: [
        {
          'Fn::GetAtt': ['bastiAccessSecurityGroup1CDB2AFB', 'GroupId'],
        },
      ],
    });
  });
});
