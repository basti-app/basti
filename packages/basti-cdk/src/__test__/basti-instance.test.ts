import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { aws_ec2, aws_iam } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize } from 'aws-cdk-lib/aws-ec2';

import { BastiInstance } from '../basti-instance';

describe('BastiInstanceTest', () => {
  test('basic-construct', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack');

    // We can just start with a simple creation of the basti instance.
    // without all the dependencies.
    const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

    const bastiInstance = new BastiInstance(bastiStack, 'bastiInstance', {
      vpc: bastiVpc,
    });

    // Check that the properties are set correctly.
    expect(bastiInstance.vpc).toEqual(bastiVpc);
    expect(bastiInstance.bastiId).toEqual('d8b7dc8b');

    // Prepare the stack for assertions.
    const template = Template.fromStack(bastiStack);

    template.hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't2.micro',
    });

    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'basti-instance-d8b7dc8b',
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'ec2.amazonaws.com',
            },
          },
        ],
      },
      ManagedPolicyArns: [
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              { Ref: 'AWS::Partition' },
              ':iam::aws:policy/AmazonSSMManagedInstanceCore',
            ],
          ],
        },
      ],
    });

    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupName: 'basti-instance-d8b7dc8b',
    });

    const instances = template.findResources('AWS::EC2::Instance');
    const instance = instances[Object.keys(instances)[0]];
    const tags = instance.Properties.Tags;
    // check that the list contains the correct tags.
    expect(tags).toContainEqual({
      Key: 'basti:in-use',
      Value: expect.stringContaining('T'),
    });
    expect(tags).toContainEqual({
      Key: 'basti:created-by',
      Value: 'CDK',
    });
    expect(tags).toContainEqual({
      Key: 'basti:id',
      Value: 'd8b7dc8b',
    });
    expect(tags).toContainEqual({
      Key: 'Name',
      Value: 'basti-instance-d8b7dc8b',
    });
  });

  test('modified-construct', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack');

    // We can just start with a simple creation of the basti instance.
    // without all the dependencies.
    const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

    const bastiInstance = new BastiInstance(bastiStack, 'bastiInstance', {
      vpc: bastiVpc,
      bastiId: 'TEST_ID',
      instanceType: aws_ec2.InstanceType.of(
        InstanceClass.T3,
        InstanceSize.NANO
      ),
    });

    // Check that the properties are set correctly.
    expect(bastiInstance.vpc).toEqual(bastiVpc);
    expect(bastiInstance.bastiId).toEqual('TEST_ID');

    // Prepare the stack for assertions.
    const template = Template.fromStack(bastiStack);

    template.hasResourceProperties('AWS::EC2::Instance', {
      InstanceType: 't3.nano',
    });

    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'basti-instance-TEST_ID',
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'ec2.amazonaws.com',
            },
          },
        ],
      },
      ManagedPolicyArns: [
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              { Ref: 'AWS::Partition' },
              ':iam::aws:policy/AmazonSSMManagedInstanceCore',
            ],
          ],
        },
      ],
    });

    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupName: 'basti-instance-TEST_ID',
    });

    const instances = template.findResources('AWS::EC2::Instance');
    const instance = instances[Object.keys(instances)[0]];
    const tags = instance.Properties.Tags;
    expect(tags).toContainEqual({
      Key: 'basti:in-use',
      Value: expect.stringContaining('T'),
    });
    expect(tags).toContainEqual({
      Key: 'basti:created-by',
      Value: 'CDK',
    });
    expect(tags).toContainEqual({
      Key: 'basti:id',
      Value: 'TEST_ID',
    });
    expect(tags).toContainEqual({
      Key: 'Name',
      Value: 'basti-instance-TEST_ID',
    });
  });
  test('construct-grant-connect', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack');

    // We can just start with a simple creation of the basti instance.
    // without all the dependencies.
    const bastiVpc = new aws_ec2.Vpc(bastiStack, 'bastiVpc', {});

    const bastiInstance = new BastiInstance(bastiStack, 'bastiInstance', {
      vpc: bastiVpc,
    });

    const temporaryRole = new aws_iam.Role(bastiStack, 'temporaryRole', {
      assumedBy: new aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'temporaryRole',
    });

    bastiInstance.grantBastiCliConnect(temporaryRole);

    const template = Template.fromStack(bastiStack);

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'ec2:DescribeInstances',
            Effect: 'Allow',
            Resource: '*',
          },
          {
            Action: ['ec2:StartInstances', 'ec2:CreateTags'],
            Effect: 'Allow',
            Resource: {
              'Fn::Join': [
                '',
                [
                  'arn:aws:ec2:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':instance/',
                  {
                    Ref: 'bastiInstancebastiinstance6956A218',
                  },
                ],
              ],
            },
          },
          {
            Action: 'ssm:StartSession',
            Effect: 'Allow',
            Resource: [
              {
                'Fn::Join': [
                  '',
                  [
                    'arn:aws:ec2:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':instance/',
                    {
                      Ref: 'bastiInstancebastiinstance6956A218',
                    },
                  ],
                ],
              },
              'arn:aws:ssm:*:*:document/AWS-StartPortForwardingSessionToRemoteHost',
            ],
          },
        ],
      },
    });

    // We don't care about any of the other properties, just that the role we
    // have just given access to the basti instance.
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'temporaryRole',
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              Service: 'ec2.amazonaws.com',
            },
          },
        ],
      },
    });
  });
  // Test to make sure we can construct IBastiInstance
  test('construct-ibastiinstance', () => {
    const app = new cdk.App();

    const bastiStack = new cdk.Stack(app, 'bastiStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });

    // Ok so importing a security group (which is done when calling .fromBastiId)
    // requires a vpc to be passed in without tokens.
    // There is no way around this. So we "import" the vpc again. Again without tokens.
    // it must have a fixed name.
    const importedVpc = aws_ec2.Vpc.fromLookup(bastiStack, 'specialVpc', {
      vpcName: 'specialVpc',
    });

    const importedBastiInstance = BastiInstance.fromBastiId(
      bastiStack,
      'importedBastiInstance',
      'TEST_ID',
      importedVpc
    );

    // Check that the properties are set correctly.
    expect(importedBastiInstance.vpc.vpcId).toEqual(importedVpc.vpcId);
  });
});
