const { program } = require('commander');

program.version('0.0.1');

program
    .command('list')
    .description('list all arguments')
    .action(() => {
        console.log("you\'ve typed", process.argv)
    })
program
    .option('-d, --debug', 'default extra debugging')

program.parse(process.argv)

const options = program.opts();

if (options.debug) console.log(options)

