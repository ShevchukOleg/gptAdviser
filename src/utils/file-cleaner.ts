import { unlink } from 'fs/promises';

export async function removeFile(filePath: string): Promise<void> {
  try {
    return await unlink(filePath);
  } catch (err) {
    console.log('Removing file error: ', err);
  }
}
