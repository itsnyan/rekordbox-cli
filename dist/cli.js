"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const xml_js_1 = require("xml-js");
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const program = new commander_1.Command();
function askForFilePath(rl) {
    rl.question('Enter the location path of the XML file: ', (filePath) => {
        filePath = '/Users/nyan/Work/rekordbox-cli/src/assets/library.xml';
        if (!filePath.endsWith('.xml')) {
            console.error('Invalid file format. File must have a .xml extension.');
            askForFilePath(rl); // Ask the prompt again
            return;
        }
        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.error('File not found:', filePath);
                    askForFilePath(rl); // Ask the prompt again
                }
                else {
                    console.error('Error checking file stats:', err);
                    rl.close();
                }
            }
            else {
                if (stats && stats.isFile()) {
                    console.log('File exists:', filePath);
                    // Now you can proceed with your backup logic
                    backupFunction(filePath);
                    rl.close();
                }
                else {
                    console.error('Not a file:', filePath);
                    rl.close();
                }
            }
        });
    });
}
function backupFunction(filePath) {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const parsedData = (0, xml_js_1.xml2json)(xmlData);
    const json = JSON.parse(parsedData);
    console.log('json', json);
    const elements = json.elements[0].elements.find((element) => element.name === 'PLAYLISTS');
    console.log('playlists', elements);
    const playlistElements = elements.elements[0].elements;
    console.log('playlist elements', playlistElements);
    const playlists = playlistElements.map((p) => {
        let playlist = {};
        playlist.name = p.attributes.Name;
        const tracks = p.elements ? p.elements : [];
        const playlistTracks = tracks.map((t) => {
            return t.attributes.Key;
        });
        playlist.tracks = playlistTracks;
        return playlist;
    });
    console.log('playlists', playlists);
    console.log('first playlist', playlists[0]);
}
program
    .command('backup')
    .description('Backup your Rekordbox library')
    .action(() => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    askForFilePath(rl);
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map