import UaAggressiveResponseGeneric from '../../knowledge/ua-response-hostile-generic.json';
import UaAggressiveResponseRussian from '../../knowledge/ua-response-hostile-russian.json';
import UaAggressiveResponsePiss from '../../knowledge/ua-response-hostile-piss.json';
import RuInsults from '../../knowledge/ru-insults.json';
import RuCommon from '../../knowledge/ru-common.json';

export const corpus: PetlyurykNeuralCorpus = {
	'name': 'Corpus Russian',
	'locale': 'ru-Ru',
	'data': [
		{
			intent: 'insult',
			utterances: [
				...RuInsults.map(word => `${word}`),
				...RuInsults.map(word => `мать твоя ${word}`),
				...RuInsults.map(word => `ты ${word}`),
			],
			answers: [
				...UaAggressiveResponseGeneric,
				...UaAggressiveResponseRussian,
				...UaAggressiveResponsePiss,
			],
		},
		{
			intent: 'putin',
			utterances: [
				'Путин',
			],
			answers: [
				'Путін - хуйло.',
			],
		},
		{
			intent: 'None',
			utterances: [
				'ы',
				'э',
				'ъ',
				'ё',
				...RuCommon,
			],
			answers: [
				'Півень закукарікав, з боку Росії!',
				'Погано розумію свинособачу, а ну-мо повтори ще разок.',
				'Я не знаю російської. Може спробуєш державною?',
				'Не розумію про що ти. Щось на роснявій...',
				'Як ти потішно хрюкаєш.',
			],
		},
	],
};
