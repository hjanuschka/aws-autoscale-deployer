const logger = require('./logger');
const getAutoScalingGroup = require('./aws/getAutoScalingGroup');
const scaleAutoScalingGroup = require('./aws/scaleAutoScalingGroup');
const waitForScale = require('./aws/waitForScale');
const checkAutoScalingGroupStatus = require('./aws/checkAutoScalingGroupStatus');

function scale(name, options) {
    return getAutoScalingGroup(name)
        .then(autoScaleGroup => scaleAutoScalingGroup(autoScaleGroup.AutoScalingGroupName, {
            min: options.minimum >= 0 ? options.minimum : autoScaleGroup.MinSize,
            max: options.maximum >= 0 ? options.maximum : autoScaleGroup.MaxSize,
            desired: options.desired >= 0 ? options.desired : autoScaleGroup.DesiredCapacity
        }))
        .then(() => waitForScale(name, options.retryInterval, options.timeout))
        .then(scale => logger.info('Scaled auto scaling group to ' + JSON.stringify(scale)))
        .catch(function(err) {
            logger.error(err);
            process.exit(1);
        });
}

function scaleUp(name, options) {
    const amount = options.instances || 1;

    return getAutoScalingGroup(name)
        .then(autoScaleGroup => scaleAutoScalingGroup(autoScaleGroup.AutoScalingGroupName, autoScaleGroup.DesiredCapacity + amount))
        .then(() => waitForScale(name, options.retryInterval, options.timeout))
        .then(scale => logger.info('Increased scale of auto scaling group by ' + amount))
        .catch(function(err) {
            logger.error(err);
            process.exit(1);
        });
}

function scaleDown(name, options) {
    const amount = options.instances || 1;

    return getAutoScalingGroup(name)
        .then(autoScaleGroup => scaleAutoScalingGroup(autoScaleGroup.AutoScalingGroupName, autoScaleGroup.DesiredCapacity - amount))
        .then(() => waitForScale(name, options.retryInterval, options.timeout))
        .then(scale => logger.info('Decreased scale of auto scaling group by ' + amount))
        .catch(function(err) {
            logger.error(err);
            process.exit(1);
        });
}

module.exports = {
    scale: scale,
    scaleUp: scaleUp,
    scaleDown: scaleDown,
}
