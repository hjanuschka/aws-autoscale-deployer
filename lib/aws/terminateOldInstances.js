var AWS = require('aws-sdk');
const logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function terminateInstanceInAutoScalingGroup(instance, shouldDecrementDesiredCapacity) {
    var params = {
        InstanceId: instance.InstanceId,
        ShouldDecrementDesiredCapacity: shouldDecrementDesiredCapacity
    };

    logger.info('Terminating ' + instance.InstanceId);
    logger.info('Set to decrement desired capacity:' + shouldDecrementDesiredCapacity);
    return autoscaling.terminateInstanceInAutoScalingGroup(params).promise();
}

function terminateOldInstances(launchConfigurationName, instances, shouldDecrementDesiredCapacity) {
    var instancesToTerminate = instances.filter(instance => instance.LaunchConfigurationName !== launchConfigurationName);

    return Promise.all(instancesToTerminate.map(instance => terminateInstanceInAutoScalingGroup(instance, shouldDecrementDesiredCapacity)));
}

module.exports = (autoScalingGroup, shouldDecrementDesiredCapacity) => terminateOldInstances(autoScalingGroup.LaunchConfigurationName, autoScalingGroup.Instances, shouldDecrementDesiredCapacity);
