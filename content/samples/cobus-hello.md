---
layout: blog.11ty.js
title: Getting started with Amazon ECS
description: Let's make it better
hero: https://i.pinimg.com/originals/13/73/e6/1373e60e1184cc4cb0d72a196e5cb964.jpg
heroCropMode: bottom
heroColor: dark
---

# Module 2: Create an ECS cluster and deploy your app with CDK

## Introduction

In this module you will create a CDK application that will create all the necesary infrastructure to set up an ECS cluster, and deploy a sample container to it.

## What you will learn

- Create a simple CDK application
- Create an ECS cluster, with Fargate for capacity
- Create a task definition and service to deploy our application

## Implementation
At the end of this guide, the entire code example will be shown.

### Create the CDK app

First, ensure you have CDK installed (if you do not have it installed, please follow the [Getting Started with AWS CDK guid](LINK TO THE CDK GUIDE)):

```
cdk --verison
```

We will now create the skeleton CDK application using TypeScript as our language of choice:

```
mkdir cdk-ecs-infra
cd cdk-ecs-infra
cdk init app --language typescript
```

This will output the following:
~~~
Applying project template app for typescript
# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

Executing npm install...
✅ All done!
~~~


### Create the code for the resource stack

Go to the file /lib/cdk-ecs-infra-stack.ts, this is where you will write the code for the resource stack you are going to create.

