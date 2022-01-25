import franc from 'franc';
import { sample } from 'lodash';
import { Botkit, BotkitMessage, BotkitConversation } from 'botkit';
import { logger } from '../logger';
import { isRouletteWinner } from './module-roulette';
import {
	RESPONSE_AGRESSIVE_CONTINUATION,
	RESPONSE_AGRESSIVE_RUSSIAN,
	RESPONSE_AGRESSIVE_FINALE,
} from '../strings';


export default (controller: Botkit) => {
	const DIALOG_RUSSIAN = 'DIALOG_RUSSIAN';
	const dialogRussian = new BotkitConversation(DIALOG_RUSSIAN, controller);

	dialogRussian.ask({ text: () => sample(RESPONSE_AGRESSIVE_RUSSIAN)! }, [], '');
	dialogRussian.ask({ text: () => sample(RESPONSE_AGRESSIVE_CONTINUATION)! }, [], '');
	dialogRussian.after(async (_, bot) => {
		await bot.say(sample(RESPONSE_AGRESSIVE_FINALE)!);
	});

	const triggerRussian = async ({ text, user }: BotkitMessage) => {
		const minLength = 12;
		const francOpts = { minLength, only: [ 'ukr', 'rus' ] };
		const uaLetters = /[іїєґ]/i;
		const ruLetters = /[ыэъё]/i;
		if (isRouletteWinner(controller, user)) {
			return false;
		}
		if (!text) {
			return false;
		}
		if (text.length >= minLength) {
			const rates = franc.all(text, francOpts);
			const [ _codeUa, rateUa ] = rates.find(([ code ]) => code === 'ukr')!;
			const [ _codeRu, rateRu ] = rates.find(([ code ]) => code === 'rus')!;
			const isRussian = text.match(ruLetters) !== null || (!text.match(uaLetters) && rateRu > 0.99 && rateUa < 0.9);
			if (isRussian) logger.info('russian:franc', { text, rateUa, rateRu, isRussian });
			return isRussian;
		} else {
			const isRussian = text.match(ruLetters) !== null;
			if (isRussian) logger.info('russian:simple', { text, isRussian });
			return isRussian;
		}
	};

	controller.addDialog(dialogRussian);
	controller.interrupts(triggerRussian, 'message', async (bot, msg) => {
		await bot.cancelAllDialogs();
  	await bot.beginDialog(DIALOG_RUSSIAN);
	});
};
