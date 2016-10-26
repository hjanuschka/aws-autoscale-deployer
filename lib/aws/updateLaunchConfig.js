const AWS = require('aws-sdk');
const logger = require('../logger');

const autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function validate(data, config) {
    if (data.LaunchConfigurations.length !== 1) {
        return Promise.reject(new Error(`Expected a single Launch Configuration but found ${data.LaunchConfigurations.length}`));
    }

    if (!config.newLaunchConfigurationName) {
        return Promise.reject(new Error('No newLaunchConfigurationName parameter provided on the options'));
    }

    if (!config.amiName) {
        return Promise.reject(new Error('No amiName parameter provided on the options'));
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

    logger.info(`Creating launch configuration named ${config.newLaunchConfigurationName}`);

    return autoscaling.createLaunchConfiguration(params).promise();
}

function updateAutoScalingGroup(autoScalingGroupName, launchConfigurationName) {
    const params = {
        AutoScalingGroupName: autoScalingGroupName,
        LaunchConfigurationName: launchConfigurationName
    };

    logger.info(`Updating ${autoScalingGroupName} to launch configuration named ${launchConfigurationName}`);

    return autoscaling.updateAutoScalingGroup(params).promise();
}

function deleteLaunchConfiguration(launchConfigurationName) {
    const params = {
        LaunchConfigurationName: launchConfigurationName
    };

    logger.info(`Deleting launch configuration named ${launchConfigurationName}`);

    return autoscaling.deleteLaunchConfiguration(params).promise();
}

module.exports = (autoScalingGroup, config) => getLaunchConfiguration(autoScalingGroup.LaunchConfigurationName)
    .then(lc => validate(lc, config))
    .then(data => copyLaunchConfiguration(data.LaunchConfigurations[0], config))
    .then(() => updateAutoScalingGroup(autoScalingGroup.AutoScalingGroupName, config.newLaunchConfigurationName))
    .then(() => deleteLaunchConfiguration(autoScalingGroup.LaunchConfigurationName));
