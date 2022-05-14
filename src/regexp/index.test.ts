/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { ControllerTest } from '../controller';
import { logger } from '../logger';
import loadRegexp from '.';


let testController: ControllerTest;
beforeEach(async () => {

	// Mock Winston:
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	jest.spyOn(logger, 'info').mockImplementation(() => jest.fn() as any);

	// Prepare controller:
	testController = new ControllerTest();
	await loadRegexp(testController);

});


type TestSuite = {
	intent: string;
	cases: Array<[string, boolean]>;
};


const testCasesReply: Array<TestSuite> = [
	{
		intent: 'regexp.glory.capitalize',
		cases: [
			[ 'україна', true ],
			[ 'україна понад усе', true ],
			[ 'ця ваша україна', true ],
			[ 'та оця ваша україна тут', true ],
			[ 'Україна', false ],
		],
	},
	{
		intent: 'regexp.glory.ukraine',
		cases: [
			[ 'Слава Україні!', true ],
			[ 'Слава Україні !', true ],
			[ 'Слава Україні?', true ],
			[ 'Слава Україні.', true ],
			[ 'Петлюрику, Слава Україні!', true ],
			[ 'Панове, Слава Україні', true ],
			[ 'Слава Україні, Петлюрику', true ],
			[ 'Сала Україні', false ],
		],
	},
	{
		intent: 'regexp.glory.nation',
		cases: [
			[ 'Слава нації!', true ],
			[ 'Слава нації?', true ],
			[ 'Слава нації.', true ],
			[ 'Петлюрику, Слава нації', true ],
			[ 'Панове, Слава нації', true ],
			[ 'Слава нації, Панове', false ],
		],
	},
	{
		intent: 'regexp.glory.over',
		cases: [
			[ 'Україна', true ],
			[ 'Петлюрику, Україна!', true ],
			[ 'Україна, Панове', false ],
			[ 'україна', false ],
		],
	},
	{
		intent: 'regexp.bandera.father',
		cases: [
			[ 'Петлюрику, батько наш Бандера', true ],
			[ 'Батько наш - Бандера', true ],
			[ 'Батько наш Бандера', true ],
		],
	},
	{
		intent: 'regexp.bandera.fight',
		cases: [
			[ 'ми за Україну', true ],
		],
	},
	{
		intent: 'regexp.belarus',
		cases: [
			[ 'Петлюрику, живе білорусь!', true ],
			[ 'Жыве беларусь!', true ],
			[ 'Лукашенку смерть, жыве беларусь!', true ],
			[ 'Живет Белоруссия!', false ],
		],
	},
	{
		intent: 'regexp.russophobia.long',
		cases: [
			[ 'Опять эта русофобия', true ],
			[ 'Що за русофобія', true ],
		],
	},
	{
		intent: 'regexp.russophobia.short',
		cases: [
			[ 'Наша русофобія', true ],
			[ 'Наша русофобія...', true ],
			[ 'Русофобія', true ],
		],
	},
	{
		intent: 'regexp.huyryk',
		cases: [
			[ 'Хуюрик, ти лох', true ],
			[ 'Цей хуюрик', true ],
			[ 'Заєбав хуюрик йобаний', true ],
			[ 'Хуюрик, ти де?', true ],
			[ 'Мда, хуюрик.', true ],
		],
	},
	{
		intent: 'regexp.putin.short',
		cases: [
			[ 'Путін', true ],
			[ 'Путін!', true ],
			[ 'Путін', true ],
		],
	},
	{
		intent: 'regexp.putin.long',
		cases: [
			[ 'Хто Путін?', true ],
			[ 'Путін хто?', true ],
			[ 'Ох уж цей путін', true ],
		],
	},
	{
		intent: 'regexp.joke.a',
		cases: [
			[ 'А', true ],
			[ 'А!', true ],
			[ 'А?', true ],
			[ 'а так', false ],
			[ 'так а', false ],
			[ 'мда', false ],
		],
	},
	{
		intent: 'regexp.joke.da',
		cases: [
			[ 'Да', true ],
			[ 'Да!', true ],
			[ 'Да?', true ],
			[ 'да такое', false ],
			[ 'поїзда', false ],
			[ 'мда', false ],
		],
	},
	{
		intent: 'regexp.joke.ni',
		cases: [
			[ 'Ні', true ],
			[ 'Ні!', true ],
			[ 'Ні?', true ],
			[ 'А мені?', true ],
			[ 'гімні', false ],
			[ 'ні ще', false ],
		],
	},
	{
		intent: 'regexp.joke.ne',
		cases: [
			[ 'Нє', true ],
			[ 'Нє!', true ],
			[ 'Нє?', true ],
			[ 'гавнє', false ],
			[ 'нє ще', false ],
		],
	},
	{
		intent: 'regexp.joke.net',
		cases: [
			[ 'Нет', true ],
			[ 'Нет!', true ],
			[ 'Нет?', true ],
			[ 'говнет', false ],
			[ 'нет еще', false ],
		],
	},
	{
		intent: 'regexp.joke.sho',
		cases: [
			[ 'Капшо', true ],
			[ 'Шо', true ],
			[ 'Шо?', true ],
			[ 'Що', false ],
			[ 'шо ти', false ],
		],
	},
	{
		intent: 'regexp.joke.ya',
		cases: [
			[ 'Я', true ],
			[ 'я', true ],
			[ 'Я!', true ],
			[ 'Ну я', false ],
			[ 'Ня', false ],
		],
	},
];


describe.each(testCasesReply)('Regexp - Intent "$intent"', ({ intent, cases }) => {
	test.each(cases)('react to %p: %p', async (text, shouldReact) => {
		const response = await testController.process({ text });
		if (!shouldReact) {
			expect(response?.intent).not.toEqual(intent);
		} else {
			expect(response?.intent).toEqual(intent);
		}
	});
});
