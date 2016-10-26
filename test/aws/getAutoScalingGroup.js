const target = require('../../lib/aws/getAutoScalingGroup');
const nock = require('nock');
const fs = require('fs');
const awsMock = require('./aws-mock');

nock.disableNetConnect();
nock.enableNetConnect('127.0.0.1');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Retrieve Auto Scaling Group', function() {

    afterEach(function() {
        nock.cleanAll();
    });

    it('should reject with an error if zero auto scaling groups with matching name', function() {
        const name = 'test-auto-scaling-group';

        awsMock.autoscaling.describeAutoScalingGroups(name, __dirname + '/stubs/noAutoScalingGroupsFound.xml');

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Expected a single ASG but found 0');
    });

    it('should resolve with autoscaling group when scaling group exists', function() {
        const name = 'test-auto-scaling-group';

        awsMock.autoscaling.describeAutoScalingGroups(name, __dirname + '/stubs/healthyAutoScalingGroup.xml');

        return expect(target(name)).to.eventually.have.property('AutoScalingGroupName', name);
    });
});
