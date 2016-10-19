var AWS = require('aws-sdk');
var logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function log(data) {
    logger.info(data);
    return data;
}

function validate(data) {
    if (data.LaunchConfigurations.length !== 1) {
        return Promise.reject(new Error('Expected a single Launch Configuration but found ' + data.LaunchConfigurations.length));
    }
    return data;
}

function getLaunchConfiguration(name) {
    return autoscaling.describeLaunchConfigurations({
        LaunchConfigurationNames: [name]
    }).promise();
}

function copyLaunchConfiguration(config, launchConfiguration) {
    const params = {
        LaunchConfigurationName: config.newLaunchConfigurationName,
        AssociatePublicIpAddress: launchConfiguration.AssociatePublicIpAddress,
        ImageId: config.amiName,
        KeyName: launchConfiguration.KeyName,
        SecurityGroups: launchConfiguration.SecurityGroups,
        InstanceType: config.instanceType || launchConfiguration.InstanceType,
        InstanceMonitoring: launchConfiguration.InstanceMonitoring,
        IamInstanceProfile: launchConfiguration.IamInstanceProfile,
        EbsOptimized: launchConfiguration.EbsOptimized
    };

    return autoscaling.createLaunchConfiguration(params).promise();
}

module.exports = (config) => new Promise((resolve, reject) => {
    return getLaunchConfiguration(config.autoScalingGroup.LaunchConfigurationName)
        .then(log)
        .then(validate)
        .then(data => (data.LaunchConfigurations[0]))
        .then(launchConfig => copyLaunchConfiguration(config, launchConfig));
});
