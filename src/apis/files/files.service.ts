import { Injectable } from '@nestjs/common';
import { IFilesServiceUpload } from './interfaces/files-service.interface';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class FilesService {
  async upload({ files }: IFilesServiceUpload): Promise<string[]> {
    const waitedFiles = await Promise.all(files);

    const bucket = process.env.GCS_BUCKET;
    const storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEYFILENAME,
    }).bucket(bucket);

    const results = await Promise.all(
      waitedFiles.map(
        (el) =>
          new Promise<string>((resolve, reject) => {
            el.createReadStream()
              .pipe(storage.file(el.filename).createWriteStream())
              .on('finish', () => {
                resolve(
                  `https://storage.googleapis.com/${bucket}/${el.filename}`,
                );
              })
              .on('error', () => {
                reject('실패');
              });
          }),
      ),
    );
    return results;
  }
}
