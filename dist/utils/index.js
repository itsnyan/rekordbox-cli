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
exports.handleFilePath = exports.log = exports.writeToFile = void 0;
const fs = __importStar(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const xml_js_1 = require("xml-js");
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
exports.writeToFile = writeToFile;
function log(message, color) {
    const method = chalk_1.default[color];
    console.log(method(message));
}
exports.log = log;
function handleFilePath(rl) {
    rl.question('📂 Enter the location path of the XML file: ', (filePath) => {
        log('filePath', 'green');
        if (!filePath) {
            log('Please enter a valid file path!', 'red');
            handleFilePath(rl);
            return;
        }
        if (!filePath.endsWith('.xml')) {
            log('Invalid file format, path must have a .xml extension!', 'red');
            handleFilePath(rl);
            return;
        }
        fs.stat(filePath, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    log('File not found, please enter a valid file path!', 'red');
                    handleFilePath(rl);
                }
                else {
                    log('An error occurred, please try again!', 'red');
                    rl.close();
                }
            }
            else {
                if (stats && stats.isFile()) {
                    log('File found, processing...', 'green');
                    backupHandler(filePath);
                    rl.close();
                }
                else {
                    log('An error occurred, please try again!', 'red');
                    rl.close();
                }
            }
        });
    });
}
exports.handleFilePath = handleFilePath;
function extractTracksAndPlaylists(json) {
    const collectionWrapper = json.elements[0].elements.find((element) => element.name === 'COLLECTION');
    const trackElements = collectionWrapper.elements || [];
    const tracks = trackElements.map((t) => t.attributes);
    const playlistWrapper = json.elements[0].elements.find((element) => element.name === 'PLAYLISTS');
    const playlistElements = playlistWrapper.elements[0].elements || [];
    const playlists = playlistElements.map((p) => ({
        name: p.attributes.Name,
        tracks: p.elements ? p.elements.map((t) => t.attributes.Key) : []
    }));
    return { tracks, playlists };
}
function resolveTracks(trackMap, playlists) {
    return playlists.map((playlist) => {
        const mappedTracks = playlist.tracks
            .map((trackId) => trackMap.get(trackId))
            .filter((t) => t);
        if (mappedTracks.length) {
            return Object.assign(Object.assign({}, playlist), { tracks: mappedTracks });
        }
    });
}
function backupHandler(filePath) {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse((0, xml_js_1.xml2json)(xmlData));
    const { tracks, playlists } = extractTracksAndPlaylists(json);
    const trackMap = new Map();
    tracks.forEach((track) => {
        trackMap.set(track.TrackID, track);
    });
    const mappedPlaylist = resolveTracks(trackMap, playlists);
    console.log('mappedPlaylist', mappedPlaylist);
    // todo - util to create new folders and copy/paste files from each track
}
//# sourceMappingURL=index.js.map