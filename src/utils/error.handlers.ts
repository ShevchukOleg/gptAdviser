import { ErrorMessages } from '../constants/constants';

export function runtimeError(message: ErrorMessages | string): never {
  if (message === '') {
    throw new Error(message);
  }
  throw new Error('An unknown error occurred');
}
