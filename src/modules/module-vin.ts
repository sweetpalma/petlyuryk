import { sample } from 'lodash';
import { Botkit } from 'botkit';


const TRIGGER_VIN = (
	/(^|\s)вінни(ц|ч)/i
);


const RESPONSE_VIN = [
	'Вінниця – кращий зі світів.',
	'Чи є міста кращі за Вінницю?',
	'Я знов плакав усю ніч від щастя, коли згадав що я з Вінниці.',
	'Боже, дякую що я у Вінниці - тянки течуть, бидло боїться.',
	'Вінниця - це божий дар Україні.',
	'Вінниця – новий Бабилон.',
	'Вінниця - четветрий Рим.',
];

export default (controller: Botkit) => {
	controller.hears(TRIGGER_VIN, 'message', async (bot, msg) => {
		await bot.say(sample(RESPONSE_VIN)!);
	});
};
