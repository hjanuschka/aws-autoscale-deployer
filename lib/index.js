const program = require('commander');
const logger = require('./logger');
const getAutoScalingGroup = require('./aws/getAutoScalingGroup');
const updateLaunchConfiguration = require('./aws/updateLaunchConfiguration');

function deploy(options) {
    return getAutoScalingGroup(options)
        .then(autoScalingGroup => ({
            autoScalingGroup: autoScalingGroup,
            newLaunchConfigurationName: autoScalingGroup.AutoScalingGroupName + '_' + options.ami + '_' + new Date().getTime(),
            amiName: options.ami,
            instanceType: 't2.small'
        }))
        .then(updateLaunchConfiguration)
        .catch(function(err) {
            console.error(err);
            process.exit(1);
        });;
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
