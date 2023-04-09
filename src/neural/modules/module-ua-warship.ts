/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import axios from 'axios';
import { NeuralCorpus } from '..';

interface ResponseWarship {
	date: string;
	increase: { [key: string]: number };
	stats: { [key: string]: number };
}

const CATEGORIES: Array<[string, string]> = [
	[ 'personnel_units', 'орків' ],
	[ 'tanks', 'танків' ],
	[ 'planes', 'літаків' ],
	[ 'helicopters', 'гелікоптерів' ],
	[ 'armoured_fighting_vehicles', 'броньовиків' ],
	[ 'artillery_systems', 'гармат' ],
	[ 'cruise_missiles', 'ракет' ],
];

export default new NeuralCorpus({
	name: 'Ukrainian Misc',
	domain: 'warship',
	locale: 'uk-UA',
	data: [
		{
			intent: 'warship',
			utterances: [
				'ситуація на фронті',
				'дохла русня',
				'росня',
				'русня',
			],
			async handler(nlp, response) {
				const res = await axios.get('https://russianwarship.rip/api/v1/statistics/latest');
				const { date, stats, increase } = res.data.data as ResponseWarship;
				const header = `Станом на ${date.replace(/\-/g, '.')} загальні бойові втрати русачків наступні:`;
				const losses = CATEGORIES.map(([ key, label ]) => `${stats[key]} ${label} (+${increase[key]})`).join('\n');
				const footer = 'Русні пизда!';
				response.answer = [ header, losses, footer ].join('\n\n');
			},
		},
	],
});
