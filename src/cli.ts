import { Command } from "commander";
import {xml2json} from "xml-js"
import * as readline from 'readline';
import * as fs from 'fs';

const program = new Command();

function askForFilePath(rl: readline.Interface) {
  rl.question('Enter the location path of the XML file: ', (filePath: string) => {
    
    filePath = '/Users/nyan/Work/rekordbox-cli/src/assets/library.xml';

    if (!filePath.endsWith('.xml')) {
      console.error('Invalid file format. File must have a .xml extension.');
      askForFilePath(rl); // Ask the prompt again
      return;
    }

    fs.stat(filePath, (err: NodeJS.ErrnoException | null, stats: fs.Stats | undefined) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.error('File not found:', filePath);
          askForFilePath(rl); // Ask the prompt again
        } else {
          console.error('Error checking file stats:', err);
          rl.close();
        }
      } else {
        if (stats && stats.isFile()) {
          console.log('File exists:', filePath);
          // Now you can proceed with your backup logic
          backupFunction(filePath);
          rl.close();
        } else {
          console.error('Not a file:', filePath);
          rl.close();
        }
      }
    });
  });
}

  



function backupFunction(filePath: string) {
    const xmlData = fs.readFileSync(filePath, 'utf8');

    const parsedData = xml2json(xmlData);
    const json = JSON.parse(parsedData);
    console.log('json', json);

    const elements = json.elements[0].elements.find((element: any) => element.name === 'PLAYLISTS') as any;
    console.log('playlists', elements);

    const playlistElements = elements.elements[0].elements;
    console.log('playlist elements', playlistElements);

    const playlists = playlistElements.map((p: any) => {
        let playlist: any = {};
        playlist.name = p.attributes.Name;
        
        const tracks = p.elements ? p.elements : [];

        const playlistTracks = tracks.map((t: any) => {
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
