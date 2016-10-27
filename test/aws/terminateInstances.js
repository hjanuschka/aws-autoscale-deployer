const awsMock = require('./aws-mock');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);
const expect = chai.expect;
let target;

describe('Terminate instances in Auto Scaling Group', () => {

    beforeEach(() => {
        target = proxyquire('../../lib/aws/terminateOldInstances', {
            '../logger': {
                info: () => {}
            }
        });
    });

    afterEach(() => {
        awsMock.clear();
    });

    it('should only terminate instances not on current launch configuration', () => {
        const newLaunchConfig = 'new-launch-config';
        const oldLaunchConfig = 'old-launch-config';

        const autoScalingGroup = {
            LaunchConfigurationName: newLaunchConfig,
            Instances: [{
                InstanceId: 'old-instance',
                LaunchConfigurationName: oldLaunchConfig
            }, {
                InstanceId: 'new-instance',
                LaunchConfigurationName: newLaunchConfig
            }]
        };

        awsMock.autoscaling.terminateInstanceInAutoScalingGroup('old-instance', true, 200, path.join(__dirname, '/stubs/autoScalingCommandSuccessResponse.xml'));

        return expect(target(autoScalingGroup, true)).to.eventually.be.fulfilled;
    });

    it('should pass ShouldDecrementDesiredCapacity as true on aws call when passed in as true', () => {
        const newLaunchConfig = 'new-launch-config';
        const oldLaunchConfig = 'old-launch-config';
        const shouldDecrementDesiredCapacity = true;

        const autoScalingGroup = {
            LaunchConfigurationName: newLaunchConfig,
            Instances: [{
                InstanceId: 'old-instance',
                LaunchConfigurationName: oldLaunchConfig
            }, {
                InstanceId: 'new-instance',
                LaunchConfigurationName: newLaunchConfig
            }]
        };

        awsMock.autoscaling.terminateInstanceInAutoScalingGroup('old-instance', shouldDecrementDesiredCapacity, 200, path.join(__dirname, '/stubs/autoScalingCommandSuccessResponse.xml'));

        return expect(target(autoScalingGroup, shouldDecrementDesiredCapacity)).to.eventually.be.fulfilled;
    });

    it('should pass ShouldDecrementDesiredCapacity as false on aws call when passed in as false', () => {
        const newLaunchConfig = 'new-launch-config';
        const oldLaunchConfig = 'old-launch-config';
        const shouldDecrementDesiredCapacity = false;

        const autoScalingGroup = {
            LaunchConfigurationName: newLaunchConfig,
            Instances: [{
                InstanceId: 'old-instance',
                LaunchConfigurationName: oldLaunchConfig
            }, {
                InstanceId: 'new-instance',
                LaunchConfigurationName: newLaunchConfig
            }]
        };

        awsMock.autoscaling.terminateInstanceInAutoScalingGroup('old-instance', shouldDecrementDesiredCapacity, 200, path.join(__dirname, '/stubs/autoScalingCommandSuccessResponse.xml'));

        return expect(target(autoScalingGroup, shouldDecrementDesiredCapacity)).to.eventually.be.fulfilled;
    });

});
