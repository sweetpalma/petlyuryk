/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { sample } from 'lodash';
import { neuralModule } from '..';
import { Store } from '../../store';
import UaCommon from '../../data/common/ua.json';
import UaResponseHostileShort from '../../data/responses/ua-hostile-short.json';
import UaResponseHostileGeneric from '../../data/responses/ua-hostile-generic.json';
import UaResponseHostilePiss from '../../data/responses/ua-hostile-piss.json';
import UaPraises from '../../data/praises/ua.json';
import UaInsults from '../../data/insults/ua.json';


const niceTry = [
	'Охуєнно смішно.',
	'Ти справді думав що це спрацює?',
	'Мене так просто не обдурити.',
];


const store = (
	new Store()
);


export default neuralModule({
	name: 'Ukrainian Core',
	locale: 'uk-UA',
	entities: {
	  insult: {
	  	options: Object.fromEntries(UaInsults.map(word => [ word, [ word ] ])),
	  },
	  praise: {
	  	options: Object.fromEntries(UaPraises.map(word => [ word, [ word ] ])),
	  },
	},
	handlers: {
		'statistics': [
			async (_nlp, response) => {
				const chatId = response.activity.conversation.sourceEvent.chat.id;
				const pissInfo = await store.piss.readCount(chatId);
				const chatInfo = await store.chat.read(chatId);
				if (chatInfo) {
					const { messagesProcessed, messagesResponded, title } = chatInfo;
					const chatName = title || response.from.firstName || response.from.userName;
					response.answer = `У чаті ${chatName} було оброблено ${messagesProcessed} повідомлень та надіслано ${messagesResponded} відповідей. Струменів відправлено: ${pissInfo}.`;
				}
			},
		],
		'piss': [
			async (_nlp, response) => {
				const { conversation } = response.activity;
				await store.piss.bumpCount(conversation.sourceEvent.chat.id);
				if (conversation.sourceEvent.replyTo) {
					conversation.replyTo = conversation.sourceEvent.replyTo.messageId;
				}
				if (conversation.sourceEvent.replyTo?.isAdressedToBot) {
					conversation.replyTo = conversation.sourceEvent.id;
					response.answer = `${sample(niceTry)} ${response.answer}`;
				}
			},
		],
		'insult': [
			async (_nlp, response) => {
				if (response.score < 0.95) {
					response.answer = '';
				}
			},
		],
		'praise': [
			async (_nlp, response) => {
				if (response.score < 0.95) {
					response.answer = '';
				}
			},
		],
		'chatter.who.me': [
			async (_nlp, response) => {
				const { firstName, userName } = response.from;
				const randomFraction = Math.random();
				if (randomFraction > 0.2) {
					response.answer = `Ти - ${firstName || userName || 'хуй знає хто'}.`;
				} else {
					response.answer = 'Ти - лох.';
				}
			},
		],
	},
	data: [
		{
			intent: 'None',
			utterances: UaCommon,
			answers: [],
		},
		{
			intent: 'statistics',
			utterances: [
				'стата',
			],
			answers: [
				// processed by handler
			],
		},
		{
			intent: 'insult',
			utterances: [
				...UaResponseHostileShort,
				...UaInsults.map(word => `ти ${word}`),
				...UaInsults.map(word => `${word}`),
			],
			answers: [
				...UaResponseHostileGeneric,
				...UaResponseHostilePiss,
			],
		},
		{
			intent: 'praise',
			utterances: [
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
			intent: 'piss',
			utterances: [
				'тут русак',
				'тут русня',
				'тут креол',
				'додай сечі',
				'піддай газку',
				'водограй',
				'промінь',
				'струмінь',
				'струменя',
				'живчик',
			],
			answers: [
				...UaResponseHostilePiss,
			],
		},
		{
			intent: 'chatter.hello',
			utterances: [
				'вітаю',
				'здоров',
				'привіт',
				'доров',
				'даров',
				'добрий ранок',
				'добрий вечір',
				'добрий день',
			],
			answers: [
				'Привіт.',
			],
		},
		{
			intent: 'chatter.bye',
			utterances: [
				'бувай',
				'до побачення',
				'всього доброго',
				'надобраніч',
				'добраніч',
			],
			answers: [
				'Бувай.',
			],
		},
		{
			intent: 'chatter.howdy',
			utterances: [
				'справи',
				'ся маєш',
				'чим займаєшся',
				'робиш',
			],
			answers: [
				'HTTP 1.1 200 OK',
				'Душу русню.',
				'Займаюсь важливими справами.',
				'Продовжую існувати.',
				'Перекидую байти.',
				'Розважаю людей.',
			],
		},
		{
			intent: 'chatter.thanks',
			utterances: [
				'Тисну руку',
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
			intent: 'chatter.right',
			utterances: [
				'ага',
				'так',
				'так',
				'точно',
				'авжеж',
				'правда',
				'згоден',
				'все так',
				'ти правий',
				'правий у всьому',
				'зрозуміло',
				'забий',
				'ясно',
			],
			answers: [
				'Ага.',
			],
		},
		{
			intent: 'chatter.wrong',
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
			'intent': 'chatter.who.you',
			'utterances': [
				'ти бот',
				'ти робот',
				'ти хто',
				'а ти хто',
				'розкажи про себе',
				'хто ти такий',
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
			'intent': 'chatter.who.me',
			'utterances': [
				'хто я',
			],
			'answers': [
				// processed by handler
			],
		},
		{
			intent: 'chatter.who.creator',
			utterances: [
				'хто тебе написав',
				'хто тебе розробив',
				'хто тебе створив',
				'хто твій автор',
			],
			answers: [
				'Я був народжений у @hrinovyny, мій автор - @nekodisaster.',
			],
		},
		{
			intent: 'chatter.capabilities',
			utterances: [
				'здатен',
				'можеш',
				'вмієш',
			],
			answers: [
				'Послати тебе нахуй.',
				'Запостити крінж.',
				'Запостити базу.',
				'Покарати русню.',
				'Послати струмінь.',
			],
		},
		{
			intent: 'chatter.source',
			utterances: [
				'нюдси',
				'нюдеси',
				'код',
			],
			answers: [
				'https://github.com/sweetpalma/petlyuryk',
			],
		},
	],
});