A _resource stack_ is a set of cloud infraestructure resources (in your particular case they will be all AWS resources), that will be provisioned into a specific account. The accont/region where these resources are provisioned, can be configured in the stack (as covered in the [Getting Started with AWS CDK guide](LINK TO GUIDE).

In this resource stack, you are going to create the following resources:

- IAM role: this role will be assigned to the container to allow it to call other AWS services.

- ECS Task definition: the specific parameters to use when launching the container.

- ECS Pattern for Fargate loadbalanced service: this abstracts away the complexity of all the components required to create the cluster, loadbalancer, service, and configuring everything to work together.

### Create the ECS cluster

To start creating the ECS cluster, you first need to import the correct modules:

```
npm i @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecs-patterns @aws-cdk/aws-iam 
```

You will then edit the `lib/cdk-eb-infra-stack.ts` file to add the dependency at the top of the file:

```
import ecs = require('@aws-cdk/aws-ecs'); // Allows working with ECS resources
import ec2 = require('@aws-cdk/aws-ec2'); // Allows working with EC2 and VPC resources
import iam = require('@aws-cdk/aws-iam'); // Allows working with IAM resources
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns') // Helper to create ECS services with loadbalancers, and configure them
```

These modules provide access to all the components you need for you to deploy the web application. The first step is to find the existing default VPC in your account by adding the following code:

```
      // Look up the default VPC
      const vpc = ec2.Vpc.fromLookup(this, "VPC", {
        isDefault: true
      });
```

Next, you will need to define which container to use, and how it should be configured. This is done by creating a task definition to supply the container port, amount of cpu and memory it needs, and the container image to use. For this guide, we will be building the container image provided with the sample application in `SampleApp` and have CDK manage the build, upload, and deployment of the container for us. We will also be creating an empty IAM role to attach to the task definition for future guides. To create the task definition and IAM role, add the following code:

```
      const taskIamRole = new iam.Role(this, "AppRole", {
        roleName: "AppRole",
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      });

      const taskDefinition = new ecs.FargateTaskDefinition(this, 'Task', {
        taskRole: taskIamRole,
      });

      taskDefinition.addContainer('MyContainer', {
        image: ecs.ContainerImage.fromAsset('../SampleApp'),
        portMappings: [{ containerPort: 80 }],
        memoryReservationMiB: 256,
        cpu : 256,
      });
```

In the code above, you can see that you specified a task definition type to deploy to Fargate by using `FargateTaskDefinion`, and by using `ContainerImage.fromAsset`, CDK will build the container image using the `Dockerfile` in the `SampleApp` directory.

Next, you need to set up the ECS cluster, define a service, create a load balancer, configure it to connect to the service, and set up the required security group rules. A service in ECS is used to launch a task definition by specifying the number of copies you want, deployment strategies, and other configurations. For this example, we will only be launching 1 copy of the container. A security group acts as a virtual firewall for your instance to control inbound and outbound traffic, but you do not need to configure it as the ECS Pattern you are using will do that for you. Add the following code to your project below the task definition:

```
      new ecsPatterns.ApplicationLoadBalancedFargateService(this, "MyApp", {
        vpc: vpc,
        taskDefinition: taskDefinition,
        desiredCount: 1,
        serviceName: 'MyWebApp',
        assignPublicIp: true,
        publicLoadBalancer: true,
      })
```
You are passing in the `vpc` object that you looked up previous to specify where to create all the resources, along with the task definition that defines which container image to deploy. The `desiredCount` indicates how many copies you want, the `serviceName` what you want to call the service, and `publicLoadBalancer` is set to `true` so that you can access it over the internet. **The line setting the `assignPublicIp` to `true` is important in this example as we are using the default VPC that does not have private subnets. Best practice recommends launching services in private subnets, but is outside the scope of this guide.**

You are now ready to deploy the web application, but first, you need to set up CDK on the account you are deploying to. Edit the `bin/cdk-ecs-infra.ts` file, and uncomment line 14:

```
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
```

This will use the Account ID and region configured in the AWS CLI. Before you can use CDK, it needs to be bootstrapped - this will create the required infrastructure for CDK to manage infrastructure in your account. To bootstrap CDK, run `cdk bootstrap`. You should see output similar to:

```
⏳  Bootstrapping environment aws://0123456789012/<region>...
 ✅  Environment aws://0123456789012/<region> bootstrapped
```


To bootstrap CDK, run `cdk bootstrap`. This will create the required infrastructure for CDK to manage infrastructure in your account - we recommend working through the [Getting Started with AWS CDK](LINK TO GUIDE) guide if you are not familiar with setting up a CDK application.

Once the bootstrapping has completed, you will run `cdk deploy` to deploy the container, cluster, and all the other infrastructure required. And see output similar to the following:

![CDK Deploy output](./images/cdk_deploy.png)

CDK will prompt you before creating the infrastructure as it is creating infrastructure that changes security configuration - in your case, by creating IAM roles and security groups. Press `y` and then enter to deploy. CDK will now set up all the infrastructure you defined, and it will take a few minutes to complete. While it is running, you will see updates like this:

![CDK Deploy updates](./images/cdk_deploy_updates.png)

Once it completes, you will see output with the link to the public URL to access your service like this:

![CDK output](./images/cdk_output.png)

## Conclusion

In this Module, you learned how to create an ECS cluster with a load balancer to serve traffic to your container running on Fargate using an ECS Pattern supplied by CDK. In the next module, you will clean up all the resources created in this guide.

Next --> [Cleanup](004_cleanup.md)

## Full code sample
```
import * as cdk from '@aws-cdk/core';
import ecs = require('@aws-cdk/aws-ecs');
import ec2 = require('@aws-cdk/aws-ec2');
import iam = require('@aws-cdk/aws-iam');
import ecsPatterns = require('@aws-cdk/aws-ecs-patterns')

export class CdkEcsInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      // Look up the default VPC
      const vpc = ec2.Vpc.fromLookup(this, "VPC", {
        isDefault: true
      });

      const taskIamRole = new iam.Role(this, "AppRole", {
        roleName: "AppRole",
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      });

      const taskDefinition = new ecs.FargateTaskDefinition(this, 'Task', {
        taskRole: taskIamRole,
      });

      taskDefinition.addContainer('MyContainer', {
        image: ecs.ContainerImage.fromAsset('../SampleApp'),
        portMappings: [{ containerPort: 80 }],
        memoryReservationMiB: 256,
        cpu : 256,
      });

      new ecsPatterns.ApplicationLoadBalancedFargateService(this, "MyApp", {
        vpc: vpc,
        taskDefinition: taskDefinition,
        desiredCount: 1,
        serviceName: 'MyWebApp',
        assignPublicIp: true,
        publicLoadBalancer: true,
      })

  }
}
```


