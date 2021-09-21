import { join } from 'path';
import { sample } from 'lodash';
import { createReadStream } from 'fs';
import { regexPhrase, regexNamed } from '../utils';
import { BotkitExtended } from '../types';



const TRIGGER_ROULETTE = [
	regexPhrase(regexNamed(/високі ставки/i)),
	regexPhrase(regexNamed(/крутанемо рулетку/i)),
	regexPhrase(regexNamed(/зіграємо в рулетку/i)),
	regexPhrase(regexNamed(/рулетка/i)),
];


const RESPONSE_ROULETTE_COOLDOWN = [
	'Ще не час',
	'Колода заряджається, приходь пізніше',
	'Казино ще не готове',
];


const ROULETTE_WIN_RATE = (
	0.2
);


const ROULETTE_COOLDOWN = (
	1000 * 60 * 15 // 15 minutes
);


export default (controller: BotkitExtended) => {
	controller.hears(TRIGGER_ROULETTE, 'message', async (bot, msg) => {
		const { memory } = controller.adapter;

		// Check the cooldown:
		if (Date.now() < memory.getUserMetadata(msg.user, 'rouletteDate', 0) + ROULETTE_COOLDOWN) {
			await bot.say(sample(RESPONSE_ROULETTE_COOLDOWN)!);
			return;
		}

		// Run the roulette:
		const isWinner = Math.random() < ROULETTE_WIN_RATE;
		if (isWinner) {
			const rouletteWins = memory.getUserMetadata(msg.user, 'rouletteWins', 0);
			memory.setUserMetadata(msg.user, 'rouletteWins', rouletteWins + 1);
			memory.setUserMetadata(msg.user, 'rouletteDate', Date.now());
			await bot.say({
				attachments: [
					{
						contentType: 'sticker',
						content: createReadStream(join(__dirname, '..', 'assets', 'roulette-win.webp')),
					},
				],
			});
		} else {
			const rouletteFails = memory.getUserMetadata(msg.user, 'rouletteFails', 0);
			memory.setUserMetadata(msg.user, 'rouletteFails', rouletteFails + 1);
			memory.setUserMetadata(msg.user, 'rouletteDate', Date.now());
			await bot.say({
				attachments: [
					{
						contentType: 'sticker',
						content: createReadStream(join(__dirname, '..', 'assets', 'roulette-fail.webp')),
					},
				],
			});
		}
	});
};
