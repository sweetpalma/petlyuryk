/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { neuralModule } from '..';
import UaFunny from '../../data/responses/ua-funny.json';


export default neuralModule({
	name: 'Ukrainian Memes',
	locale: 'uk-UA',
	handlers: {
		'meme.rusnya': [
			async (_nlp, response) => {
				if (response.score < 0.9) {
					response.answer = '';
				}
			},
		],
	},
	data: [
		{
			intent: 'meme.rusnya',
			utterances: [
				'по русні',
				'по русні',
			],
			answers: [
				'Русні пизда!',
			],
		},
		{
			intent: 'meme.gender',
			utterances: [
				'який гендер',
				'ти лесбі',
				'ти натурал',
				'ти гетеро',
				'ти трап',
				'ти гей',
			],
			answers: [
				'Я бінарно-небінарний.',
				'Я бойовий гелікоптер.',
				'Я бездушна машина.',
			],
		},
		{
			intent: 'meme.anecdote',
			utterances: [
				'танатос',
				'розкажи анекдот',
				'розкажи жарт',
				'анекдот',
				'жарт',
			],
			answers: [
				...UaFunny,
			],
		},
	],
});