var AWS = require('aws-sdk');
var logger = require('../logger');

var autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function log(data) {
    logger.info(data);
    return data;
}

function scaleInstances(name, scale) {
    var params = {
        AutoScalingGroupName: name,
        DesiredCapacity: scale.desired,
        MaxSize: scale.max,
        MinSize: scale.min
    };

    return autoscaling.updateAutoScalingGroup(params).promise();
}

module.exports = (autoScalingGroupName, scale) => new Promise((resolve, reject) => {
    return scaleInstances(autoScalingGroupName, scale).then(resolve);
});
