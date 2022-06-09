/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { join } from 'path';
import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { routerChat } from './rest-chat';
import { routerMessage } from './rest-message';
import { logger } from '../logger';


/**
 * Express: Error handling middleware.
 */
export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
	const error = err.message || err.toString();
	const stack = err.stack?.split('\n').map((t: string) => t.trim());
	res.status(500).json({ error, stack });
	logger.error('rest:error', { error, stack });
	next(err);
};


/**
 * Express: Generic query parser for Redis Search.
 */
export const parseQuery = ({ query }: Request) => {
	const limit = query.limit ? parseInt(query.limit as string) : 10;
	const offset = query.offset ? parseInt(query.offset as string) : 0;
	const search = query.search ? query.search as string : '*';
	return { offset, limit, search };
};


/**
 * Start a new Express instance providing bot usage statistics.
 */
export const startServer = async (port: number) => new Promise<void>(resolve => {
	const app = express();
	app.use('/api/chats', routerChat);
	app.use('/api/messages', routerMessage);
	app.use(express.static(join(__dirname, '..', '..', 'public')));
	app.use(handleError);
	app.listen(port, () => {
		logger.info('rest:ready', { port });
		resolve();
	});
});
