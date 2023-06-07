import axios from 'axios';
import { createWriteStream } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const dirName = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {}

  public getOgg() {}

  public async save(url: string, userID: string, fileName: string) {
    try {
      const oggPath = resolve(dirName, `../voices/${userID}`, `${fileName + '_' + userID}.ogg`);

      const response = await axios({
        method: 'get',
        url,
        responseType: 'stream',
      });

      return new Promise((resolve, rejects) => {
        const stream = createWriteStream(oggPath);

        response.data.pipe(stream);

        stream.on('finish', () => {
          console.log('Ogg file downloaded');
          resolve(oggPath);
        });
      });
    } catch (err) {}
  }

  public toMp3() {}
}

export const ogg = new OggConverter();
