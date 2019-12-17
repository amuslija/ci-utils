const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const { differenceBy, isEqual } = require('lodash');

const logger = require('../utils/logger');

module.exports = async ({ vulnerabilitiesFilePath, vulnerabilitiesOutputPath }) => {
  let newVulnerabilitiesFile;
  try {
    newVulnerabilitiesFile = fs.readFileSync(vulnerabilitiesFilePath);
  } catch (e) {
    logger.error(`Error reading vulnerabilities file from ${newVulnerabilitiesFile}`);
    process.exit(1);
  }
  const newVulnerabilities = JSON.parse(newVulnerabilitiesFile);

  const githubToken = core.getInput('github-token');
  const octokit = new github.GitHub(githubToken);

  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const { data } = await octokit.issues.listForRepo({ owner, repo });
  const oldVulnerabilities = data.reduce((vulns, issue) => {
    if (!issue.labels.find(({ name }) => name === 'vulnerability')) {
      return vulns;
    }
    return [
      ...vulns,
      ...(JSON.parse(issue.body.split('```')[1])).vulnerabilities,
    ];
  }, []);

  const vulnerabilitiesToReport = differenceBy(
    newVulnerabilities.vulnerabilities,
    oldVulnerabilities,
    isEqual,
  );
  const outputPath = vulnerabilitiesOutputPath || './vulnerabilities_to_report.json';
  fs.writeFileSync(outputPath, JSON.stringify({
    ...newVulnerabilities,
    vulnerabilities: vulnerabilitiesToReport,
  }));
};