var nock = require('nock');
nock.disableNetConnect();

function elbDescribeInstanceHealth(elbName, xmlName) {
    nock('https://elasticloadbalancing.eu-west-1.amazonaws.com:443', {
            "encodedQueryParams": true
        })
        .post('/', "Action=DescribeInstanceHealth&LoadBalancerName=" + elbName + "&Version=2012-06-01")
        .replyWithFile(200, xmlName, {
            'content-type': 'application/xml'
        });
}

function describeAutoScalingGroups(autoScalingGroupName, xmlName) {
    nock('https://autoscaling.eu-west-1.amazonaws.com:443', {
            'encodedQueryParams': true
        })
        .post('/', 'Action=DescribeAutoScalingGroups&AutoScalingGroupNames.member.1=' + autoScalingGroupName + '&Version=2011-01-01')
        .replyWithFile(200, xmlName, {
            'content-type': 'application/xml'
        });
}

module.exports = {
    clear: function() {
        nock.cleanAll();
    },
    elb: {
        describeInstanceHealth: elbDescribeInstanceHealth
    },
    autoscaling: {
        describeAutoScalingGroups: describeAutoScalingGroups
    }
}
