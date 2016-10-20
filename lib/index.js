const program = require('commander');
const logger = require('./logger');
const getAutoScalingGroup = require('./aws/getAutoScalingGroup');
const updateLaunchConfig = require('./aws/updateLaunchConfig');
const scaleAutoScalingGroup = require('./aws/scaleAutoScalingGroup');
const dateTime = new Date().getTime();

function deploy(options) {
    const newLaunchConfigurationName = options.autoScalingGroup + '_' + options.ami + '_' + dateTime;

    return getAutoScalingGroup(options.autoScalingGroup)
        .then(autoScalingGroup => updateLaunchConfig(autoScalingGroup, {
            newLaunchConfigurationName: newLaunchConfigurationName,
            amiName: options.ami,
            instanceType: options.instanceType
        }))
        .then(() => logger.info('Updated auto scaling group with new ami'))
        .catch(function(err) {
            logger.error(err);
            process.exit(1);
        });
}

function scale(name, options) {
    return getAutoScalingGroup(name)
        .then(autoScaleGroup => scaleAutoScalingGroup(autoScaleGroup.AutoScalingGroupName, {
            min: options.minimum >= 0 ? options.minimum : autoScaleGroup.MinSize,
            max: options.maximum >= 0 ? options.maximum : autoScaleGroup.MaxSize,
            desired: options.desired >= 0 ? options.desired : autoScaleGroup.DesiredCapacity
        }))
        .then(scale => logger.info('Scaled auto scaling group to ' + JSON.stringify(scale)))
        .catch(function(err) {
            logger.error(err);
            process.exit(1);
        });
}

function status(autoScalingGroupName) {
    return getAutoScalingGroup(autoScalingGroupName)
        .then(autoScalingGroup => logger.info(autoScalingGroup));
}

module.exports = function() {
    program
        .version('1.0.0')
        .description('Auto-scaling & no downtime deployment');

    program
        .command('deploy [autoScalingGroup]')
        .option('-a, --ami <n>', 'AMI name')
        .option('-i, --instanceType <type>', 'Instance type to use, defaults to current')
        .description('Deploy a new launch configuration to an auto scaling group')
        .action((autoScalingGroup, options) => deploy({
            ami: options.ami,
            autoScalingGroup: autoScalingGroup,
            instanceType: options.instanceType
        }));

    program
        .command('scale [autoScalingGroup]')
        .option('-m, --minimum <n>', 'Minimum scale', parseInt)
        .option('-M, --maximum <n>', 'Maximum scale', parseInt)
        .option('-d, --desired <n>', 'Desired scale', parseInt)
        .description('Scale an auto scaling group')
        .action((asgname, options) => scale(asgname, options));

    program
        .command('status [autoScalingGroup]')
        .description('Gets status of an auto scaling group')
        .action((autoScalingGroup) => status(autoScalingGroup));

    program.parse(process.argv);
};
