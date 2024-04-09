import { Command } from "commander";
import * as readline from 'readline';
import { handleFilePath } from "./utils";

const program = new Command();

program
    .command('backup')
    .description('Backup your Rekordbox library')
    .action(() => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        handleFilePath(rl);
    });

program.parse(process.argv);
