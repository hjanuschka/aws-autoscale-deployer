const checkAutoScalingGroupStatus = require('./checkAutoScalingGroupStatus');
const logger = require('../logger');
const defaultRetryInterval = 10;
const defaultWaitTimeout = 300;

module.exports = (autoScalingGroupName, retryInterval, retryTimeout) => new Promise((resolve, reject) => {
    var intervalCount = 0;
    retryInterval = retryInterval || defaultRetryInterval;
    retryTimeout = retryTimeout || defaultWaitTimeout;

    logger.info('Waiting for scaling to complete. Interval: ' + retryInterval + 's. Timeout:' + retryTimeout + 's');

    var timer = setInterval(() => {
        intervalCount += retryInterval;
        logger.info('Polling for desired instances after ' + intervalCount + 's');

        return checkAutoScalingGroupStatus(autoScalingGroupName)
            .then(() => {
                clearInterval(timer);
                return resolve()
            }).catch(function(err) {
                logger.error(err.message || err);

                if (intervalCount > retryTimeout) {
                    clearInterval(timer);
                    return reject('Timed out waiting for instances to become in service.');
                }
            });
    }, retryInterval * 1000);
});
