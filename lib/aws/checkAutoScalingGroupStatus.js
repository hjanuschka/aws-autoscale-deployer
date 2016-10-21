const getAutoScalingGroup = require('./getAutoScalingGroup');
const logger = require('../logger');

function validateDesiredCapacity(autoScalingGroup) {
    if (autoScalingGroup.DesiredCapacity !== autoScalingGroup.Instances.length) {
        return Promise.reject(new Error('Number of instances does not match desired capacity. Expected=' + autoScalingGroup.DesiredCapacity + '. Current=' + autoScalingGroup.Instances.length));
    }

    return autoScalingGroup;
}

function checkInstancesAreHealthy(autoScalingGroup) {
    logger.info('Beginning health checks on ' + autoScalingGroup.AutoScalingGroupName);

    var allInService = autoScalingGroup.Instances.every(instance => instance.LifecycleState === 'InService' && instance.HealthStatus === 'Healthy');

    if (!allInService) {
        return Promise.reject(new Error('Some instances are reporting an unhealthy state.'));
    }

    return autoScalingGroup;
}

module.exports = (autoScalingGroupName) => new Promise((resolve, reject) => {
    return getAutoScalingGroup(autoScalingGroupName)
        .then(autoScalingGroup => validateDesiredCapacity(autoScalingGroup))
        .then(autoScalingGroup => checkInstancesAreHealthy(autoScalingGroup))
        .then(resolve)
        .catch(reject);
});
