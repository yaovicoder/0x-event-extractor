const delay = require('delay');
const withRetry = require('promise-poller').default;

const { logError } = require('./logger');

const repeatTask = async (task, interval, maxRetries) => {
  try {
    await withRetry({
      taskFn: task,
      interval,
      retries: maxRetries,
      progressCallback: (retriesRemaining, error) => logError(error),
    });
  } catch (error) {
    logError(
      `Stopped running ${task.name} due to too many failures (${maxRetries}).`,
    );
  }

  await delay(interval);
  await repeatTask(task, interval);
};

const runJobs = jobs =>
  Promise.all(
    jobs.map(job => repeatTask(job.fn, job.interval, job.maxRetries)),
  );

module.exports.runJobs = runJobs;
