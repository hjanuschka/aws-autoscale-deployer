var AWS = require('aws-sdk');
var logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function getAutoScalingGroups(names) {
    const params = {
        AutoScalingGroupNames: names
    };

    return autoscaling.describeAutoScalingGroups(params).promise();
}

function log(data) {
    logger.info(data);
    return data;
}

function validate(data) {
    if (data.AutoScalingGroups.length !== 1) {
        return Promise.reject(new Error('Expected a single ASG but found ' + data.AutoScalingGroups.length));
    }
    return data;
}

module.exports = (config) => new Promise((resolve, reject) => {
    return getAutoScalingGroups([config.autoScalingGroup])
        .then(log)
        .then(validate)
        .then(data => (resolve(data.AutoScalingGroups[0])));
});
