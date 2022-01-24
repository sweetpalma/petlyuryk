import { sample } from 'lodash';
import { BotkitExtended } from '../types';
import { RESPONSE_AGRESSIVE_PISS } from '../strings';
import { regexPhrase, regexNamed } from '../utils';
import { isRouletteWinner } from './module-roulette';


const TRIGGER_PISS = [
	regexPhrase(regexNamed(/(?:тут )?(русня|росня|креол|русак|хуйло)/i)),
	regexPhrase(regexNamed(/струмінь/i)),
	regexPhrase(regexNamed(/посци/i)),
];


const RESPONSE_PISS = [
	...RESPONSE_AGRESSIVE_PISS,
];


const RESPONSE_PISS_IMMUNE = [
	'Він точно не креол.',
	'Його я не маю права чіпати.',
	'Переможців не судять!',
];


const RESPONSE_PISS_NICE_TRY = [
	'Охуєнно смішно.',
	'Ти справді думав що це спрацює?',
	'Мене так просто не обдурити.',
];


export default (controller: BotkitExtended) => {
	controller.hears(TRIGGER_PISS, 'message', async (bot, msg) => {
		const { recipientType, replyToMessageId, replyToUserId } = controller.adapter.getMessageMetadata(msg);
		if (replyToUserId && isRouletteWinner(controller, replyToUserId)) {
			await bot.say({
	    	text: sample(RESPONSE_PISS_IMMUNE)!,
	    });
			return;
		}
		if (recipientType === 'bot') {
			await bot.say({
	    	text: sample(RESPONSE_PISS_NICE_TRY)! + ' ' + sample(RESPONSE_PISS)!,
	    });
		} else {
			await bot.say({
				text: sample(RESPONSE_PISS)!,
				channelData: {
					replyToId: replyToMessageId,
				},
			});
		}
	});
};
