# aws-autoscale-deployer
CLI tool for deploying applications using AWS auto-scaling groups

[![npm version](https://badge.fury.io/js/%40tlrg%2Faws-autoscale-deployer.svg)](https://badge.fury.io/js/%40tlrg%2Faws-autoscale-deployer)
[![CircleCI](https://circleci.com/gh/LateRoomsGroup/aws-autoscale-deployer/tree/master.svg?style=svg)](https://circleci.com/gh/LateRoomsGroup/aws-autoscale-deployer/tree/master)
[![GitHub license](https://img.shields.io/badge/license-Apache%202-blue.svg)](https://raw.githubusercontent.com/LateRoomsGroup/aws-autoscale-deployer/master/LICENSE)
[![Dependency Status](https://img.shields.io/david/LateRoomsGroup/aws-autoscale-deployer.svg)](https://david-dm.org/LateRoomsGroup/aws-autoscale-deployer)

----------
Pre-requisites
--------------

* Auto Scaling Group: Requires an auto-scaling-group setup for your application.
* Amazon AMI: You need the AMI name of the image you wish to deploy.
* AWS Credentials set with the permissions specified below

----------
Installation
--------------

```sh
npm install -g @tlrg/aws-autoscale-deployer 
```

----------
### Usage

  Usage: aws-autoscale-deployer [options] [command]


  Commands:

    upgrade [options] <autoScalingGroup>    Creates a new launch configuration and sets it to an auto scaling group
    scale [options] <autoScalingGroup>      Scale an auto scaling group
    scaleup [options] <autoScalingGroup>    Scale an auto scaling group up by a number of desired instances
    scaledown [options] <autoScalingGroup>  Scale an auto scaling group down by a number of desired instances
    commit [options] <autoScalingGroup>     Terminate any instance not running against the latest launch configuration
    rollback [options] <autoScalingGroup>   Use where you want to quickly rollback to a previous AMI. Will update the launch configuration to the specified ami name and terminate all old instances. May cause a period of downtime.
    status <autoScalingGroup>               Gets status of an auto scaling group

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    
----------
### `$ aws-autoscale-deployer status [options] <autoScalingGroup>`

  Gets status of an auto scaling group

  Options:

    -h, --help  output usage information

----------
### `$ aws-autoscale-deployer upgrade [options] <autoScalingGroup>`

  Creates a new launch configuration and sets it to an auto scaling group

  Options:

    -h, --help                 output usage information
    -a, --ami <n>              AMI name
    -i, --instanceType [type]  Instance type to use, defaults to current

----------
### `$ aws-autoscale-deployer scale [options] <autoScalingGroup>`

  Scale an auto scaling group

  Options:

    -h, --help                     output usage information
    -m, --minimum <n>              Minimum scale
    -M, --maximum <n>              Maximum scale
    -d, --desired <n>              Desired scale
    -r, --retryInterval [seconds]  Retry interval in seconds
    -t, --timeout [seconds]        Wait timeout in seconds
    
----------
### `$ aws-autoscale-deployer scaleup [options] <autoScalingGroup>`

  Scale an auto scaling group up by a number of desired instances

  Options:

    -h, --help                     output usage information
    -i, --instances <n>            No of instances to increase desired scale up
    -r, --retryInterval [seconds]  Retry interval in seconds
    -t, --timeout [seconds]        Wait timeout in seconds    

----------
### `$ aws-autoscale-deployer scaledown [options] <autoScalingGroup>`

  Scale an auto scaling group down by a number of desired instances

  Options:

    -h, --help                     output usage information
    -i, --instances <n>            No of instances to increase desired scale down
    -r, --retryInterval [seconds]  Retry interval in seconds
    -t, --timeout [seconds]        Wait timeout in seconds    
  
----------
### `$ aws-autoscale-deployer commit [options] <autoScalingGroup>`

  Terminate any instance not running against the latest launch configuration

  Options:

    -h, --help                     output usage information
    -r, --retryInterval [seconds]  Retry interval in seconds
    -t, --timeout [seconds]        Wait timeout in seconds    
    
----------
### `$ aws-autoscale-deployer rollback [options] <autoScalingGroup>`

  Use where you want to quickly rollback to a previous AMI. 
  Will update the launch configuration to the specified ami name and terminate all old instances. 
  *May cause a period of downtime.*

  Options:

    -h, --help     output usage information
    -a, --ami <n>  AMI name    
    
----------
### Permissions

The minimal permissions required to work are as follows:

*my-iam-role* is the  IAM role that the load configuration is configured to apply to the EC2 instance. If no role is required, this can be omitted.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "autoscaling:DescribeAutoScalingGroups",
                "autoscaling:DescribeLaunchConfigurations",
                "autoscaling:CreateLaunchConfiguration",
                "autoscaling:CreateOrUpdateTags",
                "autoscaling:UpdateAutoScalingGroup",
                "autoscaling:DeleteLaunchConfiguration",
                "autoscaling:SetDesiredCapacity",
                "autoscaling:TerminateInstanceInAutoScalingGroup",
                "elasticloadbalancing:DescribeInstanceHealth"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "arn:aws:iam::321338012591:role/my-iam-role"
            ]
        }
    ]
}

```
