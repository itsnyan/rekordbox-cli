import { Command } from "commander";
import { handleFilePath } from './utils/index.js'; 

const program = new Command();

program
    .command('backup')
    .description('Backup your Rekordbox library')
    .action(() => {
        handleFilePath();
    });

program.parse(process.argv);
