const AWS = require('aws-sdk');

const autoscaling = new AWS.AutoScaling({
    region: 'eu-west-1'
});

function scaleInstances(name, amount) {
    const params = {
        AutoScalingGroupName: name,
        DesiredCapacity: amount.desired,
        MaxSize: amount.max,
        MinSize: amount.min
    };

    return autoscaling.updateAutoScalingGroup(params).promise();
}

module.exports = (autoScalingGroupName, amount) => scaleInstances(autoScalingGroupName, amount);
