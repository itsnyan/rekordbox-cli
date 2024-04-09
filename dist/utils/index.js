"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupHandler = exports.handleFilePath = exports.writeToFile = void 0;
var fs_1 = __importDefault(require("fs"));
var xml_js_1 = require("xml-js");
var cli_file_select_1 = require("cli-file-select");
var prompt_1 = __importDefault(require("prompt"));
function writeToFile(filename, data) {
    return new Promise(function (resolve, reject) {
        fs_1.default.writeFile(filename, data, 'utf8', function (err) {
            if (err) {
                console.error("Error writing to file:", err);
                reject(err);
            }
            else {
                console.log("Data written to", filename);
                resolve();
            }
        });
    });
}
exports.writeToFile = writeToFile;
function handleFilePath() {
    return __awaiter(this, void 0, void 0, function () {
        var filePath, stats, _a, playlists, tracks, folderPath, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, prompt_1.default.get([
                            {
                                name: 'filePath',
                                description: '📂 Enter the location path of the XML file:',
                                required: true,
                                conform: function (value) {
                                    if (!value.trim().endsWith('.xml')) {
                                        console.error('Invalid file format, path must have a .xml extension!');
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        ])];
                case 1:
                    filePath = (_b.sent()).filePath;
                    return [4 /*yield*/, fs_1.default.promises.stat(filePath)];
                case 2:
                    stats = _b.sent();
                    if (!stats.isFile()) {
                        throw new Error('File not found or is not a file.');
                    }
                    console.log('File found, processing...');
                    return [4 /*yield*/, backupHandler(filePath)];
                case 3:
                    _a = _b.sent(), playlists = _a.playlists, tracks = _a.tracks;
                    return [4 /*yield*/, promptFolderSelection()];
                case 4:
                    folderPath = _b.sent();
                    console.log('Folder selected:', folderPath);
                    console.log('Backing up playlists into the selected folder...');
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    console.error('An error occurred:', error_1);
                    throw error_1; // Rethrow the error to propagate it further if needed
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.handleFilePath = handleFilePath;
function promptFolderSelection() {
    return __awaiter(this, void 0, void 0, function () {
        var folderPath, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('Select the folder where you want to save the backup:');
                    return [4 /*yield*/, (0, cli_file_select_1.selectDirectory)()];
                case 1:
                    folderPath = _a.sent();
                    return [2 /*return*/, folderPath];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error selecting folder:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function extractTracksAndPlaylists(json) {
    var collectionWrapper = json.elements[0].elements.find(function (element) { return element.name === 'COLLECTION'; });
    var trackElements = collectionWrapper.elements || [];
    var tracks = trackElements.map(function (t) { return t.attributes; });
    var playlistWrapper = json.elements[0].elements.find(function (element) { return element.name === 'PLAYLISTS'; });
    var playlistElements = playlistWrapper.elements[0].elements || [];
    var playlists = playlistElements.map(function (p) { return ({
        name: p.attributes.Name,
        tracks: p.elements ? p.elements.map(function (t) { return t.attributes.Key; }) : []
    }); });
    return { tracks: tracks, playlists: playlists };
}
function resolveTracks(trackMap, playlists) {
    return playlists.map(function (playlist) {
        var mappedTracks = playlist.tracks
            .map(function (trackId) { return trackMap.get(trackId); })
            .filter(function (t) { return t; });
        if (mappedTracks.length) {
            return __assign(__assign({}, playlist), { tracks: mappedTracks });
        }
    });
}
function backupHandler(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var xmlData, json, _a, tracks, playlists, trackMap, mappedPlaylist;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fs_1.default.promises.readFile(filePath, 'utf8')];
                case 1:
                    xmlData = _b.sent();
                    json = JSON.parse((0, xml_js_1.xml2json)(xmlData));
                    _a = extractTracksAndPlaylists(json), tracks = _a.tracks, playlists = _a.playlists;
                    trackMap = new Map();
                    tracks.forEach(function (track) {
                        trackMap.set(track.TrackID, track);
                    });
                    mappedPlaylist = resolveTracks(trackMap, playlists);
                    return [2 /*return*/, { playlists: mappedPlaylist, tracks: tracks }];
            }
        });
    });
}
exports.backupHandler = backupHandler;
// import * as fs from 'fs';
// import chalk, { Chalk } from 'chalk';
// import {xml2json} from "xml-js"
// import prompt from 'prompt';
// import { selectDirectory } from "cli-file-select";
// interface Track {
//     Name: string;
//     TrackID: string;
//     Location: string;
// }
// export function writeToFile(filename: string, data: string, callback?: (err: NodeJS.ErrnoException | null) => void): void {
//     fs.writeFile(filename, data, 'utf8', (err) => {
//         if (err) {
//             console.error("Error writing to file:", err);
//             if (callback) {
//                 callback(err);
//             }
//         } else {
//             console.log("Data written to", filename);
//             if (callback) {
//                 callback(null);
//             }
//         }
//     });
//   }
// export function log(message: string, color: keyof Chalk): void {
//     const method = chalk[color] as (message: string) => string;
//     console.log(method(message));
// }
// export function handleFilePath(callback: (filePath: string) => void, folderCallback: (folderPath: string) => void) {
//     prompt.start();
//     prompt.get({
//         properties: {
//             filePath: {
//                 description: '📂 Enter the location path of the XML file:',
//                 required: true
//             }
//         }
//     }, (err: any, result: { filePath: string }) => {
//         if (err) {
//             console.error('Error:', err);
//             return;
//         }
//         const { filePath } = result;
//         if (!filePath) {
//             console.error('Please enter a valid file path!');
//             handleFilePath(callback, folderCallback);
//             return;
//         }
//         if (!filePath.endsWith('.xml')) {
//             console.error('Invalid file format, path must have a .xml extension!');
//             handleFilePath(callback, folderCallback);
//             return;
//         }
//         fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats | undefined) => {
//             if (err) {
//                 if (err.code === 'ENOENT') {
//                     console.error('File not found, please enter a valid file path!');
//                     handleFilePath(callback, folderCallback);
//                 } else {
//                     console.error('An error occurred, please try again!');
//                 }
//             } else {
//                 if (stats && stats.isFile()) {
//                     console.log('File found, processing...');
//                     callback(filePath);
//                     // Once file path is obtained, proceed to select the folder
//                     promptFolderSelection(folderCallback);
//                 } else {
//                     console.error('An error occurred, please try again!');
//                 }
//             }
//         });
//     });
// }
// function extractTracksAndPlaylists(json: any): { tracks: Track[], playlists: any[] } {
//     const collectionWrapper = json.elements[0].elements.find((element: any) => element.name === 'COLLECTION') as any;
//     const trackElements = collectionWrapper.elements || [];
//     const tracks: Track[] = trackElements.map((t: any) => t.attributes);
//     const playlistWrapper = json.elements[0].elements.find((element: any) => element.name === 'PLAYLISTS') as any;
//     const playlistElements = playlistWrapper.elements[0].elements || [];
//     const playlists = playlistElements.map((p: any) => ({
//         name: p.attributes.Name,
//         tracks: p.elements ? p.elements.map((t: any) => t.attributes.Key) : []
//     }));
//     return { tracks, playlists };
// }
// function resolveTracks(trackMap: Map<string, Track>, playlists: any[]): any[] {
//     return playlists.map((playlist: any) => {
//         const mappedTracks = playlist.tracks
//             .map((trackId: any) => trackMap.get(trackId))
//             .filter((t: any) => t);
//         if (mappedTracks.length) {
//             return { ...playlist, tracks: mappedTracks };
//         }
//     });
// }
// async function backupHandler(filePath: string): Promise<{ playlists: any[], tracks: any[] }> {
//     const xmlData = fs.readFileSync(filePath, 'utf8');
//     const json = JSON.parse(xml2json(xmlData));
//     const { tracks, playlists } = extractTracksAndPlaylists(json);
//     const trackMap: Map<string, Track> = new Map();
//     tracks.forEach((track: Track) => {
//         trackMap.set(track.TrackID, track);
//     });
//     const mappedPlaylist = resolveTracks(trackMap, playlists);
//     return { playlists: mappedPlaylist, tracks };
// }
//# sourceMappingURL=index.js.map