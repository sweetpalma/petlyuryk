/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import axios from 'axios';
import { neuralModule } from '..';


/**
 * Uses PrivatBank exchange rate:
 * https://api.privatbank.ua/#p24/exchange
 */
const getRatePrivatBank = async (currencyCode: string) => {
	type Result = Array<{ccy: string, buy: string, sale: string}>;
	const { data } = await axios.get<Result>('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');
	const targetRate = data.find(rate => rate.ccy.toLowerCase() === currencyCode.toLowerCase())?.sale;
	if (targetRate) {
		return parseFloat(targetRate).toFixed(2);
	} else {
		throw new Error();
	}
};


/**
 * Uses Coinbase exchange rate:
 * https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-exchange-rates
 */
const getRateCoinBase = async (currencyCode: string) => {
	type Result = { data: { rates: { [key: string]: string | undefined } } };
	const { data } = await axios.get<Result>(`https://api.coinbase.com/v2/exchange-rates?currency=${currencyCode}`);
	const targetRate = data.data.rates.USD;
	if (targetRate) {
		return parseFloat(targetRate).toFixed(2);
	} else {
		throw new Error();
	}
};


export default neuralModule({
	name: 'Ukrainian Market',
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
	  		bnb: [ 'bnb', 'байнанс' ],
	  		ada: [ 'ada', 'кардано' ],
	  		sol: [ 'sol', 'солана' ],
	  		ltc: [ 'ltc', 'лайткоїн', 'лайткоін' ],

	  		doge: [ 'doge', 'доге' ],
	  		usdt: [ 'usdt', 'тезер' ],
	  		usdс: [ 'usdc' ],

	  	},
	  },
	},
	handlers: {
		'market.rate': [
			async (_nlp, response) => {
				const currencyCode = response.entities.find(e => e.entity === 'currency')?.option;
				if (!currencyCode) {
					response.answer = 'Не можу зрозуміти про що ти.';
					return;
				}

				try {
					switch (currencyCode) {
						case 'uah': {
							const rate = await getRatePrivatBank('usd');
							response.answer = `За один бакс просять ${rate} гривень.`;
							break;
						}
						case 'usd':
						case 'eur': {
							const rate = await getRatePrivatBank(currencyCode);
							response.answer = `Ціна на даний момент - ${rate}₴.`;
							break;
						}
						case 'rub': {
							response.answer = 'Стабільно йде на дно.';
							break;
						}
						default: {
							const rate = await getRateCoinBase(currencyCode);
							response.answer = `Ціна на даний момент - ${rate}$.`;
							break;
						}
					}
				} catch (err) {
					response.answer = 'Побачивши курс я вмер від крінжі.';
				}
			},
		],
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
			'answers': [
				// processed by handler
			],
		},
		{
			'intent': 'market.source',
			'utterances': [
				'звідки дані про курс',
				'звідки курси валют',
			],
			'answers': [
				'Я беру дані курсів з Privat24 та Coinbase.',
			],
		},
	],
});
