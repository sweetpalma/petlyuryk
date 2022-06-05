/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import axios from 'axios';
import { logger } from '../logger';
import { ControllerTest } from '../controller';
import UaPraises from '../data/praises/ua.json';
import UaInsults from '../data/insults/ua.json';
import RuInsults from '../data/insults/ru.json';
import UaCommon from '../data/common/ua.json';
import RuCommon from '../data/common/ru.json';
import loadNeural from '.';


jest.mock('axios');
let testController: ControllerTest;
beforeAll(async () => {

	// Mock Winston:
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	jest.spyOn(logger, 'info').mockImplementation(() => jest.fn() as any);

	// Prepare controller:
	testController = new ControllerTest();
	await loadNeural(testController);

	// Mock axios for API requests:
	jest.spyOn(axios, 'get').mockImplementation(async (path: string) => {
		if (path.startsWith('https://russianwarship.rip/api/v1/statistics/latest')) {
			return { data: { data: { date: '2022-10-10', stats: {} } } };
		}
		if (path.startsWith('https://emapa.fra1.cdn.digitaloceanspaces.com')) {
			return { data: { states: { a: { enabled: true }, b: { enabled: false } } } };
		}
		if (path.startsWith('https://api.coinbase.com')) {
			return { data: { data: { rates: { USD: 1 } } } };
		}
	});

});


type TestSuite = {
	semanticGroup: string;
	expectedIntents: Array<string>;
	cases: Array<string>;
};


const testCurrencies = [
	'uah', 'гривня',
	'usd', 'долар', 'доллар', 'бакс',
	'eur', 'євро',
	'rub', 'рубль', 'рубель',
	'btc', 'біток', 'біткоїн', 'біткоін',
	'eth', 'етер', 'ефір',
];


