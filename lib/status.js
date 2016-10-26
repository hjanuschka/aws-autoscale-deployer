const logger = require('./logger');
const getAutoScalingGroup = require('./aws/getAutoScalingGroup');
const checkAutoScalingGroupStatus = require('./aws/checkAutoScalingGroupStatus');

module.exports = (autoScalingGroupName) => {
    getAutoScalingGroup(autoScalingGroupName)
        .then(() => checkAutoScalingGroupStatus(autoScalingGroupName))
        .then(() => logger.info(`${autoScalingGroupName} reporting as healthy.`))
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });
};
