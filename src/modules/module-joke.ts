import { sample } from 'lodash';
import { BotkitExtended } from '../types';
import { regexPhrase } from '../utils';


const RETARDED_JOKES: Array<[RegExp[], string[]]> = [
	[
		[
			regexPhrase(/ні$/i),
		],
		[
			'Рука в гавні',
			'Привіт',
		],
	],
	[
		[
			regexPhrase(/нє$/i),
		],
		[
			'Рука в гавнє',
		],
	],
		[
		[
			regexPhrase(/а$/i),
		],
		[
			'Хуй на',
		],
	],
	[
		[
			regexPhrase(/да$/i),
		],
		[
			'Хуй на',
			'Пізда',
		],
	],
	[
		[
			regexPhrase(/нет$/i),
		],
		[
			'Підора атвєт',
		],
	],
	[
		[
			regexPhrase(/ти$/i),
		],
		[
			'Тобі насрали в рот коти.',
		],
	],
	[
		[
			regexPhrase(/триста$/i),
			regexPhrase(/300/i),
		],
		[
			'Відсмокчи у тракториста.',
		],
	],
];


export default (controller: BotkitExtended) => {
	RETARDED_JOKES.forEach(([ triggers, responses ]) => {
		controller.hears(triggers, 'message', async (bot, msg) => {
			await bot.say(sample(responses)!);
		});
	});
};
