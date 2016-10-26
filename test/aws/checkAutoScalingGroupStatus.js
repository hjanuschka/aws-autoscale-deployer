const awsMock = require('./aws-mock');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);
const expect = chai.expect;

let stubAutoScalingGroup;
let target;

describe('Check Auto Scaling Group Status', () => {

    beforeEach(() => {
        target = proxyquire('../../lib/aws/checkAutoScalingGroupStatus', {
            './getAutoScalingGroup': () => Promise.resolve(stubAutoScalingGroup),
            '../logger': {
                info: () => {}
            }
        });
    });

    afterEach(() => {
        stubAutoScalingGroup = {};
        awsMock.clear();
    });

    it('should reject when DesiredCapacity does not match instances attached', () => {
        const name = 'test-auto-scaling-group';

        stubAutoScalingGroup = {
            AutoScalingGroupName: name,
            DesiredCapacity: 1,
            Instances: []
        };

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Number of instances does not match desired capacity. Expected=1. Current=0');
    });

    it('should reject when all instances attached do not have LifecycleState as InService', () => {
        const name = 'test-auto-scaling-group';

        stubAutoScalingGroup = {
            AutoScalingGroupName: name,
            DesiredCapacity: 2,
            Instances: [{
                LifecycleState: 'Pending',
                HealthStatus: 'Healthy'
            }, {
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }]
        };

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Some instances are reporting an unhealthy state.');
    });

    it('should reject when all instances attached do not have HealthStatus as Healthy', () => {
        const name = 'test-auto-scaling-group';

        stubAutoScalingGroup = {
            AutoScalingGroupName: 'scaling-group',
            DesiredCapacity: 2,
            Instances: [{
                LifecycleState: 'InService',
                HealthStatus: 'Unhealthy'
            }, {
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }]
        };

        return expect(target(name)).to.eventually.be.rejectedWith(Error, 'Some instances are reporting an unhealthy state.');
    });

    it('should fulfill when all instances attached are healthy and no elbs are attached', () => {
        const name = 'test-auto-scaling-group';

        stubAutoScalingGroup = {
            AutoScalingGroupName: 'scaling-group',
            DesiredCapacity: 2,
            Instances: [{
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }, {
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }],
            LoadBalancerNames: []
        };

        return expect(target(name)).to.eventually.be.fulfilled;
    });

    it('should reject when all instances attached are healthy but not in service on attached elbs', () => {
        const name = 'test-auto-scaling-group';
        const unhealthyElbName = 'bad-elb';
        const healthyElbName = 'cool-elb';

        stubAutoScalingGroup = {
            AutoScalingGroupName: 'scaling-group',
            DesiredCapacity: 2,
            Instances: [{
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }, {
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }],
            LoadBalancerNames: [unhealthyElbName, healthyElbName]
        };

        awsMock.elb.describeInstanceHealth(unhealthyElbName, path.join(__dirname, '/stubs/elbInstanceOutOfService.xml'));
        awsMock.elb.describeInstanceHealth(healthyElbName, path.join(__dirname, '/stubs/elbInstanceInService.xml'));

        return expect(target(name)).to.eventually.be.rejectedWith(Error, `Not all instances in service for ELB ${unhealthyElbName}`);
    });

    it('should fulfill when all instances attached are healthy and all instances are healthy on attached elbs', () => {
        const name = 'test-auto-scaling-group';
        const healthyElbNameOne = 'smashing-elb';
        const healthyElbNameTwo = 'cool-elb';

        stubAutoScalingGroup = {
            AutoScalingGroupName: 'scaling-group',
            DesiredCapacity: 2,
            Instances: [{
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }, {
                LifecycleState: 'InService',
                HealthStatus: 'Healthy'
            }],
            LoadBalancerNames: [healthyElbNameOne, healthyElbNameTwo]
        };

        awsMock.elb.describeInstanceHealth(healthyElbNameOne, path.join(__dirname, '/stubs/elbInstanceInService.xml'));
        awsMock.elb.describeInstanceHealth(healthyElbNameTwo, path.join(__dirname, '/stubs/elbInstanceInService.xml'));

        return expect(target(name)).to.eventually.be.fulfilled;
    });
});
