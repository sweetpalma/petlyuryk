/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { neuralModule } from '..';
import UaAggressiveResponseGeneric from '../../data/responses/ua-hostile-generic.json';
import UaAggressiveResponseRussian from '../../data/responses/ua-hostile-russian.json';
import UaAggressiveResponsePiss from '../../data/responses/ua-hostile-piss.json';
import RuInsults from '../../data/insults/ru.json';
import RuCommon from '../../data/common/ru.json';


export default neuralModule({
	name: 'Russian Misc',
	locale: 'ru-Ru',
	data: [
		{
			intent: 'None',
			utterances: [
				...RuInsults,
				...RuCommon,
			],
			answers: [
				...UaAggressiveResponseGeneric,
				...UaAggressiveResponseRussian,
				...UaAggressiveResponsePiss,
				'Не пукай',
				'Хрюкни ще раз, в тебе непогано виходить',
				'Свинко, ти забула де твій хлів знаходиться?',
				'А тепер напиши те ж саме, тільки нормальною мовою.',
				'Погано розумію свинособачу, а ну-мо повтори ще разок.',
				'Я не знаю російської. Може спробуєш державною?',
				'Не розумію про що ти. Щось на роснявій...',
				'Друзі, наша русофобія недостатня.',
				'Як ти потішно хрюкаєш.',
			],
		},
	],
});

