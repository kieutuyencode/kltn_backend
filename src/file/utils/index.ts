import path from 'path';

export const isSameFileName = (fileA?: string, fileB?: string) => {
  if (!fileA || !fileB) {
    return false;
  }
  return path.basename(fileA) === path.basename(fileB);
};
