import * as fs from 'fs';
import chalk, { Chalk } from 'chalk';
import {xml2json} from "xml-js"
import * as readline from 'readline';

interface Track {
    Name: string;
    TrackID: string;
    Location: string;
}

export function writeToFile(filename: string, data: string, callback?: (err: NodeJS.ErrnoException | null) => void): void {
    fs.writeFile(filename, data, 'utf8', (err) => {
        if (err) {
            console.error("Error writing to file:", err);
            if (callback) {
                callback(err);
            }
        } else {
            console.log("Data written to", filename);
            if (callback) {
                callback(null);
            }
        }
    });
  }


export function log(message: string, color: keyof Chalk): void {
    const method = chalk[color] as (message: string) => string;
    console.log(method(message));
}

export function handleFilePath(rl: readline.Interface) {
    rl.question('📂 Enter the location path of the XML file: ', (filePath: string) => {
        log('filePath', 'green');

        if (!filePath) {
            log('Please enter a valid file path!', 'red')
            handleFilePath(rl);
            return;
        }

        if (!filePath.endsWith('.xml')) {
            log('Invalid file format, path must have a .xml extension!', 'red')
            handleFilePath(rl);
            return;
        }

        fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats | undefined) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    log('File not found, please enter a valid file path!', 'red');
                    handleFilePath(rl);
                } else {
                    log('An error occurred, please try again!', 'red');
                    rl.close();
                }
            } else {
                if (stats && stats.isFile()) {
                    log('File found, processing...', 'green');
                    backupHandler(filePath);
                    rl.close();
                } else {
                    log('An error occurred, please try again!', 'red');
                    rl.close();
                }
            }
        });
    });
}

function extractTracksAndPlaylists(json: any): { tracks: Track[], playlists: any[] } {
    const collectionWrapper = json.elements[0].elements.find((element: any) => element.name === 'COLLECTION') as any;
    const trackElements = collectionWrapper.elements || [];
    const tracks: Track[] = trackElements.map((t: any) => t.attributes);

    const playlistWrapper = json.elements[0].elements.find((element: any) => element.name === 'PLAYLISTS') as any;
    const playlistElements = playlistWrapper.elements[0].elements || [];
    const playlists = playlistElements.map((p: any) => ({
        name: p.attributes.Name,
        tracks: p.elements ? p.elements.map((t: any) => t.attributes.Key) : []
    }));

    return { tracks, playlists };
}

function resolveTracks(trackMap: Map<string, Track>, playlists: any[]): any[] {
    return playlists.map((playlist: any) => {
        const mappedTracks = playlist.tracks
            .map((trackId: any) => trackMap.get(trackId))
            .filter((t: any) => t);

        if (mappedTracks.length) {
            return { ...playlist, tracks: mappedTracks };
        }
    });
}

function backupHandler(filePath: string) {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(xml2json(xmlData));

    const { tracks, playlists } = extractTracksAndPlaylists(json);

    const trackMap: Map<string, Track> = new Map();
    tracks.forEach((track: Track) => {
        trackMap.set(track.TrackID, track);
    });

    const mappedPlaylist = resolveTracks(trackMap, playlists);

    console.log('mappedPlaylist', mappedPlaylist);

    // todo - util to create new folders and copy/paste files from each track
}