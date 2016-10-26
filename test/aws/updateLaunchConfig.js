const awsMock = require('./aws-mock');
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const proxyquire = require('proxyquire');

chai.use(chaiAsPromised);
const expect = chai.expect;

let stubAutoScalingGroup;
let target;

describe('Update Launch Configuration', () => {

    beforeEach(() => {
        target = proxyquire('../../lib/aws/updateLaunchConfig', {
            '../logger': {
                info: () => {}
            }
        });
    });

    afterEach(() => {
        stubAutoScalingGroup = {};
        awsMock.clear();
    });

    it('should reject when no launch configurations found', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/noLaunchConfigurationsFound.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {})).to.eventually.be.rejectedWith(Error, 'Expected a single Launch Configuration but found 0');
    });

    it('should reject when no new launch configuration name provided', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/singleAutoScalingGroupFound.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {})).to.eventually.be.rejectedWith(Error, 'No newLaunchConfigurationName parameter provided on the options');
    });

    it('should reject when no ami name provided', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/singleAutoScalingGroupFound.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {
            newLaunchConfigurationName: 'new-launch-config'
        })).to.eventually.be.rejectedWith(Error, 'No amiName parameter provided on the options');
    });

    it('should reject when launch configuration creation fails', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';
        const newLaunchConfigName = 'new-launch-config';
        const amiName = 'ami-4243234';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/singleAutoScalingGroupFound.xml'));
        awsMock.autoscaling.createLaunchConfiguration(newLaunchConfigName, amiName, 400, path.join(__dirname, '/stubs/autoScalingErrorResponse.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {
            newLaunchConfigurationName: 'new-launch-config',
            amiName: 'ami-4243234'
        })).to.eventually.be.rejectedWith(Error, 'Something bad went wrong');
    });

    it('should reject when updating scaling group fails', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';
        const newLaunchConfigName = 'new-launch-config';
        const amiName = 'ami-4243234';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/singleAutoScalingGroupFound.xml'));
        awsMock.autoscaling.createLaunchConfiguration(newLaunchConfigName, amiName, 200, path.join(__dirname, '/stubs/successResponse.xml'));
        awsMock.autoscaling.updateAutoScalingGroup(autoScalingGroupName, newLaunchConfigName, 400, path.join(__dirname, '/stubs/autoScalingErrorResponse.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {
            newLaunchConfigurationName: 'new-launch-config',
            amiName: 'ami-4243234'
        })).to.eventually.be.rejectedWith(Error, 'Something bad went wrong');
    });

    it('should reject when deleting launch configuration fails', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';
        const newLaunchConfigName = 'new-launch-config';
        const amiName = 'ami-4243234';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/singleAutoScalingGroupFound.xml'));
        awsMock.autoscaling.createLaunchConfiguration(newLaunchConfigName, amiName, 200, path.join(__dirname, '/stubs/successResponse.xml'));
        awsMock.autoscaling.updateAutoScalingGroup(autoScalingGroupName, newLaunchConfigName, 200, path.join(__dirname, '/stubs/successResponse.xml'));
        awsMock.autoscaling.deleteLaunchConfiguration(launchConfigName, 400, path.join(__dirname, '/stubs/autoScalingErrorResponse.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {
            newLaunchConfigurationName: 'new-launch-config',
            amiName: 'ami-4243234'
        })).to.eventually.be.rejectedWith(Error, 'Something bad went wrong');
    });

    it('should fulfill when auto scaling group updated with new launch config successfully', () => {
        const autoScalingGroupName = 'test-auto-scaling-group';
        const launchConfigName = 'test-launch-config';
        const newLaunchConfigName = 'new-launch-config';
        const amiName = 'ami-4243234';

        awsMock.autoscaling.describeLaunchConfigurations(launchConfigName, path.join(__dirname, '/stubs/singleAutoScalingGroupFound.xml'));
        awsMock.autoscaling.createLaunchConfiguration(newLaunchConfigName, amiName, 200, path.join(__dirname, '/stubs/successResponse.xml'));
        awsMock.autoscaling.updateAutoScalingGroup(autoScalingGroupName, newLaunchConfigName, 200, path.join(__dirname, '/stubs/successResponse.xml'));
        awsMock.autoscaling.deleteLaunchConfiguration(launchConfigName, 200, path.join(__dirname, '/stubs/successResponse.xml'));

        stubAutoScalingGroup = {
            AutoScalingGroupName: autoScalingGroupName,
            LaunchConfigurationName: launchConfigName
        };

        return expect(target(stubAutoScalingGroup, {
            newLaunchConfigurationName: 'new-launch-config',
            amiName: 'ami-4243234'
        })).to.eventually.be.fulfilled;
    });
});
