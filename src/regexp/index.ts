/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { sample } from 'lodash';
import UaResponseHostileShort from '~/data/responses/ua-hostile-short.json';
import { Controller } from '~/controller';
import { logger } from '~/logger';
import * as rgx from './utils';


/**
 * RegExp reply structure.
 */
type Reply = {
	intent: string;
	probability?: number;
	triggers: Array<RegExp>;
	responses: Array<string>;
};


/**
 * RegExp reply database.
 */
const replies: Array<Reply> = [

	// Glory to Ukraine:
	{
		intent: 'glory.capitalize',
		triggers: [
			rgx.matchPart(/україн[аиі]/), // case sensitive
		],
		responses: [
			'Україна пишеться з великої букви, синку.',
		],
	},
	{
		intent: 'glory.ukraine',
		triggers: [
			rgx.matchEnd(/Слава Україні/i),
		],
		responses: [
			'Героям Слава!',
		],
	},
	{
		intent: 'glory.nation',
		triggers: [
			rgx.matchEnd(/Слава Нації/i),
		],
		responses: [
			'Смерть ворогам!',
		],
	},
	{
		intent: 'glory.over',
		triggers: [
			rgx.matchFull(/Україна/i),
		],
		responses: [
			'Понад усе!',
		],
	},

	// Bandera:
	{
		intent: 'bandera.father',
		triggers: [
			rgx.matchFull(/батько наш - бандера/i),
			rgx.matchFull(/батько наш бандера/i),
		],
		responses: [
			'Україна - мати!',
		],
	},
	{
		intent: 'bandera.fight',
		triggers: [
			rgx.matchFull(/ми за україну/i),
		],
		responses: [
			'Будем воювати.',
		],
	},

	// Vinnytsia:
	{
		intent: 'vinnytsia',
		triggers: [
			rgx.matchPart(/вінн?иц(я|і|ю)/i),
			rgx.matchPart(/вінн?ицьк(а|і|ий)/i),
			rgx.matchPart(/вінн?ичан(и|ин|ка)/i),
		],
		responses: [
			'Вінниця – кращий зі світів.',
			'Чи є міста кращі за Вінницю?',
			'Вінниця — то любов і щастя.',
			'Вінниця — то центр світу.',
			'Вінниця - то травневий сонячний день, солодка вата і оргазм.',
			'Я знов плакав усю ніч від щастя, коли згадав що я з Вінниці.',
			'Боже, дякую що я у Вінниці - тянки течуть, бидло боїться.',
			'Вінниця - це божий дар Україні.',
			'Вінниця – новий Бабилон.',
			'Вінниця - четвертий Рим.',
		],
	},

	// Kherson:
	{
		intent: 'kherson',
		triggers: [
			rgx.matchPart(/херсон(ські|ці|ка|ець)/i),
			rgx.matchPart(/херсон(у|і)?/i),
		],
		responses: [
			'Херсон - це Україна.',
			'Херсон - місто-герой.',
			'Херсон - то любов і щастя.',
			'Херсон - батьківщина кавунів.',
			'Херсон - база.',
		],
	},

	// Kherson:
	{
		intent: 'kherson',
		triggers: [
			rgx.matchPart(/херсон/i),
		],
		responses: [
			'Херсон - це Україна.',
			'Херсон - місто-герой.',
			'Херсон - то любов і щастя.',
			'Херсон - батьківщина кавунів.',
			'Херсон - база.',
		],
	},

	{
		intent: 'chornobaivka',
		triggers: [
			rgx.matchPart(/чорнобаїв(ка|ку|ці)/i),
		],
		responses: [
			'Чорнобаївка - русні роз\'їбаївка.',
		],
	},

	// Belarus:
	{
		intent: 'belarus',
		triggers: [
			rgx.matchPart(/Жыве Беларусь/i),
			rgx.matchPart(/Живе Білорусь/i),
		],
		responses: [
			'Ще не вмерла.',
		],
	},

	// Russian warship go fuck yourself:
	{
		intent: 'warship',
		triggers: [
			rgx.matchFull(/рус(ь|с)кий во(є|е)нн(и|ы|ьі)й кораб(е)?ль/i),
		],
		responses: [
			'Йди нахуй!',
		],
	},

	// Russophobic:
	{
		intent: 'russophobia.short',
		triggers: [
			rgx.matchFull(/наша русофоб(і|и)я/i),
			rgx.matchFull(/русофоб(і|и)я/i),
		],
		responses: [
			'Недостатня.',
		],
	},
	{
		intent: 'russophobia.long',
		triggers: [
			rgx.matchPart(/русофоб(і|и)я/i),
		],
		responses: [
			'Друзі, наша русофобія недостатня.',
		],
	},

	// Insult:
	{
		intent: 'huyryk',
		triggers: [
			rgx.matchPart(/(Пиздюрику?),?/i),
			rgx.matchPart(/(Хуюрику?),?/i),
		],
		responses: [
			...UaResponseHostileShort,
		],
	},

	// Putin:
	{
		intent: 'putin.short',
		triggers: [
			rgx.matchFull(/(путин|путін)/i),
		],
		responses: [
			'Хуйло!',
		],
	},
	{
		intent: 'putin.long',
		triggers: [
			rgx.matchPart(/(путин|путін)/i),
		],
		responses: [
			'Путін - хуйло.',
		],
	},

	// Arestovych:
	{
		intent: 'arestovych',
		triggers: [
			rgx.matchPart(/п(и|і)здоболич/i),
			rgx.matchPart(/арестович/i),
		],
		responses: [
			'Арестович - малорос.',
			'Арестович - піздоболич.',
			'Арестович - лох.',
		],
	},

	// Yermak Emoji Reaction:
	{
		intent: 'yermak',
		triggers: [
			/^(\p{Emoji_Presentation}|\s){3,}$/gu,
		],
		responses: [
			'Єрмак, йди нахуй',
			'👍🖕',
		],
	},

	// Avakov:
	{
		intent: 'avakov',
		triggers: [
			rgx.matchPart(/аваков/i),
		],
		responses: [
			'Аваков - чорт.',
		],
	},

	// Yushchenko:
	{
		intent: 'yushchenko.short',
		triggers: [
			rgx.matchFull(/ющенк(о|а|у)/i),
		],
		responses: [
			'Так!',
		],
	},
	{
		intent: 'yushchenko.long',
		triggers: [
			rgx.matchPart(/ющенк(о|а|у)/i),
		],
		responses: [
			'Ющенко - так!',
		],
	},

	// Shrek:
	{
		intent: 'shrek',
		triggers: [
			rgx.matchPart(/шрек/i),
		],
		responses: [
			'Шрек - це любов.',
			'Шрек - це життя.',
			'Слава Шреку!',
		],
	},

	// Retarded jokes:
	{
		intent: 'joke.a',
		triggers: [
			rgx.matchFull(/а/i),
		],
		responses: [
			'Хуй на',
		],
	},
	{
		intent: 'joke.da',
		triggers: [
			rgx.matchEnd(/да/i),
		],
		responses: [
			'Підора єда',
			'Хуй на',
			'Пізда',
		],
	},
	{
		intent: 'joke.ni.greetings',
		probability: 0.2,
		triggers: [ rgx.matchFull(/ні/i) ],
		responses: [
			'Hello! (Чи то було українською?)',
			'Привіт.',
		],
	},
	{
		intent: 'joke.ni.other',
		triggers: [ rgx.matchEnd(/мені/i) ],
		responses: [
			'Рука в гавні.',
			'Рука в гімні.',
			'Рука в гівні.',
		],
	},
	{
		intent: 'joke.chuesh',
		triggers: [
			rgx.matchEnd(/чуєш/i),
		],
		responses: [
			'На хую переночуєш.',
		],
	},
	{
		intent: 'joke.ne',
		triggers: [
			rgx.matchEnd(/не/i),
			rgx.matchEnd(/нє/i),
		],
		responses: [
			'Рука в гавнє.',
		],
	},
	{
		intent: 'joke.net',
		triggers: [
			rgx.matchEnd(/(нєт|нет)/i),
		],
		responses: [
			'Підора атвєт.',
		],
	},
	{
		intent: 'joke.ya',
		triggers: [
			rgx.matchFull(/я/i),
		],
		responses: [
			'Головка від хуя.',
		],
	},
	{
		intent: 'joke.privet',
		triggers: [
			rgx.matchFull(/пр(і|и)в(є|е)т/i),
		],
		responses: [
			'Пукни в пакєт.',
		],
	},


];


/**
 * Petlyuryk RegExp utilities.
 */
export * from './utils';


/**
 * Petlyuryk RegExp processor module.
 */
export default async (controller: Controller, testMode = false) => {
	logger.info('regexp:ready');
	controller.addHandler(async (request) => {
		const { id, text } = request;
		for (const reply of replies) {
			for (const trigger of reply.triggers) {
				if (!text.match(trigger)) {
					continue;
				}
				if (!testMode && reply.probability && Math.random() > reply.probability) {
					continue;
				}
				const randomResponse = sample(reply.responses);
				return (!randomResponse) ? undefined : {
					intent: `regexp.${reply.intent}`,
					text: randomResponse,
					replyTo: {
						messageId: id,
					},
				};
			}
		}
	});
};
