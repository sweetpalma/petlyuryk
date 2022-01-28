import { ControllerTest } from '../controller';
import UaPraises from '../knowledge/ua-praises.json';
import UaInsults from '../knowledge/ua-insults.json';
import RuCommon from '../knowledge/ru-common.json';
import loadNeural from '.';


let testController: ControllerTest;
beforeAll(async () => {
	testController = new ControllerTest();
	await loadNeural(testController);
});


type TestSuite = {
	semanticGroup: string;
	expectedIntents: Array<string>;
	cases: Array<string>;
};


const testCases: Array<TestSuite> = [
	{
		semanticGroup: 'russian.none',
		expectedIntents: [ 'neural.ru.none' ],
		cases: [
			'ы',
			'ё',
			'ъ',
			'э',
			...RuCommon,
		],
	},
	{
		semanticGroup: 'personal.insult',
		expectedIntents: [ 'neural.ru.insult', 'neural.uk.personal.insult' ],
		cases: [
			...UaPraises.map(word => `ти не ${word}`),
			...UaInsults.map(word => `ти ${word}`),
			...UaInsults.map(word => `${word}`),
		],
	},
	{
		semanticGroup: 'personal.praise',
		expectedIntents: [ 'neural.uk.personal.praise' ],
		cases: [
			...UaInsults.map(word => `ти не ${word}`),
			...UaPraises.map(word => `ти ${word}`),
			...UaPraises.map(word => `${word}`),
		],
	},
	{
		semanticGroup: 'personal.who.you',
		expectedIntents: [ 'neural.uk.personal.who.you' ],
		cases: [
			'ти бот?',
			'хто ти такий?',
			'ти хто?',
			'хто ти?',
		],
	},
	{
		semanticGroup: 'personal.who.me',
		expectedIntents: [ 'neural.uk.personal.who.me' ],
		cases: [
			'я хто?',
			'хто я?',
		],
	},
	{
		semanticGroup: 'personal.hello',
		expectedIntents: [ 'neural.uk.personal.hello' ],
		cases: [
			'Привіт, сонечко',
			'Любий, привіт',
			'Добрий вечір',
			'Добрий день',
			'Вітаю, сонечко',
		],
	},
	{
		semanticGroup: 'personal.bye',
		expectedIntents: [ 'neural.uk.personal.bye' ],
		cases: [
			'Бувай, квіточко',
			'Сонечку, до побачення',
			'Всього доброго',
			'Надобраніч',
		],
	},
	{
		semanticGroup: 'personal.thanks',
		expectedIntents: [ 'neural.uk.personal.thanks' ],
		cases: [
			'Спасибі',
			'Дякую, котик',
			'Спасибі, сонечко',
			'Дякую за поміч',
		],
	},
	{
		semanticGroup: 'personal.right',
		expectedIntents: [ 'neural.uk.personal.right' ],
		cases: [
			'ага',
			'згоден з тобою',
			'ти правий',
			'точно',
		],
	},
	{
		semanticGroup: 'personal.wrong',
		expectedIntents: [ 'neural.uk.personal.wrong' ],
		cases: [
			'ти всрався',
			'ти обісрався',
			'ти помилився кажу',
			'ти неправий',
		],
	},
	{
		semanticGroup: 'personal.love',
		expectedIntents: [ 'neural.uk.personal.love' ],
		cases: [
			'вийди за мене заміж',
			'одружися на мені',
			'я тебе кохаю',
			'я кохаю тебе',
			'я тебе люблю',
			'я люблю тебе',
			'ти сексі',
		],
	},
	{
		semanticGroup: 'personal.status',
		expectedIntents: [ 'neural.uk.personal.status' ],
		cases: [
			'чим займаєшся',
			'чим зараз займаєшся',
			'шо робиш',
			'що робиш',
		],
	},
];


describe.each(testCases)('Neural - Semantic Group "$semanticGroup"', ({ cases, expectedIntents }) => {
	test.each(cases)('react to "%s"', async (text) => {
		await testController.messageIn({ text, private: true });
		expect(expectedIntents).toContain(testController.lastMessageOut?.intent);
	});
});
