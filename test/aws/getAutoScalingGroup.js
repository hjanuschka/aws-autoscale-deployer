const target = require('../../lib/aws/getAutoScalingGroup');
const awsMock = require('./aws-mock');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Retrieve Auto Scaling Group', () => {

    afterEach(() => {
        awsMock.clear();
    });

    it('should reject with an error if zero auto scaling groups with matching name', () => {
        const name = 'test-auto-scaling-group';

        awsMock.autoscaling.describeAutoScalingGroups(name, path.join(__dirname, '/stubs/noAutoScalingGroupsFound.xml'));

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Expected a single ASG but found 0');
    });

    it('should resolve with autoscaling group when scaling group exists', () => {
        const name = 'test-auto-scaling-group';

        awsMock.autoscaling.describeAutoScalingGroups(name, path.join(__dirname, '/stubs/healthyAutoScalingGroup.xml'));

        return expect(target(name)).to.eventually.have.property('AutoScalingGroupName', name);
    });
});
