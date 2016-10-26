const checkAutoScalingGroupStatus = require('./checkAutoScalingGroupStatus');
const logger = require('../logger');

const defaultRetryInterval = 10;
const defaultWaitTimeout = 300;

module.exports = (autoScalingGroupName, retryIntervalSetting, retryTimeoutSetting) => new Promise((resolve, reject) => {
    let intervalCount = 0;
    const retryInterval = retryIntervalSetting || defaultRetryInterval;
    const retryTimeout = retryTimeoutSetting || defaultWaitTimeout;

    logger.info(`Waiting for scaling to complete. Interval:${retryInterval}s. Timeout:${retryTimeout}s`);

    const timer = setInterval(() => {
        intervalCount += retryInterval;
        logger.info(`Polling for desired instances after ${intervalCount}s`);

        return checkAutoScalingGroupStatus(autoScalingGroupName)
            .then(() => {
                clearInterval(timer);
                return resolve();
            }).catch((err) => {
                logger.error(err.message || err);

                if (intervalCount > retryTimeout) {
                    clearInterval(timer);
                    return reject('Timed out waiting for instances to become in service.');
                }

                return resolve();
            });
    }, retryInterval * 1000);
});
