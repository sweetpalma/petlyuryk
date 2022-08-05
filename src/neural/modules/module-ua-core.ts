/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { sample } from 'lodash';
import { Store } from '~/store';
import { NeuralCorpus } from '..';

import UaCommon from '~/data/common/ua.json';
import UaDunnoAsk from '~/data/responses/ua-dunno-ask.json';
import UaDunnoEnd from '~/data/responses/ua-dunno-end.json';
import UaResponsesFriendly from '~/data/responses/ua-friendly.json';
import UaResponseHostileShort from '~/data/responses/ua-hostile-short.json';
import UaResponseHostileGeneric from '~/data/responses/ua-hostile-generic.json';
import UaResponseHostilePiss from '~/data/responses/ua-hostile-piss.json';
import UaPraises from '~/data/praises/ua.json';
import UaInsults from '~/data/insults/ua.json';



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


export default new NeuralCorpus({
	name: 'Ukrainian Core',
	domain: 'core',
	locale: 'uk-UA',
	entities: {
	  insult: {
	  	options: Object.fromEntries(UaInsults.map(word => [ word, [ word ] ])),
	  },
	  praise: {
	  	options: Object.fromEntries(UaPraises.map(word => [ word, [ word ] ])),
	  },
	},
	data: [
		{
			intent: 'None',
			utterances: UaCommon,
			handler(nlp, response) {
				const request = response.activity.conversation.sourceEvent;
				if (request.replyTo && request.replyTo.messageText !== '...') {
					const { messageText } = request.replyTo;
					if (UaDunnoEnd.includes(messageText)) {
						response.answer = '...';
					} else if (UaDunnoAsk.includes(messageText)) {
						response.answer = sample(UaDunnoEnd)!;
					} else {
						response.answer = sample(UaDunnoAsk)!;
					}
				}
			},
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
			handler(nlp, response) {
				if (response.score < 0.95) {
					response.answer = 'Мені здалось, чи ти биканув?';
				}
			},
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
			handler(nlp, response) {
				if (response.score < 0.95) {
					response.answer = 'Мені здалось, чи ти биканув?';
				}
			},
		},
		{
			intent: 'reaction.upvote',
			utterances: [
				...UaPraises.map(word => `тут ${word}`),
			],
			answers: [
				...UaResponsesFriendly,
			],
			async handler(nlp, response) {
				if (response.score < 0.95) {
					response.answer = '';
				}
				const { conversation } = response.activity;
				if (conversation.sourceEvent.replyTo) {
					conversation.replyTo = conversation.sourceEvent.replyTo.messageId;
				}
				if (!conversation.sourceEvent.replyTo) {
					conversation.replyTo = conversation.sourceEvent.id;
					response.answer = `${sample(niceTryUpvote)} ${sample(UaResponseHostilePiss)}`;
				}
			},
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
			async handler(nlp, response) {
				if (response.score < 0.95) {
					response.answer = '';
				}
				const { conversation } = response.activity;
				if (conversation.sourceEvent.replyTo) {
					conversation.replyTo = conversation.sourceEvent.replyTo.messageId;
				}
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
		},
		{
			intent: 'statistics',
			utterances: [
				'статистика',
				'стата',
			],
			async handler(nlp, response) {
				try {
					const chatId = response.activity.conversation.sourceEvent.chat.id;
					const pissInfo = await store.piss.readCount(chatId);
					const chatInfo = await store.chat.read(chatId);
					if (chatInfo) {
						const { messagesProcessed, messagesResponded, title } = chatInfo;
						const chatName = title || response.from.firstName || response.from.username;
						response.answer = `У чаті ${chatName} було оброблено ${messagesProcessed} повідомлень та надіслано ${messagesResponded} відповідей. Струменів відправлено: ${pissInfo}.`;
					}
				} catch (_) {
					response.answer = 'Щось пішло не так. Голова тлумачиться...';
				}
			},
		},
	],
});
