import { BadRequestException, Injectable } from '@nestjs/common';
import fse from 'fs-extra';
import path from 'path';
import {
  MAX_SIZE,
  FILE_EXTENSIONS,
  CLIENT_ROOT_PATH,
  TEMPORARY_FOLDER_NAME,
} from './constants';
import { dayUTC } from '~/date-time';

@Injectable()
export class FileService {
  checkExtension({
    fileName,
    allowedExtensions,
  }: {
    fileName: string;
    allowedExtensions: string[];
  }) {
    const extension = path.extname(fileName);
    if (
      !allowedExtensions.find(
        (ext) => ext.toLowerCase() === extension.toLowerCase(),
      )
    ) {
      throw new BadRequestException(
        `File extension '${extension}' is not allowed. Allowed extensions are: ${allowedExtensions.join(
          ', ',
        )}`,
      );
    }
  }

  checkIsValid({
    file,
    maxSize,
    allowedExtensions,
  }: {
    file: Express.Multer.File;
    maxSize: number;
    allowedExtensions: string[];
  }) {
    if (file.size > maxSize * 1024 * 1024) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${maxSize} MB`,
      );
    }
    this.checkExtension({ fileName: file.originalname, allowedExtensions });
  }

  async save({
    file,
    fileNameWithoutExtension,
    folderName,
  }: {
    file: Express.Multer.File;
    fileNameWithoutExtension: string;
    folderName: string;
  }) {
    this.checkIsValid({
      file,
      maxSize: MAX_SIZE,
      allowedExtensions: FILE_EXTENSIONS,
    });

    const folderPath = path.join(CLIENT_ROOT_PATH, folderName);
    await fse.ensureDir(folderPath);

    const fileName = `${fileNameWithoutExtension || crypto.randomUUID()}${path
      .extname(file.originalname)
      .toLowerCase()}`;
    const filePath = path.join(folderPath, fileName);

    await fse.outputFile(filePath, file.buffer);

    return fileName;
  }

  async saveToTemporary(file: Express.Multer.File) {
    return await this.save({
      file,
      fileNameWithoutExtension: `${crypto.randomUUID()}_${dayUTC().unix()}`,
      folderName: TEMPORARY_FOLDER_NAME,
    });
  }

  async delete(filePath?: string) {
    if (!filePath) {
      return false;
    }

    filePath = path.join(CLIENT_ROOT_PATH, filePath);
    if (await fse.exists(filePath)) {
      await fse.unlink(filePath);
      return true;
    }

    return false;
  }

  async move({
    fileName,
    destinationFileNameWithoutExtension,
    sourceFolder,
    destinationFolder,
  }: {
    fileName: string;
    destinationFileNameWithoutExtension: string;
    sourceFolder: string;
    destinationFolder: string;
  }) {
    const sourcePath = path.join(CLIENT_ROOT_PATH, sourceFolder, fileName);
    const destinationPath = path.join(CLIENT_ROOT_PATH, destinationFolder);

    if (!(await fse.exists(sourcePath))) {
      throw new BadRequestException('File does not exist');
    }

    await fse.ensureDir(destinationPath);

    const destinationFileName = `${destinationFileNameWithoutExtension}${path
      .extname(fileName)
      .toLowerCase()}`;
    const destinationFilePath = path.join(destinationPath, destinationFileName);

    if (await fse.exists(destinationFilePath)) {
      throw new BadRequestException(
        'File already exists in the destination folder',
      );
    }

    await fse.rename(sourcePath, destinationFilePath);

    return path.join(destinationFolder, destinationFileName);
  }

  async moveFromTemporary({
    fileName,
    destinationFolder,
  }: {
    fileName: string;
    destinationFolder: string;
  }) {
    return await this.move({
      fileName,
      destinationFileNameWithoutExtension: crypto.randomUUID(),
      sourceFolder: TEMPORARY_FOLDER_NAME,
      destinationFolder,
    });
  }

  async moveFromTemporaryAndDeleteOldFile({
    fileName,
    destinationFolder,
    oldFilePath,
  }: {
    fileName: string;
    destinationFolder: string;
    oldFilePath?: string;
  }) {
    const newFilePath = await this.moveFromTemporary({
      fileName,
      destinationFolder,
    });

    await this.delete(oldFilePath);

    return newFilePath;
  }

  async cleanTemporaryFiles(hours = 1) {
    const folderPath = path.join(CLIENT_ROOT_PATH, TEMPORARY_FOLDER_NAME);
    if (!(await fse.exists(folderPath))) return;

    const files = await fse.readdir(folderPath);

    for (const file of files) {
      const timestamp = path.basename(file, path.extname(file)).split('_')[1];

      if (
        !timestamp ||
        dayUTC(Number(timestamp) * 1000).unix() <
          dayUTC().subtract(hours, 'hours').unix()
      ) {
        await fse.unlink(path.join(folderPath, file));
      }
    }
  }
}
