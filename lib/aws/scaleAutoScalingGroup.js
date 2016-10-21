var AWS = require('aws-sdk');
var logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function log(data) {
    logger.info(data);
    return data;
}

function scaleInstances(name, amount) {
    var params = {
        AutoScalingGroupName: name,
        DesiredCapacity: amount
    };

    return autoscaling.updateAutoScalingGroup(params).promise();
}

module.exports = (autoScalingGroupName, amount) => scaleInstances(autoScalingGroupName, amount);
