require('dotenv').config();

const { program } = require('commander');
const { Octokit } = require('octokit');

const { GITHUB_ACCESS_TOKEN } = process.env;

program.version('0.0.1');

const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });

const OWNER = 'iougou03';
const REPOSITORY = 'cli-practice';

program
  .command('me')
  .description('Check my profile')
  .action(async () => {
    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated();

    console.log(login);
  });

program
  .command('list')
  .description('list all arguments')
  .action(async () => {
    const result = await octokit.rest.issues.listForRepo({
      owner: OWNER,
      repo: REPOSITORY,
      labels: 'bug'
    });

    // const issuesWithBugLabel = result.data.filter(
    //   (issue) =>
    //     issue.labels.find((label) => label.name === 'bug') !== undefined
    // );

    // issuesWithBugLabel.forEach(issue => {
    //     console.log(issue.number, issue.title, issue.created_at)
    // })

    result.data.forEach(issue => {
        console.log(issue.number, issue.title, issue.created_at)
    })

  });

program
  .command('check-prs')
  .description('Check pull request status')
  .action(async () => {
    const result = await octokit.rest.pulls.list({
      owner: OWNER,
      repo: REPOSITORY
    })

    console.log(result.data);
  })

// program
//     .option('-d, --debug', 'default extra debugging')

// program.parse(process.argv)
program.parseAsync();

// const options = program.opts();

// if (options.debug) console.log(options);
