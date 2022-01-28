import { ControllerTest } from '../controller';
import loadRegexp from '.';


let testController: ControllerTest;
beforeEach(() => {
	testController = new ControllerTest();
	loadRegexp(testController);
});


type TestSuite = {
	intent: string;
	cases: Array<[string, boolean]>;
};


const testCases: Array<TestSuite> = [
	{
		intent: 'regexp.glory.ukraine',
		cases: [
			[ 'Слава Україні!', true ],
			[ 'Слава Україні?', true ],
			[ 'Слава Україні.', true ],
			[ 'Петлюрику, Слава Україні!', true ],
			[ 'Панове, Слава Україні', true ],
			[ 'Слава Україні, Петлюрику', false ],
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
			[ 'Слава нації, Петлюрику', false ],
		],
	},
	{
		intent: 'regexp.glory.over',
		cases: [
			[ 'Україна', true ],
			[ 'Петлюрику, Україна!', true ],
			[ 'Україна, Петлюрику', false ],
		],
	},
	{
		intent: 'regexp.laugh',
		cases: [
			[ 'ахаха', true ],
			[ 'хахах', true ],
			[ 'їхїхїх', true ],
			[ 'аїаїаї', true ],
			[ 'а хата', false ],
			[ 'махач', false ],
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
			[ 'гімні', false ],
			[ 'ні ще', false ],
		],
	},
	{
		intent: 'regexp.joke.sho',
		cases: [
			[ 'Шо', true ],
			[ 'Шо?', true ],
			[ 'Що', false ],
			[ 'шо ти', false ],
		],
	},
];


describe.each(testCases)('Regexp - Intent "$intent"', ({ intent, cases }) => {
	test.each(cases)('react to %p: %p', async (text, shouldReact) => {
		await testController.messageIn({ text });
		if (!shouldReact) {
			expect(testController.lastMessageOut?.intent).not.toEqual(intent);
		} else {
			expect(testController.lastMessageOut?.intent).toEqual(intent);
		}
	});
});
