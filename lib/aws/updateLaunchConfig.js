const AWS = require('aws-sdk');

const autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function validate(data) {
    if (data.LaunchConfigurations.length !== 1) {
        return Promise.reject(new Error(`Expected a single Launch Configuration but found ${data.LaunchConfigurations.length}`));
    }
    return data;
}

function getLaunchConfiguration(name) {
    return autoscaling.describeLaunchConfigurations({
        LaunchConfigurationNames: [name]
    }).promise();
}

function copyLaunchConfiguration(launchConfig, config) {
    const params = {
        LaunchConfigurationName: config.newLaunchConfigurationName,
        AssociatePublicIpAddress: launchConfig.AssociatePublicIpAddress,
        ImageId: config.amiName,
        KeyName: launchConfig.KeyName,
        SecurityGroups: launchConfig.SecurityGroups,
        InstanceType: config.instanceType || launchConfig.InstanceType,
        InstanceMonitoring: launchConfig.InstanceMonitoring,
        IamInstanceProfile: launchConfig.IamInstanceProfile,
        EbsOptimized: launchConfig.EbsOptimized
    };

    return autoscaling.createLaunchConfiguration(params).promise();
}

function updateAutoScalingGroup(autoScalingGroupName, launchConfigurationName) {
    const params = {
        AutoScalingGroupName: autoScalingGroupName,
        LaunchConfigurationName: launchConfigurationName
    };

    return autoscaling.updateAutoScalingGroup(params).promise();
}

function deleteLaunchConfiguration(launchConfigurationName) {
    const params = {
        LaunchConfigurationName: launchConfigurationName
    };

    return autoscaling.deleteLaunchConfiguration(params).promise();
}

module.exports = (autoScalingGroup, config) => getLaunchConfiguration(autoScalingGroup.LaunchConfigurationName)
    .then(validate)
    .then(data => copyLaunchConfiguration(data.LaunchConfigurations[0], config))
    .then(() => updateAutoScalingGroup(autoScalingGroup.AutoScalingGroupName, config.newLaunchConfigurationName))
    .then(() => deleteLaunchConfiguration(autoScalingGroup.LaunchConfigurationName));
