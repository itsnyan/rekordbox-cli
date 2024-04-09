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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const xml_js_1 = require("xml-js");
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
const log = console.log;
function askForFilePath(rl) {
    rl.question('📂 Enter the location path of the XML file: ', (filePath) => {
        filePath = '/Users/nyan/Work/rekordbox-cli/src/assets/library.xml';
        if (!filePath) {
            log(chalk_1.default.red('‼️ Please enter a valid file path!'));
            askForFilePath(rl);
            return;
        }
        if (filePath && !filePath.endsWith('.xml')) {
            log(chalk_1.default.red('⛔️ Invalid file format, path must have a .xml extension!'));
            askForFilePath(rl);
            return;
        }
        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    log(chalk_1.default.yellow('File not found:', filePath));
                    askForFilePath(rl);
                }
                else {
                    log(chalk_1.default.yellow('Error checking file stats:', err));
                    rl.close();
                }
            }
            else {
                if (stats && stats.isFile()) {
                    log(chalk_1.default.green('File exists:', filePath));
                    backupFunction(filePath);
                    rl.close();
                }
                else {
                    log(chalk_1.default.red('Not a file:', filePath));
                    rl.close();
                }
            }
        });
    });
}
function backupFunction(filePath) {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse((0, xml_js_1.xml2json)(xmlData));
    // Extracting tracks
    const collectionWrapper = json.elements[0].elements.find((element) => element.name === 'COLLECTION');
    const trackElements = collectionWrapper.elements || [];
    const tracks = trackElements.map((t) => t.attributes);
    // Extracting playlists
    const playlistWrapper = json.elements[0].elements.find((element) => element.name === 'PLAYLISTS');
    const playlistElements = playlistWrapper.elements[0].elements || [];
    const playlists = playlistElements.map((p) => {
        const playlist = {
            name: p.attributes.Name,
            tracks: p.elements ? p.elements.map((t) => t.attributes.Key) : []
        };
        return playlist;
    });
    writeToFile('playlists.js', JSON.stringify(playlists));
    // Create track map
    const trackMap = new Map();
    tracks.forEach((track) => {
        trackMap.set(track.TrackID, track);
    });
    // Create playlist map with tracks resolved
    const mappedPlaylist = playlists.map((playlist) => {
        const mappedTracks = playlist.tracks
            .map((trackId) => trackMap.get(trackId));
        if (mappedTracks.length) {
            return Object.assign(Object.assign({}, playlist), { tracks: mappedTracks });
        }
    });
    writeToFile('mappedPlaylist.js', JSON.stringify(mappedPlaylist));
}
function writeToFile(filename, data, callback) {
    fs.writeFile(filename, data, 'utf8', (err) => {
        if (err) {
            console.error("Error writing to file:", err);
            if (callback) {
                callback(err);
            }
        }
        else {
            console.log("Data written to", filename);
            if (callback) {
                callback(null);
            }
        }
    });
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