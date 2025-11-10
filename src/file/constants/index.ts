import path from 'path';

export * from './folder.constant';

export const CLIENT_ROOT_PATH = path.join(
  process.cwd(),
  'src',
  'resources',
  'clients',
);

export const TEMPORARY_FOLDER_NAME = 'temporary';

// export const MAX_SIZE = 100; // 100 MB
export const MAX_SIZE = 10; // 10 MB

export const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
  '.webp',
];

export const VIDEO_EXTENSIONS = [
  '.mp4',
  '.avi',
  '.mkv',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.3gp',
];

// export const FILE_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];
export const FILE_EXTENSIONS = [...IMAGE_EXTENSIONS];
