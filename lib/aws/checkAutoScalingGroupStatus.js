const getAutoScalingGroup = require('./getAutoScalingGroup');
const logger = require('../logger');
var AWS = require('aws-sdk');

var elb = new AWS.ELB({
    region: 'eu-west-1'
});

function validateDesiredCapacity(autoScalingGroup) {
    if (autoScalingGroup.DesiredCapacity !== autoScalingGroup.Instances.length) {
        return Promise.reject(new Error('Number of instances does not match desired capacity. Expected=' + autoScalingGroup.DesiredCapacity + '. Current=' + autoScalingGroup.Instances.length));
    }

    return autoScalingGroup;
}

function checkInstancesAreHealthy(autoScalingGroup) {
    logger.info('Beginning instance health checks on ' + autoScalingGroup.AutoScalingGroupName);

    var allInService = autoScalingGroup.Instances.every(instance => instance.LifecycleState === 'InService' && instance.HealthStatus === 'Healthy');

    if (!allInService) {
        return Promise.reject(new Error('Some instances are reporting an unhealthy state.'));
    }

    return autoScalingGroup;
}

function checkInstanceIsHealthyOnElb(elbName) {
    logger.info('Checking health of ELB named ' + elbName);
    var params = {
        LoadBalancerName: elbName
    };

    return elb.describeInstanceHealth(params)
        .promise()
        .then(data => data.InstanceStates.every(instance => instance.State === 'InService') ?
            Promise.resolve() :
            Promise.reject(new Error('Not all instances in service for ELB ' + elbName)));
}

function checkAllInstancesAreHealthyOnElb(autoScalingGroup) {
    logger.info('Checking all instances on ELBs attached to ' + autoScalingGroup.AutoScalingGroupName + ' are in healthy state.');

    return Promise.all(autoScalingGroup.LoadBalancerNames.map(elbName => checkInstanceIsHealthyOnElb(elbName)));
}

module.exports = (autoScalingGroupName) => new Promise((resolve, reject) => {
    return getAutoScalingGroup(autoScalingGroupName)
        .then(validateDesiredCapacity)
        .then(checkInstancesAreHealthy)
        .then(checkAllInstancesAreHealthyOnElb)
        .then(resolve)
        .catch(reject);
});
