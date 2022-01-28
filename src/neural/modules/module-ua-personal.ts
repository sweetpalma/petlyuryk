import UaResponseHostileGeneric from '../../knowledge/ua-response-hostile-generic.json';
import UaResponseHostilePiss from '../../knowledge/ua-response-hostile-piss.json';
import UaInsults from '../../knowledge/ua-insults.json';
import UaPraises from '../../knowledge/ua-praises.json';


export const handlers: PetlyurykNeuralHandlerMap = {
	'personal.insult': [
		async (_nlp, response) => {
			if (response.score < 1) {
				response.answer = '';
			}
		},
	],
	'personal.who.me': [
		async (_nlp, response) => {
			const { firstName, userName } = response.from;
			response.answer = `Ти - ${firstName || userName || 'хуй знає хто'}.`;
		},
	],
};


export const corpus: PetlyurykNeuralCorpus = {
	name: 'Corpus Ukrainian Personal',
	locale: 'uk-UA',
	entities: {
	  insult: {
	  	options: Object.fromEntries(UaInsults.map(word => [ word, [ word ] ])),
	  },
	},
	data: [
		/* eslint-disable @typescript-eslint/no-explicit-any */
		{
			intent: 'personal.insult',
			utterances: [
				...UaPraises.map(word => `ти не ${word}`),
				...UaInsults.map(word => `ти ${word}`),
				...UaInsults.map(word => `${word}`),
			],
			answers: [
				({ answer: 'Батя твій {{insult}}', opts: '!!insult' } as any),
				...UaResponseHostileGeneric,
				...UaResponseHostilePiss,
			],
		},
		/* eslint-enable @typescript-eslint/no-explicit-any */
		{
			intent: 'personal.praise',
			utterances: [
				...UaInsults.map(word => `ти не ${word}`),
				...UaPraises.map(word => `ти ${word}`),
				...UaPraises.map(word => `${word}`),
			],
			answers: [
				// 'Мені дуже приємно чути подібне.',
				// 'Дякую що зігріваєте мої електрони теплом свого серця.',
				'Це так мило.',
				'Хоч хтось мене цінує.',
				'* червоніє *',
			],
		},
		{
			'intent': 'personal.who.you',
			'utterances': [
				'ти бот',
				'розкажи про себе',
				'я хочу знати більше про тебе',
				'опиши себе',
				'хто ти є',
				'хто ти',
			],
			'answers': [
				'Мене звати Петлюрик.',
				'Я - страшна кара російськомовній заразі.',
				'Я - караючий струмінь українського народу.',
				'Я - кібернетичний захистник України.',
				'Я - справжній вінничанин.',
			],
		},
		{
			'intent': 'personal.who.me',
			'utterances': [
				'хто я',
			],
			'answers': [
				// processed by handler
			],
		},
		{
			'intent': 'personal.hello',
			'utterances': [
				'здоров',
				'привіт',
				'добрий ранок',
				'добрий вечір',
				'добрий день',
				'вітаю',
			],
			'answers': [
				'Привіт.',
			],
		},
		{
			'intent': 'personal.bye',
			'utterances': [
				'бувай',
				'до побачення',
				'всього доброго',
				'надобраніч',
				'добраніч',
			],
			'answers': [
				'Бувай.',
			],
		},
		{
			intent: 'personal.thanks',
			utterances: [
				'Спасибі',
				'Дякую',
			],
			answers: [
				'Радий допомогти.',
				'Будь ласка.',
				'Звертайся.',
			],
		},
		{
			intent: 'personal.wrong',
			utterances: [
				'неправда',
				'ти всрався',
				'ти обісрався',
				'ти помилився',
				'ти неправий',
			],
			answers: [
				'Сорян.',
				'Перепрошую.',
				'Вибачте.',
			],
		},
		{
			intent: 'personal.right',
			utterances: [
				'ага',
				'точно',
				'правда',
				'згоден',
				'все так',
				'ти правий',
				'правий у всьому',
			],
			answers: [
				'Ага.',
				'По факту.',
				'Я знаю.',
			],
		},
		{
			intent: 'personal.love',
			utterances: [
				'вийди за мене',
				'одружися на мені',
				'тебе люблю',
				'тебе кохаю',
				'ти сексі',
			],
			answers: [
				'&#60;3',
			],
		},
		// {
		// 	'intent': 'ua.personal.greetings.howareyou',
		// 	'utterances': [
		// 		'як ти',
		// 		'шо ти',
		// 	],
		// 	'answers': [
		// 		'HTTP 1.1 200 OK',
		// 		'Продовжую існувати.',
		// 		'Потихеньку.',
		// 	],
		// },
		{
			'intent': 'personal.status',
			'utterances': [
				'чим займаєшся',
				'робиш',
			],
			'answers': [
				'Душу русню.',
				'Займаюсь важливими справами.',
				'Продовжую існувати.',
				'Перекидую байти.',
				'Розважаю людей.',
			],
		},
	],
};
