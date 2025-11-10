import {
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Result } from '~/shared';
import { SkipAuth, SkipRateLimiting } from '~/security';
import fse from 'fs-extra';
import path from 'path';
import { CLIENT_ROOT_PATH, TEMPORARY_FOLDER_NAME } from './constants';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @SkipAuth()
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files) {
      return Result.fail({
        message: 'No files uploaded',
      });
    }

    const data: string[] = [];
    for (const file of files) {
      const fileName = await this.fileService.saveToTemporary(file);
      data.push(fileName);
    }

    return Result.success({
      data,
    });
  }

  @SkipAuth()
  @SkipRateLimiting()
  @Get('client/:folderName/:fileName')
  async getClientFile(
    @Param() params: { folderName: string; fileName: string },
  ) {
    const { folderName, fileName } = params;
    const filePath = path.join(CLIENT_ROOT_PATH, folderName, fileName);

    if (!(await fse.exists(filePath))) {
      return Result.fail({
        message: `File ${fileName} not found`,
      });
    }

    const file = fse.createReadStream(filePath);
    return new StreamableFile(file);
  }
}
