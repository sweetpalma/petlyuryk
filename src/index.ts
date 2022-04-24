/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
/* eslint-disable no-console */
import { Controller } from './controller';
import { startTelegramBot } from './bot';
import { startServer } from './rest';
import loadNeural from './neural';
import loadRegexp from './regexp';
import { Store } from './store';


// Must be provided by user.
const { PETLYURYK_TELEGRAM_TOKEN } = process.env;
if (!PETLYURYK_TELEGRAM_TOKEN) {
	console.error('No PETLYURYK_TELEGRAM_TOKEN provided.');
	process.exit(1);
}


// Must be provided by Docker Compose.
const { PETLYURYK_REDIS_HOST, PETLYURYK_REDIS_PORT } = process.env;
if (!PETLYURYK_REDIS_HOST || !PETLYURYK_REDIS_PORT) {
	console.error('No PETLYURYK_REDIS_HOST or PETLYURYK_REDIS_PORT provided.');
	process.exit(1);
}


// Must be provided by Docker Compose.
const { PETLYURYK_STATS_PORT } = process.env;
if (!PETLYURYK_STATS_PORT) {
	console.error('No PETLYURYK_STATS_PORT provided.');
	process.exit(1);
}


// Russian warship, go fuck yourself.
(async () => {
	try {
		const controller = new Controller();
		await Store.connect(`redis://${PETLYURYK_REDIS_HOST}:${PETLYURYK_REDIS_PORT}`);
		await loadRegexp(controller);
		await loadNeural(controller);
		await startTelegramBot(controller, PETLYURYK_TELEGRAM_TOKEN);
		await startServer(parseInt(PETLYURYK_STATS_PORT));
	} catch (error) {
		console.error('Failed to launch Petlyuryk.');
		console.error(error);
		process.exit(1);
	}
})();
