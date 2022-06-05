/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import axios from 'axios';
import { neuralModule } from '..';

export default neuralModule({
	name: 'Ukrainian Misc',
	locale: 'uk-UA',
	handlers: {
		'warship': [
			async (_nlp, response) => {
				const res = await axios.get('https://russianwarship.rip/api/v1/statistics/latest');
				const data = res.data.data as { date: string, stats: { [key: string]: number } };
				response.answer = [
					`Станом на ${data.date.replace(/\-/g, '.')} загальні бойові втрати русачків наступні:`,
					'',
					`${data.stats.personnel_units} орків`,
					`${data.stats.tanks} танків`,
					`${data.stats.planes} літаків`,
					`${data.stats.helicopters} гелікоптерів`,
					`${data.stats.warships_cutters} кораблів`,
					`${data.stats.armoured_fighting_vehicles} бронетранспортерів`,
					`${data.stats.artillery_systems} гармат`,
					`${data.stats.cruise_missiles} ракет`,
					'',
					'Русні пизда!',
				].join('\n');
			},
		],
	},
	data: [
		{
			intent: 'warship',
			utterances: [
				'дохла русня',
				'по росні',
				'по русні',
			],
			answers: [
				// processed by handler
			],
		},
	],
});