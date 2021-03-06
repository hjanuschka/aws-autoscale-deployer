const program = require('commander');
const logger = require('./logger');
const getAutoScalingGroup = require('./aws/getAutoScalingGroup');
const updateLaunchConfig = require('./aws/updateLaunchConfig');
const waitForScale = require('./aws/waitForScale');
const terminateOldInstances = require('./aws/terminateOldInstances');
const scale = require('./scale.js');
const version = require('../package.json').version;
const status = require('./status.js');

const dateTime = new Date().getTime();

function upgrade(options) {
    return getAutoScalingGroup(options.autoScalingGroup)
        .then(autoScalingGroup => updateLaunchConfig(autoScalingGroup, {
            newLaunchConfigurationName: `${options.autoScalingGroup}_${options.ami}_${dateTime}`,
            amiName: options.ami,
            instanceType: options.instanceType
        }))
        .then(() => logger.info(`Upgraded auto scaling group to new ami: ${options.ami}`))
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
}

function commit(options) {
    return getAutoScalingGroup(options.autoScalingGroup)
        .then(autoScalingGroup => terminateOldInstances(autoScalingGroup, true))
        .then(() => waitForScale(options.autoScalingGroup, options.retryInterval, options.timeout))
        .then(() => logger.info('Committed release. All old instances have been terminated.'))
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
}

function rollback(options) {
    return getAutoScalingGroup(options.autoScalingGroup)
        .then(autoScalingGroup => updateLaunchConfig(autoScalingGroup, {
            newLaunchConfigurationName: `${options.autoScalingGroup}_${options.ami}_${dateTime}`,
            amiName: options.ami
        }))
        .then(() => getAutoScalingGroup(options.autoScalingGroup))
        .then(autoScalingGroup => terminateOldInstances(autoScalingGroup, false))
        .then(() => logger.info(`Rolled back to ami ${options.ami}. All old instances have been scheduled for termination.`))
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
}

module.exports = function() {
    program
        .version(version)
        .description('Auto-scaling & no downtime deployment');

    program
        .command('upgrade <autoScalingGroup>')
        .option('-a, --ami <n>', 'AMI name')
        .option('-i, --instanceType [type]', 'Instance type to use, defaults to current')
        .description('Creates a new launch configuration and sets it to an auto scaling group')
        .action((autoScalingGroup, options) => upgrade({
            ami: options.ami,
            autoScalingGroup,
            instanceType: options.instanceType
        }));

    program
        .command('scale <autoScalingGroup>')
        .option('-m, --minimum <n>', 'Minimum scale', parseInt)
        .option('-M, --maximum <n>', 'Maximum scale', parseInt)
        .option('-d, --desired <n>', 'Desired scale', parseInt)
        .option('-r, --retryInterval [seconds]', 'Retry interval in seconds', parseInt)
        .option('-t, --timeout [seconds]', 'Wait timeout in seconds', parseInt)
        .description('Scale an auto scaling group')
        .action((asgname, options) => scale.scale(asgname, options));

    program
        .command('scaleup <autoScalingGroup>')
        .option('-i, --instances <n>', 'No of instances to increase desired scale up', parseInt)
        .option('-r, --retryInterval [seconds]', 'Retry interval in seconds', parseInt)
        .option('-t, --timeout [seconds]', 'Wait timeout in seconds', parseInt)
        .description('Scale an auto scaling group up by a number of desired instances')
        .action((asgname, options) => scale.scaleUp(asgname, options));

    program
        .command('scaledown <autoScalingGroup>')
        .option('-i, --instances <n>', 'No of instances to increase desired scale down', parseInt)
        .option('-r, --retryInterval [seconds]', 'Retry interval in seconds', parseInt)
        .option('-t, --timeout [seconds]', 'Wait timeout in seconds', parseInt)
        .description('Scale an auto scaling group down by a number of desired instances')
        .action((asgname, options) => scale.scaleDown(asgname, options));

    program
        .command('commit <autoScalingGroup>')
        .option('-r, --retryInterval [seconds]', 'Retry interval in seconds', parseInt)
        .option('-t, --timeout [seconds]', 'Wait timeout in seconds', parseInt)
        .description('Terminate any instance not running against the latest launch configuration')
        .action(autoScalingGroup => commit({
            autoScalingGroup
        }));

    program
        .command('rollback <autoScalingGroup>')
        .option('-a, --ami <n>', 'AMI name')
        .description('Use where you want to quickly rollback to a previous AMI. Will update the launch configuration to the specified ami name and terminate all old instances. May cause a period of downtime.')
        .action((autoScalingGroup, options) => rollback({
            autoScalingGroup,
            ami: options.ami
        }));

    program
        .command('status <autoScalingGroup>')
        .description('Gets status of an auto scaling group')
        .action(autoScalingGroup => status(autoScalingGroup));

    program.parse(process.argv);
};
