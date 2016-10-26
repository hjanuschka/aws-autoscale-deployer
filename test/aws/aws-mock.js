const nock = require('nock');
const fs = require('fs');

nock.disableNetConnect();

function elbDescribeInstanceHealth(elbName, xmlName) {
    nock('https://elasticloadbalancing.eu-west-1.amazonaws.com:443')
        .post('/', `Action=DescribeInstanceHealth&LoadBalancerName=${elbName}&Version=2012-06-01`)
        .replyWithFile(200, xmlName, {
            'content-type': 'application/xml'
        });
}

function describeAutoScalingGroups(autoScalingGroupName, xmlName) {
    nock('https://autoscaling.eu-west-1.amazonaws.com:443')
        .post('/', `Action=DescribeAutoScalingGroups&AutoScalingGroupNames.member.1=${autoScalingGroupName}&Version=2011-01-01`)
        .replyWithFile(200, xmlName, {
            'content-type': 'application/xml'
        });
}

function describeLaunchConfigurations(launchConfigurationName, xmlName) {
    nock('https://autoscaling.eu-west-1.amazonaws.com:443')
        .post('/', `Action=DescribeLaunchConfigurations&LaunchConfigurationNames.member.1=${launchConfigurationName}&Version=2011-01-01`)
        .replyWithFile(200, xmlName, {
            'content-type': 'application/xml'
        });
}

function createLaunchConfiguration(launchConfigurationName, amiName, statusCode, xmlName) {
    nock('https://autoscaling.eu-west-1.amazonaws.com:443')
        .post('/', new RegExp(`^Action=CreateLaunchConfiguration.+&ImageId=${amiName}.+&LaunchConfigurationName=${launchConfigurationName}.+$`))
        .replyWithFile(statusCode, xmlName, {
            'content-type': 'application/xml'
        });
}

function deleteLaunchConfiguration(launchConfigurationName, statusCode, xmlName) {
    nock('https://autoscaling.eu-west-1.amazonaws.com:443')
        .post('/', `Action=DeleteLaunchConfiguration&LaunchConfigurationName=${launchConfigurationName}&Version=2011-01-01`)
        .replyWithFile(statusCode, xmlName, {
            'content-type': 'application/xml'
        });
}

function updateAutoScalingGroup(autoScalingGroupName, launchConfigurationName, statusCode, xmlName) {
    nock('https://autoscaling.eu-west-1.amazonaws.com:443')
        .post('/', `Action=UpdateAutoScalingGroup&AutoScalingGroupName=${autoScalingGroupName}&LaunchConfigurationName=${launchConfigurationName}&Version=2011-01-01`)
        .replyWithFile(statusCode, xmlName, {
            'content-type': 'application/xml'
        });
}

module.exports = {
    clear() {
        nock.cleanAll();
    },
    recordResponseToFile() {
        nock.recorder.rec({
            logging: content => fs.appendFile('response.txt', content.response),
            output_objects: true,
            use_separator: false
        });
    },
    elb: {
        describeInstanceHealth: elbDescribeInstanceHealth
    },
    autoscaling: {
        describeAutoScalingGroups,
        describeLaunchConfigurations,
        createLaunchConfiguration,
        deleteLaunchConfiguration,
        updateAutoScalingGroup
    }
};
