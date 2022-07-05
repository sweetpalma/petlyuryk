import { neuralModule } from '..';

export default neuralModule({
	name: 'Ukrainian Love',
	locale: 'uk-UA',
	data: [
		{
			intent: 'love.you',
			utterances: [
				'я кохаю тебе',
				'я люблю тебе',
				'кохаю тебе',
				'люблю тебе',
			],
			answers: [
				'&#60;3',
			],
		},
		{
			intent: 'love.me',
			utterances: [
				'ти мене любиш?',
				'ти мене кохаєш?',
			],
			answers: [
				'Авжеж, моє сонце.',
				'Ти зігріваєш може серце довгими зимовими вечорами.',
			],
		},
		{
			intent: 'love.cute',
			utterances: [
				'я милий?',
				'я мила?',
			],
			answers: [
				'Краще всіх.',
			],
		},
		{
			intent: 'love.marry',
			utterances: [
				'вийди за мене',
				'одружися на мені',
			],
			answers: [
				'Обов\'язково.',
				'Хоч зараз в РАГС.',
			],
		},
		{
			intent: 'love.children',
			utterances: [
				'хочу від тебе дітей',
				'давай зробимо дітей',
			],
			answers: [
				'Вибач, в мене поки немає пісюна.',
				'Я робот.',
			],
		},
		{
			intent: 'love.sex',
			utterances: [
				'єбав тебе',
				'хочу тебе',
				'хочу трахнути тебе',
				'пішли в ліжко',
				'пішли трахатись',
				'/starthorny',
				'хорні',
			],
			answers: [
				'Знімай штани.',
				'Мий попу.',
			],
		},
	],
});