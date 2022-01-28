import { sample } from 'lodash';
import UaResponseHostilePiss from '../../knowledge/ua-response-hostile-piss.json';


const niceTry = [
	'Охуєнно смішно.',
	'Ти справді думав що це спрацює?',
	'Мене так просто не обдурити.',
];


export const handlers: PetlyurykNeuralHandlerMap = {
	'piss': [
		async (_nlp, response) => {
			const { conversation } = response.activity;
			if (conversation.sourceEvent.replyTo) {
				conversation.replyTo = conversation.sourceEvent.replyTo.messageId;
			}
			if (conversation.sourceEvent.replyTo?.bot) {
				conversation.replyTo = conversation.sourceEvent.id;
				response.answer = `${sample(niceTry)} ${response.answer}`;
			}
		},
	],
};


export const corpus: PetlyurykNeuralCorpus = {
	name: 'Corpus Ukrainian Piss',
	locale: 'uk-UA',
	data: [
		{
			intent: 'piss',
			utterances: [
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
	],
};
