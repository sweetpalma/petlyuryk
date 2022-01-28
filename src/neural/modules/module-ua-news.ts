import axios from 'axios';
import { sample, sampleSize } from 'lodash';
import Parser from 'rss-parser';


const sourceList: Array<[string, string]> = [
	[ 'Радіо Свобода', 'https://www.radiosvoboda.org/api/zrqiteuuir' ],
];


const newsToShow = (
	3
);


const parser = (
	new Parser()
);

export const handlers: PetlyurykNeuralHandlerMap = {
	'news.random': [
		async (_nlp, response) => {

			// Get news of a specific source:
			const [ _sourceName, sourceURL ] = sample(sourceList)!;
			const { data } = await axios.get(sourceURL);
			const feed = await parser.parseString(data);

			// Pick N random news to display and format them:
			const news = sampleSize(feed.items, newsToShow);
			const newsFormatted = news.map(article => (
				[ `<b>${article.title}</b>`,`<i>${article.content}</i>` ].join('\n')
			));

			// Respond:
			response.answer = newsFormatted.join('\n\n');

		},
	],
};


export const corpus: PetlyurykNeuralCorpus = {
	name: 'Corpus Ukrainian Personal',
	locale: 'uk-UA',
	data: [
		{
			intent: 'news.random',
			utterances: [
				'яка геополітична ситуація',
				'яка геополітична обстановка',
				// 'що там в світі',
				// 'шо там в світі',
				'новини',
			],
			answers: [],
		},
		{
			intent: 'news.sources',
			utterances: [
				'які джерела ти використовуєш',
				'звідки ти береш новини',
			],
			answers: [
				`Джерела: ${sourceList.map(([ name ]) => name).join(', ')}`,
				`Я беру новини з наступний джерел: ${sourceList.map(([ name ]) => name).join(', ')}`,
				`Мої джерела наступні: ${sourceList.map(([ name ]) => name).join(', ')}`,
			],
		},
	],
};
