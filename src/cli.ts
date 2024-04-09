import { Command } from "commander";
import {xml2json} from "xml-js"
import * as readline from 'readline';
import * as fs from 'fs';
import chalk from "chalk";

const program = new Command();

const log = console.log;

function askForFilePath(rl: readline.Interface) {
  rl.question('📂 Enter the location path of the XML file: ', (filePath: string) => {
    
    filePath = '/Users/nyan/Work/rekordbox-cli/src/assets/library.xml';

    if (!filePath) {
      log(chalk.red('‼️ Please enter a valid file path!'));
      askForFilePath(rl);
      return;
    }

    if (filePath && !filePath.endsWith('.xml')) {
      log(chalk.red('⛔️ Invalid file format, path must have a .xml extension!'));
      askForFilePath(rl);
      return;
    }

    fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats | undefined) => {
      if (err) {
        if (err.code === 'ENOENT') {
          log(chalk.yellow('File not found:', filePath));
          askForFilePath(rl);
        } else {
          log(chalk.yellow('Error checking file stats:', err));
          rl.close();
        }
      } else {
        if (stats && stats.isFile()) {
          log(chalk.green('File exists:', filePath));
          backupFunction(filePath);
          rl.close();
        } else {
          log(chalk.red('Not a file:', filePath));
          rl.close();
        }
      }
    });
  });
}

interface Track {
  Name: string;
  TrackID: string;
  Location: string;
}

function backupFunction(filePath: string) {
  const xmlData = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(xml2json(xmlData));

  // Extracting tracks
  const collectionWrapper = json.elements[0].elements.find((element: any) => element.name === 'COLLECTION') as any;
  const trackElements = collectionWrapper.elements || [];
  const tracks: Track[] = trackElements.map((t: any) => t.attributes);

  // Extracting playlists
  const playlistWrapper = json.elements[0].elements.find((element: any) => element.name === 'PLAYLISTS') as any;
  const playlistElements = playlistWrapper.elements[0].elements || [];
  const playlists = playlistElements.map((p: any) => {
      const playlist: any = {
          name: p.attributes.Name,
          tracks: p.elements ? p.elements.map((t: any) => t.attributes.Key) : []
      };
      return playlist;
  });

  writeToFile('playlists.js', JSON.stringify(playlists));

  // Create track map
  const trackMap: Map<string, Track> = new Map();
  tracks.forEach((track: Track) => {
      trackMap.set(track.TrackID, track);
  });

  // Create playlist map with tracks resolved
  const mappedPlaylist = playlists.map((playlist: any) => {
    const mappedTracks = playlist.tracks
        .map((trackId: any) => trackMap.get(trackId)).filter((t: any) => t);
    
    if (mappedTracks.length) {
      return { ...playlist, tracks: mappedTracks };
    }
});

  writeToFile('mappedPlaylist.js', JSON.stringify(mappedPlaylist));
}


function writeToFile(filename: string, data: string, callback?: (err: NodeJS.ErrnoException | null) => void): void {
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
