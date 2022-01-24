import { sample } from 'lodash';
import { BotkitMessage, BotkitConversation } from 'botkit';
import { BotkitExtended } from '../types';
import { regexPhrase, regexNamed } from '../utils';
import {
	INSULT_UKRAINIAN,
	RESPONSE_AGRESSIVE,
	RESPONSE_AGRESSIVE_CONTINUATION,
	RESPONSE_AGRESSIVE_FINALE,
} from '../strings';


const TRIGGER_ABOUT = [
	regexPhrase(regexNamed(/розкажи про себе/i)),
	regexPhrase(regexNamed(/хто ти\??/i)),
];


const TRIGGER_THANKS_DIALOG = [
	regexPhrase(/Молодець/i),
	regexPhrase(/Спасибі/i),
	regexPhrase(/Дякую/i),
];


const TRIGGER_THANKS_GENERAL = [
	regexPhrase(regexNamed(/(?:(ти|-) )?молодець/i)),
	regexPhrase(regexNamed(/спасибі/i)),
	regexPhrase(regexNamed(/дякую/i)),
];


const TRIGGER_AGRESSIVE_GENERAL = [
	...INSULT_UKRAINIAN.map(word => regexPhrase(`Петлюрику?,? (?:(ти|-) )?${word}`, 'i')),
	regexPhrase(/Пиздюрику?/i),
	regexPhrase(/Хуюрику?/i),
];


const TRIGGER_AGRESSIVE_DIALOG = [
	...INSULT_UKRAINIAN.map(word => regexPhrase(`ти ${word}`, 'i')),
	regexPhrase(/Пиздюрику?/i),
	regexPhrase(/Хуюрику?/i),
];


const RESPONSE_THANKS = [
	'Звертайся',
	'Завжди будь ласка',
	'Радий допомогти',
];


const RESPONSE_ABOUT = `
Я - Петлюрик, перший в світі бот-русофоб. Просто додай мене в групу і я буду робити наступне:

• Визначати російську мову та нещадно карати за неї.
• Аналізувати  валютний ринок ("Петлюрику, як там біток?").
• Грати в рулетку з креолами ("Петлюрику, рулетка").
• Славити Україну ("Петлюрику, слава Україні!").
• Нищівно критикувати ("Петлюрику, струмінь").

Маєте побажання та пропозиції? Мій автор готовий вас уважно вислухати: @nekodisaster.
`;


const isAdressedToBot = (controller: BotkitExtended, patterns: RegExp[]) => async (msg: BotkitMessage) => {
	const { recipientType } = controller.adapter.getMessageMetadata(msg);
	const matchedTriggers = patterns.filter(rgx => msg.text?.match(rgx));
	return recipientType === 'bot' && matchedTriggers.length > 0;
};


export default (controller: BotkitExtended) => {
	const DIALOG_AGRESSIVE = 'DIALOG_AGGRESSIVE';
	const dialogAgressive = new BotkitConversation(DIALOG_AGRESSIVE, controller);

	dialogAgressive.ask(sample(RESPONSE_AGRESSIVE)!, [], '');
	dialogAgressive.ask(sample(RESPONSE_AGRESSIVE_CONTINUATION)!, [], '');
	dialogAgressive.after(async (_, bot) => {
		await bot.say(sample(RESPONSE_AGRESSIVE_FINALE)!);
	});

	controller.addDialog(dialogAgressive);
	controller.interrupts(isAdressedToBot(controller, TRIGGER_AGRESSIVE_DIALOG), 'message', async (bot, msg) => {
		await bot.cancelAllDialogs();
		await bot.beginDialog(DIALOG_AGRESSIVE);
	});
	controller.interrupts(TRIGGER_AGRESSIVE_GENERAL, 'message', async (bot, msg) => {
		await bot.cancelAllDialogs();
		await bot.beginDialog(DIALOG_AGRESSIVE);
	});

	controller.interrupts(TRIGGER_ABOUT, 'message', async (bot, msg) => {
		await bot.say(RESPONSE_ABOUT);
	});

	controller.interrupts(isAdressedToBot(controller, TRIGGER_THANKS_DIALOG), 'message', async (bot, msg) => {
		await bot.say(sample(RESPONSE_THANKS)!);
	});
	controller.interrupts(TRIGGER_THANKS_GENERAL, 'message', async (bot, msg) => {
		await bot.say(sample(RESPONSE_THANKS)!);
	});
};
