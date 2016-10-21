var AWS = require('aws-sdk');
var logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function terminateInstanceInAutoScalingGroup(instance) {
    var params = {
        InstanceId: instance.InstanceId,
        ShouldDecrementDesiredCapacity: false
    };
    autoscaling.terminateInstanceInAutoScalingGroup(params).promise();
}

function filterOldInstances(launchConfigurationName, instances) {
    var instancesToTerminate = instances.filter(instance => instance.LaunchConfigurationName === launchConfigurationName);

    return Promise.all(instancesToTerminate.map(terminateInstanceInAutoScalingGroup));
}

module.exports = (autoScalingGroup) => new Promise((resolve, reject) => {
    return filterOldInstances(autoScalingGroup.LaunchConfigurationName, autoScalingGroup.Instances)
        .then(resolve)
        .catch(reject);
});
