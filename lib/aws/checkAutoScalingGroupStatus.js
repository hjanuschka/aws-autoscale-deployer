const getAutoScalingGroup = require('./getAutoScalingGroup');
const logger = require('../logger');
const AWS = require('aws-sdk');

const elb = new AWS.ELB({
    region: 'eu-west-1'
});

function validateDesiredCapacity(autoScalingGroup) {
    if (autoScalingGroup.DesiredCapacity !== autoScalingGroup.Instances.length) {
        return Promise.reject(new Error(`Number of instances does not match desired capacity. Expected=${autoScalingGroup.DesiredCapacity}. Current=${autoScalingGroup.Instances.length}`));
    }

    return autoScalingGroup;
}

function checkInstancesAreHealthy(autoScalingGroup) {
    logger.info(`Beginning instance health checks on ${autoScalingGroup.AutoScalingGroupName}`);

    const allInService = autoScalingGroup.Instances.every(instance => instance.LifecycleState === 'InService' && instance.HealthStatus === 'Healthy');

    if (!allInService) {
        return Promise.reject(new Error('Some instances are reporting an unhealthy state.'));
    }

    return autoScalingGroup;
}

function checkInstancesAreHealthyOnElb(elbName, instanceStates) {
    return instanceStates.every(instance => instance.State === 'InService') ?
        Promise.resolve() :
        Promise.reject(new Error(`Not all instances in service for ELB ${elbName}`));
}

function checkElbIsHealthy(elbName) {
    logger.info(`Checking health of ELB named ${elbName}`);
    const params = {
        LoadBalancerName: elbName
    };

    return elb.describeInstanceHealth(params)
        .promise()
        .then(data => checkInstancesAreHealthyOnElb(elbName, data.InstanceStates));
}

function checkAllInstancesAreHealthyOnElb(autoScalingGroup) {
    logger.info(`Checking all instances on ELBs attached to ${autoScalingGroup.AutoScalingGroupName} are in healthy state.`);

    return Promise.all(autoScalingGroup.LoadBalancerNames.map(elbName => checkElbIsHealthy(elbName)));
}

module.exports = autoScalingGroupName => getAutoScalingGroup(autoScalingGroupName)
    .then(validateDesiredCapacity)
    .then(checkInstancesAreHealthy)
    .then(checkAllInstancesAreHealthyOnElb);
