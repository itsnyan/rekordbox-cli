import { Command } from "commander";
import { handleBackup } from './utils/index.js'; 

const program = new Command();

program
    .command('backup')
    .description('Backup your Rekordbox library')
    .action(() => {
        handleBackup();
    });

program.parse(process.argv);
