import fs from 'fs';
import chalk from 'chalk';
import { xml2json } from 'xml-js';
import commander from 'commander';
import { selectDirectory } from 'cli-file-select';
import prompt from 'prompt';

interface Track {
    Name: string;
    TrackID: string;
    Location: string;
}

export function writeToFile(filename: string, data: string, callback: (error: NodeJS.ErrnoException | null) => void): void {
    fs.writeFile(filename, data, 'utf8', (err: NodeJS.ErrnoException | null) => {
        if (err) {
            console.error("Error writing to file:", err);
            callback(err);
        } else {
            console.log("Data written to", filename);
            callback(null);
        }
    });
}

export async function handleFilePath(): Promise<void> {
    try {
        const { filePath } = await prompt.get<{ filePath: string }>([
            {
                name: 'filePath',
                description: '📂 Enter the location path of the XML file:',
                required: true,
                conform: (value: string) => {
                    if (!value.trim().endsWith('.xml')) {
                        console.error('Invalid file format, path must have a .xml extension!');
                        return false;
                    }
                    return true;
                }
            }
        ]);

        const stats = await fs.promises.stat(filePath);

        if (!stats.isFile()) {
            throw new Error('File not found or is not a file.');
        }

        console.log('File found, processing...');

        const { playlists, tracks } = await backupHandler(filePath);

        const folderPath = await promptFolderSelection();

        console.log('Folder selected:', folderPath);
        console.log('Backing up playlists into the selected folder...');

        // todo: run createBackup function with filePath and folderPath
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
}

async function promptFolderSelection(): Promise<string> {
    try {
        console.log('Select the folder where you want to save the backup:');
        const folderPath = await selectDirectory();
        return folderPath;
    } catch (error) {
        console.error('Error selecting folder:', error);
        throw error;
    }
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

export async function backupHandler(filePath: string): Promise<{ playlists: any[], tracks: any[] }> {
    const xmlData = await fs.promises.readFile(filePath, 'utf8');
    const json = JSON.parse(xml2json(xmlData));

    const { tracks, playlists } = extractTracksAndPlaylists(json);

    const trackMap: Map<string, Track> = new Map();
    
    tracks.forEach((track: Track) => {
        trackMap.set(track.TrackID, track);
    });

    const mappedPlaylist = resolveTracks(trackMap, playlists);

    return { playlists: mappedPlaylist, tracks };
}