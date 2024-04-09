"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commander_1 = require("commander");
var index_js_1 = require("./utils/index.js");
var program = new commander_1.Command();
program
    .command('backup')
    .description('Backup your Rekordbox library')
    .action(function () {
    (0, index_js_1.handleFilePath)();
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map