const testCases: Array<TestSuite> = [

	// General language detection:
	{
		semanticGroup: 'ukrainian.none',
		expectedIntents: [], // must ignore
		cases: [
			...UaCommon,
		],
	},
	{
		semanticGroup: 'russian.none',
		expectedIntents: [ 'neural.ru.none' ],
		cases: [
			...RuCommon,
			'ы',
			'ё',
			'ъ',
			'э',
		],
	},

	// Module: Core:
	{
		semanticGroup: 'insult',
		expectedIntents: [ 'neural.ru.none', 'neural.uk.insult' ],
		cases: [
			...UaInsults.map(word => `ти ${word}`),
			...RuInsults.map(word => `ты ${word}`),
			...UaInsults.map(word => `${word}`),
			...RuInsults.map(word => `${word}`),
		],
	},
	{
		semanticGroup: 'praise',
		expectedIntents: [ 'neural.uk.praise' ],
		cases: [
			...UaPraises.map(word => `ти ${word}`),
			...UaPraises.map(word => `${word}`),
		],
	},
	{
		semanticGroup: 'chatter.hello',
		expectedIntents: [ 'neural.uk.chatter.hello' ],
		cases: [
			'Вітаю, Петлюрику',
			'Петлюрик, здоров',
			'Привіт',
			'Добрий ранок',
			'Добрий вечір',
			'Добрий день',
		],
	},
	{
		semanticGroup: 'chatter.bye',
		expectedIntents: [ 'neural.uk.chatter.bye' ],
		cases: [
			'Бувай, Петлюрику',
			'До побачення',
			'Всього доброго',
			'Надобраніч',
			'Добраніч',
		],
	},
	{
		semanticGroup: 'chatter.howdy',
		expectedIntents: [ 'neural.uk.chatter.howdy' ],
		cases: [
			'чим займаєшся',
			'чим зараз займаєшся',
			'шо робиш',
			'що робиш',
			// 'як ти',
			// 'шо ти',
		],
	},
	{
		semanticGroup: 'chatter.thanks',
		expectedIntents: [ 'neural.uk.chatter.thanks' ],
		cases: [
			'Спасибі',
			'Дякую, котик',
			'Дякую за поміч',
		],
	},
	{
		semanticGroup: 'chatter.right',
		expectedIntents: [ 'neural.uk.chatter.right' ],
		cases: [
			'ага',
			'згоден з тобою',
			'ти правий',
			'точно',
		],
	},
	{
		semanticGroup: 'chatter.wrong',
		expectedIntents: [ 'neural.uk.chatter.wrong' ],
		cases: [
			'ти всрався',
			'ти обісрався',
			'ти помилився кажу',
			'ти неправий',
		],
	},
	{
		semanticGroup: 'chatter.who.you',
		expectedIntents: [ 'neural.uk.chatter.who.you' ],
		cases: [
			'ти бот?',
			'хто ти такий?',
			'ти хто?',
			'хто ти?',
		],
	},
	{
		semanticGroup: 'chatter.who.me',
		expectedIntents: [ 'neural.uk.chatter.who.me' ],
		cases: [
			'я хто?',
			'хто я?',
		],
	},
	{
		semanticGroup: 'chatter.who.creator',
		expectedIntents: [ 'neural.uk.chatter.who.creator' ],
		cases: [
			'хто тебе написав',
			'хто тебе розробив',
			'хто тебе створив',
			'хто твій автор',
		],
	},
	{
		semanticGroup: 'chatter.capabilities',
		expectedIntents: [ 'neural.uk.chatter.capabilities' ],
		cases: [
			'петлюрику, на що ти здатен?',
			'що вмієш?',
			'шо вмієш?',
			'що можеш?',
			'шо можеш?',
		],
	},
	{
		semanticGroup: 'chatter.source',
		expectedIntents: [ 'neural.uk.chatter.source' ],
		cases: [
			'кинь нюдси',
			'покажи код',
			'нюдси',
		],
	},

	// Module: UA Love:
	{
		semanticGroup: 'love.marry',
		expectedIntents: [ 'neural.uk.love.marry' ],
		cases: [
			'вийди за мене заміж',
			'одружися на мені',
		],
	},
	{
		semanticGroup: 'love.marry',
		expectedIntents: [ 'neural.uk.love.you' ],
		cases: [
			'я тебе кохаю',
			'я кохаю тебе',
			'я тебе люблю',
			'я люблю тебе',
		],
	},
	{
		semanticGroup: 'love.sex',
		expectedIntents: [ 'neural.uk.love.sex' ],
		cases: [
			'хочу тебе',
			'пішли в ліжко',
			'давай трахатись',
		],
	},

	// Module: UA Alert:
	{
		semanticGroup: 'alert.all',
		expectedIntents: [ 'neural.uk.alert.all' ],
		cases: [
			'де тривоги',
			'де вибухи',
			'де сирени',
		],
	},

	// Module: UA Market:
	{
		semanticGroup: 'market.rate',
		expectedIntents: [ 'neural.uk.market.rate' ],
		cases: [
			...testCurrencies.map(word => `кіко коштує ${word}`),
			...testCurrencies.map(word => `скільки коштує ${word}`),
			...testCurrencies.map(word => `що там ${word}`),
			...testCurrencies.map(word => `як там ${word}`),
		],
	},

	// Module: UA memes:
	{
		semanticGroup: 'meme.rusyna',
		expectedIntents: [ 'neural.uk.warship' ],
		cases: [
			'як там дохла русня',
			'що по русні?',
			'шо по русні?',
		],
	},
	{
		semanticGroup: 'meme.gender',
		expectedIntents: [ 'neural.uk.meme.gender' ],
		cases: [
			'який твій гендер',
			'ти лесбі?',
			'ти натурал?',
			'ти гетеро?',
			'ти трап?',
			'ти гей?',
		],
	},
	{
		semanticGroup: 'meme.anecdote',
		expectedIntents: [ 'neural.uk.meme.anecdote' ],
		cases: [
			'анекдот',
			'танатос один долар',
			'танатос сто рублів',
			'жарт',
		],
	},

];


describe.each(testCases)('Neural - Semantic Group "$semanticGroup"', ({ cases, expectedIntents }) => {
	test.each(cases)('react to "%s"', async (text) => {
		const response = await testController.process({ text });
		if (expectedIntents.length > 0) {
			expect(expectedIntents).toContain(response?.intent);
		} else {
			expect(response?.intent).toBeUndefined();
		}
	});
});


describe('Neural - Language Guesser', () => {
	const repeats = [ 'ОООООО', 'АААААААААА', 'ІІІІІІІ' ];
	test.each(repeats)('ignores repeat "%s"', async (text) => {
		const response = await testController.process({ text });
		expect(response?.intent).toBeUndefined();
	});

	const smiles = [ ':з', ':3', ':Р', ':с', ':(' ];
	test.each(smiles)('ignores smile "%s"', async (text) => {
		const response = await testController.process({ text });
		expect(response?.intent).toBeUndefined();
	});

	const laughs = [ 'ахахахахах', 'хахахахах', 'хехе', 'хіхіхіхіхіхіхі', 'ахпхпхпхпхпх' ];
	test.each(laughs)('ignores laugh "%s"', async (text) => {
		const response = await testController.process({ text });
		expect(response?.intent).toBeUndefined();
	});
});
