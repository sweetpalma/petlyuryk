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


const TRIGGER_ROULETTE_WHOIS = [
	regexPhrase(regexNamed(/хто (не креол|переможець|українець)\??/i)),
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


export const setRouletteWinner = (controller: BotkitExtended, user: null | { name: string, id: string }) => {
	if (user) {
		controller.adapter.memory.setGlobal('rouletteWinnerName', user.name);
		controller.adapter.memory.setGlobal('rouletteWinnerId', user.id);
	} else {
		controller.adapter.memory.setGlobal('rouletteWinnerName', null);
		controller.adapter.memory.setGlobal('rouletteWinnerId', null);
	}
};


export const getRouletteWinner = (controller: BotkitExtended) => {
	const name = controller.adapter.memory.getGlobal('rouletteWinnerName', null);
	const id = controller.adapter.memory.getGlobal('rouletteWinnerId', null);
	return (typeof name === 'string' && typeof id === 'string') ? { name, id } : null;
};


export const isRouletteWinner = (controller: BotkitExtended, userId: string) => {
	return controller.adapter.memory.getGlobal('rouletteWinnerId', null) === userId;
};


export default (controller: BotkitExtended) => {
	controller.hears(TRIGGER_ROULETTE_WHOIS, 'message', async (bot, msg) => {
		const winner = getRouletteWinner(controller);
		if (winner !== null) {
			await bot.say(`На даний момент єдиний справжній українець це @${winner.name}.`);
		} else {
			await bot.say('Та ніхто, повен чат креолів.');
		}
	});
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
			setRouletteWinner(controller, msg.incoming_message.from);
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
			if (isRouletteWinner(controller, msg.incoming_message.from.id)) {
				setRouletteWinner(controller, null);
			}
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
