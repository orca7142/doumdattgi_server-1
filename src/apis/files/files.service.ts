import { Injectable } from '@nestjs/common';
import { IFilesServiceUpload } from './interfaces/files-service.interface';
import { Storage } from '@google-cloud/storage';

// 사진 업로드
@Injectable()
export class FilesService {
  async upload({ files }: IFilesServiceUpload): Promise<string[]> {
    console.log(files);

    const waitedFiles = await Promise.all(files);
    console.log(waitedFiles);

    const bucket = 'doumdattgi-storage';
    const storage = new Storage({
      projectId: 'doumdattgi-server',
      keyFilename: 'gcp-file-storage.json',
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
    console.log('파일 전송이 완료되었습니다.');
    console.log(results);
    return results;
  }
}
