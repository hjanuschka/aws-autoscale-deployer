const AWS = require('aws-sdk');

const autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function getAutoScalingGroups(names) {
    const params = {
        AutoScalingGroupNames: names
    };

    return autoscaling.describeAutoScalingGroups(params).promise();
}

function validate(data) {
    if (data.AutoScalingGroups.length !== 1) {
        return Promise.reject(new Error(`Expected a single ASG but found ${data.AutoScalingGroups.length}`));
    }
    return data;
}

module.exports = name => getAutoScalingGroups([name])
    .then(validate)
    .then(data => Promise.resolve(data.AutoScalingGroups[0]));
