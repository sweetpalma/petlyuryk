import { sample } from 'lodash';
import { BotkitExtended } from '../types';
import { regexPhrase } from '../utils';


const TRIGGER_NI = (
	regexPhrase(/ні$/i)
);


const TRIGGER_NE = (
	regexPhrase(/нє$/i)
);


const RESPONSE_NI = [
	'Рука в гавні',
	'Привіт',
];



const RESPONSE_NE = (
	'Рука в гавнє'
);


export default (controller: BotkitExtended) => {
	controller.hears(TRIGGER_NI, 'message', async (bot, msg) => {
		await bot.say(sample(RESPONSE_NI)!);
	});
	controller.hears(TRIGGER_NE, 'message', async (bot, msg) => {
		await bot.say(RESPONSE_NE);
	});
};
