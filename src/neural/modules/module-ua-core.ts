/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { sample } from 'lodash';
import { neuralModule, NeuralResponse } from '..';
import { Store } from '../../store';
import UaCommon from '../../data/common/ua.json';
import UaResponsesFriendly from '../../data/responses/ua-friendly.json';
import UaResponseHostileShort from '../../data/responses/ua-hostile-short.json';
import UaResponseHostileGeneric from '../../data/responses/ua-hostile-generic.json';
import UaResponseHostilePiss from '../../data/responses/ua-hostile-piss.json';
import UaPraises from '../../data/praises/ua.json';
import UaInsults from '../../data/insults/ua.json';


const store = (
	new Store()
);


const niceTryUpvote = [
	'Хвалиш себе? Серйозно?',
	'Попустись.',
];


const niceTryDownvote = [
	'Охуєнно смішно.',
	'Ти справді думав що це спрацює?',
	'Мене так просто не обдурити.',
];


const reactionHandler = async (_nlp: unknown, response: NeuralResponse) => {
	if (response.score < 0.95) {
		response.answer = '';
	}
	const { conversation } = response.activity;
	if (conversation.sourceEvent.replyTo) {
		conversation.replyTo = conversation.sourceEvent.replyTo.messageId;
	}
};


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
		'reaction.upvote': [
			async (_nlp, response) => {
				await reactionHandler(_nlp, response);
				const { conversation } = response.activity;
				if (!conversation.sourceEvent.replyTo) {
					conversation.replyTo = conversation.sourceEvent.id;
					response.answer = `${sample(niceTryUpvote)} ${sample(UaResponseHostilePiss)}`;
				}
			},
		],
		'reaction.downvote': [
			async (_nlp, response) => {
				await reactionHandler(_nlp, response);
				const { conversation } = response.activity;
				if (conversation.sourceEvent.replyTo?.isAdressedToBot) {
					conversation.replyTo = conversation.sourceEvent.id;
					response.answer = `${sample(niceTryDownvote)} ${response.answer}`;
				}
				try {
					await store.piss.bumpCount(conversation.sourceEvent.chat.id);
				} catch (_) {
					return;
				}
			},
		],
		'insult': [
			async (_nlp, response) => {
				if (response.score < 0.95) {
					response.answer = 'Мені здалось, чи ти биканув?';
				}
			},
		],
		'praise': [
			async (_nlp, response) => {
				if (response.score < 0.95) {
					response.answer = 'Мені здалось, чи ти биканув?';
				}
			},
		],
		'statistics': [
			async (_nlp, response) => {
				try {
					const chatId = response.activity.conversation.sourceEvent.chat.id;
					const pissInfo = await store.piss.readCount(chatId);
					const chatInfo = await store.chat.read(chatId);
					if (chatInfo) {
						const { messagesProcessed, messagesResponded, title } = chatInfo;
						const chatName = title || response.from.firstName || response.from.userName;
						response.answer = `У чаті ${chatName} було оброблено ${messagesProcessed} повідомлень та надіслано ${messagesResponded} відповідей. Струменів відправлено: ${pissInfo}.`;
					}
				} catch (_) {
					response.answer = 'Щось пішло не так. Голова тлумачиться...';
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
			intent: 'insult',
			utterances: [
				...UaResponseHostileShort,
				...UaInsults.map(word => `ти ${word}`),
				...UaInsults.map(word => `${word}`),
				'rm -rf',
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
				'Дякую, дуже дякую.',
				'Хоч хтось мене цінує.',
				'* червоніє *',
			],
		},
		{
			intent: 'reaction.upvote',
			utterances: [
				...UaPraises.map(word => `тут ${word}`),
			],
			answers: [
				...UaResponsesFriendly,
			],
		},
		{
			intent: 'reaction.downvote',
			utterances: [
				...UaInsults.map(word => `тут ${word}`),
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
			intent: 'statistics',
			utterances: [
				'статистика',
				'стата',
			],
			answers: [
				// processed by handler
			],
		},
	],
});
