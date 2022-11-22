require('dotenv').config();

const { program } = require('commander');
const { Octokit } = require('octokit');
const prompts = require('prompts');

const { GITHUB_ACCESS_TOKEN } = process.env;

program.version('0.0.1');

const octokit = new Octokit({ auth: GITHUB_ACCESS_TOKEN });

const OWNER = 'iougou03';
const REPOSITORY = 'cli-practice';
const LABEL_TOO_BIG = 'too-big';

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
      labels: 'bug',
    });

    // const issuesWithBugLabel = result.data.filter(
    //   (issue) =>
    //     issue.labels.find((label) => label.name === 'bug') !== undefined
    // );

    // issuesWithBugLabel.forEach(issue => {
    //     console.log(issue.number, issue.title, issue.created_at)
    // })

    result.data.forEach((issue) => {
      console.log(issue.number, issue.title, issue.created_at);
    });
  });

program
  .command('check-prs')
  .description('Check pull request status')
  .action(async () => {
    const result = await octokit.rest.pulls.list({
      owner: OWNER,
      repo: REPOSITORY,
    });

    const prsWithDiff = await Promise.all(
      result.data.map(async (pr) => {
        return {
          labels: pr.labels,
          number: pr.number,
          compare: await octokit.rest.repos.compareCommits({
            owner: OWNER,
            repo: REPOSITORY,
            base: pr.base.ref,
            head: pr.head.ref,
          }),
        };
      })
    );

    await Promise.all(
      prsWithDiff
        .map(({ compare, ...rest }) => {
          const totalChanges = compare.data.files.reduce(
            (sum, file) => sum + file.changes,
            0
          );

          return {
            compare,
            totalChanges,
            ...rest,
          };
        })
        .filter(
          (pr) =>
            pr && typeof pr.totalChanges === 'number' && pr.totalChanges > 100
        )
        .map(async ({ labels, number, totalChanges }) => {
          console.log(number, totalChanges);

          if (!labels.find((label) => label.name === LABEL_TOO_BIG)) {
            const response = await prompts({
              type: 'confirm',
              name: 'shouldContinue',
              message: `Do you really want to add label to PR-${number}`,
            });

            if (response.shouldContinue) {
              return octokit.rest.issues.addLabels({
                owner: OWNER,
                repo: REPOSITORY,
                issue_number: number,
                labels: [LABEL_TOO_BIG],
              });
            }
          }

          return undefined;
        })
    );
  });

// program
//     .option('-d, --debug', 'default extra debugging')

// program.parse(process.argv)
program.parseAsync();

// const options = program.opts();

// if (options.debug) console.log(options);
