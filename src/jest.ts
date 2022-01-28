/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from './logger';
jest.spyOn(logger, 'info').mockImplementation(() => jest.fn() as any);

