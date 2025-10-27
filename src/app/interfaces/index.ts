import { Result } from '~/shared';

export interface IException extends Error {
  response?: Result;
}
