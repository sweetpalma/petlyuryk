/* eslint-disable no-console */
import { Controller } from './controller';
import { startTelegramBot } from './server';
import loadRegexp from './regexp';
import loadNeural from './neural';

const token = process.env.TELEGRAM_TOKEN;
if (!token) {
	console.error('No TELEGRAM_TOKEN provided.');
	process.exit(1);
}

(async () => {
	const controller = new Controller();
	loadRegexp(controller);
	loadNeural(controller);
	startTelegramBot(controller, token);
})();
