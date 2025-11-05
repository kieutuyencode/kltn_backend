import { LogTag } from '../constants';

export const createLogMessage = (message: string, tag?: LogTag) => {
  return tag ? `[${tag}]: ${message}` : message;
};
