const program = require('commander');
const logger = require('./logger');
const getAutoScalingGroup = require('./aws/getAutoScalingGroup');
const updateLaunchConfig = require('./aws/updateLaunchConfig');
const dateTime = new Date().getTime();

function deploy(options) {
    const newLaunchConfigurationName = options.autoScalingGroup + '_' + options.ami + '_' + dateTime;

    return getAutoScalingGroup(options)
        .then(autoScalingGroup => updateLaunchConfig(autoScalingGroup, {
            newLaunchConfigurationName: newLaunchConfigurationName,
            amiName: options.ami,
            instanceType: 't2.small'
        }))
        .catch(function(err) {
            console.error(err);
            process.exit(1);
        });
}

module.exports = function() {
    program
        .version('1.0.0')
        .description('Auto-scaling & no downtime deployment');

    program
        .command('deploy [autoScalingGroup]')
        .option('-a, --ami <n>', 'AMI name')
        .description('Deploy a new launch configuration to an auto scaling group')
        .action((autoScalingGroup, options) => deploy({
            ami: options.ami,
            autoScalingGroup: autoScalingGroup
        }));

    program.parse(process.argv);
};
