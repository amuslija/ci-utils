require('dotenv').config();
const core = require('@actions/core');

const logger = require('./utils/logger');
const reportVulnerabilities = require('./lib/reportVulnerabilities');

const main = async () => {
  logger.log(process.env);
  const command = core.getInput('command');

  try {
    switch (command) {
      case 'report-vulnerabilities':
        return reportVulnerabilities();
      default:
        logger.log('No command specified');
        return process.exit(0);
    }
  } catch (e) {
    logger.error(`Error during execution of ${command}: ${e.message}`, e);
    return process.exit(1);
  }
};

main();
