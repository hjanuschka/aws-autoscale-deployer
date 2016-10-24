var AWS = require('aws-sdk');
const logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function terminateInstanceInAutoScalingGroup(instance) {
    var params = {
        InstanceId: instance.InstanceId,
        ShouldDecrementDesiredCapacity: true
    };

    logger.info('Terminating ' + instance.InstanceId);
    return autoscaling.terminateInstanceInAutoScalingGroup(params).promise();
}

function terminateOldInstances(launchConfigurationName, instances) {
    var instancesToTerminate = instances.filter(instance => instance.LaunchConfigurationName !== launchConfigurationName);

    return Promise.all(instancesToTerminate.map(terminateInstanceInAutoScalingGroup));
}

module.exports = autoScalingGroup => terminateOldInstances(autoScalingGroup.LaunchConfigurationName, autoScalingGroup.Instances);
