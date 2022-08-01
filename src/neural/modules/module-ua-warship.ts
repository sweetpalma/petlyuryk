/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import axios from 'axios';
import { NeuralCorpus } from '..';

export default new NeuralCorpus({
	name: 'Ukrainian Misc',
	locale: 'uk-UA',
	data: [
		{
			intent: 'warship',
			utterances: [
				'ситуація на фронті',
				'дохла русня',
				'по росні',
				'по русні',
			],
			async handler(nlp, response) {
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
		},
	],
});