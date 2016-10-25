const checkAutoScalingGroupStatus = require('./checkAutoScalingGroupStatus');
const logger = require('../logger');
const defaultRetryInterval = 10;
const defaultWaitTimeout = 240;

module.exports = (autoScalingGroupName, retryInterval, retryTimeout) => new Promise((resolve, reject) => {
    var intervalCount = 0;
    const retryInMs = (retryInterval || defaultRetryInterval) * 1000;
    const timeoutInMs = (retryTimeout || defaultWaitTimeout) * 1000;

    logger.info('Waiting for scaling to complete. Interval: ' + retryInMs + 'ms. Timeout:' + timeoutInMs + 'ms');

    var timer = setInterval(() => {
        intervalCount += retryInMs;
        logger.info('Polling for desired instances after ' + intervalCount + 'ms');

        return checkAutoScalingGroupStatus(autoScalingGroupName)
            .then(() => {
                clearInterval(timer);
                return resolve()
            }).catch(function(err) {
                logger.error(err.message || err);

                if (intervalCount > timeoutInMs) {
                    clearInterval(timer);
                    return reject('Timed out waiting for instances to become in service.');
                }
            });
    }, retryInMs);
});
