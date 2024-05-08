const fs = require('fs');
const chalk = require('chalk');
const { xml2json } = require('xml-js');
const { selectDirectory } = require('cli-file-select');
const inquirer = require('inquirer');
const execa = require('execa');

interface Track {
    Name: string;
    TrackID: string;
    Location: string;
}

export const log = console.log;

/**
 * @param filePath 
 * @returns playlists and tracks mapped to it's track information - extracted from the XML file
 */

export async function parseXML(filePath: string): Promise<{ playlists: any[], tracks: any[] }> {
    const xmlData = await fs.promises.readFile(filePath, 'utf8');
    const json = JSON.parse(xml2json(xmlData));

    const { tracks = [], playlists = [] } = extractTracksAndPlaylists(json);
    const trackMap: Map<string, Track> = new Map();
    
    tracks.forEach((track: Track) => {
        trackMap.set(track.TrackID, track);
    });

    const mappedPlaylist = mapPlaylistToTracks(trackMap, playlists);

    return { playlists: mappedPlaylist, tracks };
}

export function writeToFile(filename: string, data: string): void {
    fs.writeFile(filename, data, 'utf8', (err: NodeJS.ErrnoException | null) => {
        if (err) {
            log(chalk.red("Error writing to file:", err));
            return;
        } else {
            log(chalk.green("Data written to", filename));
            return;
        }
    });
}

export async function handleBackup(): Promise<void> {
    try {
        const { filePath } = await inquirer.prompt([
            {
                type: 'input',
                name: 'filePath',
                message: '📂 Enter the location path of the XML file:',
                validate: (value) => {
                    if (!value.trim().endsWith('.xml')) {
                        return 'Invalid file format, path must have a .xml extension!';
                    }
                    return true;
                }
            }
        ]);

        const stats = await fs.promises.stat(filePath);


        if (!stats.isFile()) {
            throw new Error('File not found or is not a file.');
        }

        log(chalk.green('File found, processing...'));

        const { playlists = [], tracks = [] } = await parseXML(filePath);


        const folderPath: string = await promptFolderSelection();

        log(chalk.greenBright('folderPath:', folderPath))

        process.chdir(folderPath);
        
        writeToFile('playlists.json', JSON.stringify(playlists));
        writeToFile('tracks.json', JSON.stringify(tracks));

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

function mapPlaylistToTracks(trackMap: Map<string, Track>, playlists: any[]): any[] {
    return playlists.map((playlist: any) => {
        const mappedTracks = playlist.tracks
            .map((trackId: any) => trackMap.get(trackId))
            .filter((t: any) => t);

        if (mappedTracks.length) {
            return { ...playlist, tracks: mappedTracks };
        }
    });
}
