import installer from '@ffmpeg-installer/ffmpeg';
import axios from 'axios';
import Ffmpeg from 'fluent-ffmpeg';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { removeFile } from '../utils/file-cleaner.js';

const dirName = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    Ffmpeg.setFfmpegPath(installer.path);
  }

  public async save(url: string, userID: string, fileName: string): Promise<string> {
    const oggPath = resolve(dirName, `../voices`, `${fileName + '_' + userID}.ogg`);

    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    });

    return new Promise((resolve, rejects) => {
      const stream = createWriteStream(oggPath);

      response.data.pipe(stream);

      stream.on('error', (err) => {
        rejects(err);
        console.log(err);
      });

      stream.on('finish', () => {
        console.log('Ogg file downloaded');
        resolve(oggPath);
      });
    });
  }

  public toMp3(oggPath: string): Promise<string> {
    const fileName = oggPath.slice(oggPath.lastIndexOf('\\') + 1, oggPath.lastIndexOf('.'));
    const outputPath = resolve(dirname(oggPath), `${fileName}.mp3`);
    return new Promise((resolve, reject) => {
      Ffmpeg(oggPath)
        .inputOption('-t 30')
        .output(outputPath)
        .on('end', () => {
          removeFile(oggPath);
          console.log('MP3 file prepared');

          resolve(outputPath);
        })
        .on('error', (err) => {
          console.log(err);
          reject(JSON.stringify(err));
        })
        .run();
    });
  }
}

export const ogg = new OggConverter();
