const { Command } = require('commander');
const { handleBackup } = require('./utils/index.js');

const program = new Command();

program
    .command('backup')
    .description('Backup your Rekordbox library')
    .action(() => {
        handleBackup();
    });

program.parse(process.argv);
