const AWS = require('aws-sdk');
const logger = require('../logger');

const autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function terminateInstanceInAutoScalingGroup(instance, shouldDecrementDesiredCapacity) {
    const params = {
        InstanceId: instance.InstanceId,
        ShouldDecrementDesiredCapacity: shouldDecrementDesiredCapacity
    };

    logger.info(`Terminating ${instance.InstanceId}`);
    logger.info(`Set to decrement desired capacity? ${shouldDecrementDesiredCapacity}`);
    return autoscaling.terminateInstanceInAutoScalingGroup(params).promise();
}

function terminateOldInstances(autoScalingGroup, shouldDecrementDesiredCapacity) {
    const instancesToTerminate = autoScalingGroup.Instances.filter(instance => instance.LaunchConfigurationName !== autoScalingGroup.LaunchConfigurationName);

    return Promise.all(instancesToTerminate.map(instance => terminateInstanceInAutoScalingGroup(instance, shouldDecrementDesiredCapacity)));
}

module.exports = (autoScalingGroup, shouldDecrementDesiredCapacity) => terminateOldInstances(autoScalingGroup, shouldDecrementDesiredCapacity);
