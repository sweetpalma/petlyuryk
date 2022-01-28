import axios from 'axios';


export const handlers: PetlyurykNeuralHandlerMap = {
	'market.rate': [
		async (_nlp, response) => {
			const round = (n: string | number) => parseFloat(`${n}`).toFixed(2);
			const currencyEntity = response.entities.find(e => e.entity === 'currency');
			const currencyCode = currencyEntity?.option;
			if (!currencyCode) {
				response.answer = 'Не можу зрозуміти про що ти.';
			} else {
				switch (currencyCode) {
					case 'uah': {
						const { data } = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=UAH');
						response.answer = `За один бакс просять ${round(1 / data.data.rates.USD)} гривень.`;
						break;
					}
					case 'usd': {
						const { data } = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=UAH');
						response.answer = `Ціна на даний момент - ${round(1 / data.data.rates.USD)}₴.`;
						break;
					}
					case 'rub': {
						response.answer = 'Стабільно йде на дно.';
						break;
					}
					default: {
						const { data } = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${currencyCode}`);
						response.answer = `Ціна на даний момент - ${round(data.data.rates.USD)}$.`;
						break;
					}
				}
			}
		},
	],
};


export const corpus: PetlyurykNeuralCorpus = {
	name: 'Corpus Ukrainian Market',
	locale: 'uk-UA',
	entities: {
	  currency: {
	  	options: {
	  		uah: [ 'uah', 'гривня' ],
	  		usd: [ 'usd', 'долар', 'доллар', 'бакс' ],
	  		eur: [ 'eur', 'євро' ],
	  		rub: [ 'rub', 'рубль', 'рубель' ],
	  		btc: [ 'btc', 'біток', 'біткоїн', 'біткоін' ],
	  		eth: [ 'eth', 'етер', 'ефір' ],
	  	},
	  },
	},
	data: [
		{
			'intent': 'market.rate',
			'utterances': [
				'кіко коштує @currency',
				'скільки коштує @currency',
				'що там @currency',
				'шо там @currency',
				'як там @currency',
			],
			'answers': [],
		},
		// {
		// 	"intent": "ua.crypto.founded",
		// 	"utterances": [
		// 		"коли створили @coin",
		// 	],
		// 	"answers": [
		// 		"{{ coin }} створили в {{  _data[entities.coin.option].founded }}"
		// 	]
		// },
	],
	// contextData: {
	//   // btc: {
	//   //   founded: 2007,
	//   // },
	// },
};
