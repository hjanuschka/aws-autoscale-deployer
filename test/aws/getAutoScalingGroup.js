const target = require('../../lib/aws/getAutoScalingGroup');
const nock = require('nock');
const fs = require('fs');
nock.disableNetConnect();

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Retrieve Auto Scaling Group', function() {

    afterEach(function() {
        nock.cleanAll();
    });

    it('working - should reject with an error if zero auto scaling groups with matching name', function() {
        const name = 'test-auto-scaling-group';

        nock('https://autoscaling.eu-west-1.amazonaws.com:443', {
                'encodedQueryParams': true
            })
            .post('/', 'Action=DescribeAutoScalingGroups&AutoScalingGroupNames.member.1=' + name + '&Version=2011-01-01')
            .reply(200, '<DescribeAutoScalingGroupsResponse xmlns=\"http://autoscaling.amazonaws.com/doc/2011-01-01/\"><DescribeAutoScalingGroupsResult><AutoScalingGroups/></DescribeAutoScalingGroupsResult><ResponseMetadata><RequestId>55e51e6a-9ad1-11e6-bc7f-e994ba9f4d35</RequestId></ResponseMetadata></DescribeAutoScalingGroupsResponse>');

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Expected a single ASG but found 0');
    });

    it('fails as replyWithFile- should reject with an error if zero auto scaling groups with matching name', function() {
        const name = 'test-auto-scaling-group';

        nock('https://autoscaling.eu-west-1.amazonaws.com:443', {
                'encodedQueryParams': true
            })
            .post('/', 'Action=DescribeAutoScalingGroups&AutoScalingGroupNames.member.1=' + name + '&Version=2011-01-01')
            .replyWithFile(200, __dirname + '/stubs/noAutoScalingGroupsFound.xml', {
                'Content-Type': 'application/xml'
            });

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Expected a single ASG but found 0');
    });

    it('fails when read file - should reject with an error if zero auto scaling groups with matching name', function() {
        const name = 'test-auto-scaling-group';
        var file = fs.readFileSync(__dirname + '/stubs/noAutoScalingGroupsFound.xml', 'utf8');

        nock('https://autoscaling.eu-west-1.amazonaws.com:443', {
                'encodedQueryParams': true
            })
            .post('/', 'Action=DescribeAutoScalingGroups&AutoScalingGroupNames.member.1=' + name + '&Version=2011-01-01')
            .reply(200, file, {
                'Content-Type': 'application/xml'
            });

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Expected a single ASG but found 0');
    });

});
