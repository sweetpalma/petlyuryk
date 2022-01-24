import { Botkit, BotkitConversation } from 'botkit';
import { regexPhrase } from '../utils';

const TRIGGER_GLORY = (
	regexPhrase(/Слава Україні/i)
);


const TRIGGER_DEATH = (
	regexPhrase(/Слава нації/i)
);


const RESPONSE_GLORY = (
	'Героям слава!'
);


const RESPONSE_DEATH = (
	'Смерть ворогам!'
);


const RESPONSE_DEATH_FAIL = (
	'Ти повинен був відповісти "Слава Нації!", йолопе!'
);


export default (controller: Botkit) => {
	const DIALOG_GLORY = 'DIALOG_GLORY';
	const dialogGlory = new BotkitConversation(DIALOG_GLORY, controller);
	dialogGlory.ask(RESPONSE_GLORY, async (answer, convo, bot) => {
		if (answer.match(TRIGGER_DEATH)) {
			await bot.say(RESPONSE_DEATH);
		} else {
			await bot.say(RESPONSE_DEATH_FAIL);
		}
	}, '_');

	controller.addDialog(dialogGlory);
	controller.hears(TRIGGER_GLORY, 'message', async (bot, msg) => {
		await bot.beginDialog(DIALOG_GLORY);
	});
	controller.hears(TRIGGER_DEATH, 'message', async (bot, msg) => {
		await bot.say(RESPONSE_DEATH);
	});
};
