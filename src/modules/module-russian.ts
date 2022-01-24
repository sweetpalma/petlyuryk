import franc from 'franc';
import { sample } from 'lodash';
import { Botkit, BotkitMessage, BotkitConversation } from 'botkit';
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

	const triggerRussian = async (msg: BotkitMessage) => {
		const minLength = 12;
		const francOpts = { minLength, only: [ 'ukr', 'rus' ] };
		const uaLetters = /[іїєґ]/i;
		const ruLetters = /[ыэъё]/i;
		if (isRouletteWinner(controller, msg.user)) {
			return false;
		}
		if (!msg.text) {
			return false;
		}
		if (msg.text.length >= minLength) {
			return msg.text.match(ruLetters) !== null || (!msg.text.match(uaLetters) && franc(msg.text, francOpts) === 'rus');
		} else {
			return msg.text.match(ruLetters) !== null;
		}
	};

	controller.addDialog(dialogRussian);
	controller.interrupts(triggerRussian, 'message', async (bot, message) => {
		await bot.cancelAllDialogs();
  	await bot.beginDialog(DIALOG_RUSSIAN);
	});
};
