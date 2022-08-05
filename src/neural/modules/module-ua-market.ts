/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import axios from 'axios';
import { NeuralCorpus } from '..';


/**
 * Uses PrivatBank exchange rate:
 * https://api.privatbank.ua/#p24/exchange
 */
const getRatePrivatBank = async (currencyCode: string) => {
	type Result = Array<{ccy: string, buy: string, sale: string}>;
	const { data } = await axios.get<Result>('https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5');
	const targetRate = data.find(rate => rate.ccy.toLowerCase() === currencyCode.toLowerCase())?.sale;
	if (!targetRate) {
		throw new Error(`Invalid PrivatBank currency: ${currencyCode}`);
	} else {
		return `${parseFloat(targetRate).toFixed(2)}₴`;
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
	if (!targetRate) {
		throw new Error(`Invalid CoinBase currency: ${currencyCode}`);
	} else {
		return `${parseFloat(targetRate).toFixed(2)}$`;
	}
};


export default new NeuralCorpus({
	name: 'Ukrainian Market',
	domain: 'market',
	locale: 'uk-UA',
	entities: {
	  currency: {
	  	options: {
	  		uah: [ 'uah', 'гривня', 'гривні' ],
	  		usd: [ 'usd', 'долар', 'доллар', 'бакс', 'баксу', 'долару' ],
	  		eur: [ 'eur', 'євро' ],
	  		rub: [ 'rub', 'рубль', 'рубель', 'рублю' ],

	  		btc: [ 'btc', 'біток', 'біткоїн', 'біткоін', 'бітку' ],
	  		eth: [ 'eth', 'етер', 'ефір', 'ефіру', 'етеру' ],
	  		bnb: [ 'bnb', 'байнанс', 'байнансу' ],
	  		ada: [ 'ada', 'кардано' ],
	  		sol: [ 'sol', 'солана', 'солані' ],
	  		ltc: [ 'ltc', 'лайткоїн', 'лайткоін', 'лайткоіну', 'лайткоїну' ],
	  		doge: [ 'doge', 'доге' ],

	  	},
	  },
	},
	data: [
		{
			intent: 'market.rate.all',
			utterances: [
				'курс валют',
				'валюта',
				'риночок',
				'ринок',
			],
			async handler(nlp, response) {
				const buildRate = async (code: string, promise: Promise<string>) => `${code} ${await promise}`;
				response.answer = (await Promise.all([
					buildRate('USD', getRatePrivatBank('usd')),
					buildRate('EUR', getRatePrivatBank('eur')),
					buildRate('BTC', getRateCoinBase('btc')),
					buildRate('ETH', getRateCoinBase('eth')),
				])).join('\n');
			},
		},
		{
			intent: 'market.rate.currency',
			utterances: [
				'кіко коштує @currency',
				'скільки коштує @currency',
				'що там @currency',
				'шо там @currency',
				'як там @currency',
				'шо по @currency',
				'що по @currency',
			],
			async handler(nlp, response) {
				const currencyCode = response.entities.find(e => e.entity === 'currency')?.option;
				if (!currencyCode) {
					response.answer = 'Не можу зрозуміти про що ти.';
				} else {
					switch (currencyCode) {
						case 'uah': {
							const rate = await getRatePrivatBank('usd');
							response.answer = `За один бакс просять ${rate}.`;
							break;
						}
						case 'usd':
						case 'eur': {
							const rate = await getRatePrivatBank(currencyCode);
							response.answer = `Ціна на даний момент - ${rate}.`;
							break;
						}
						case 'rub': {
							response.answer = 'Стабільно йде на дно.';
							break;
						}
						default: {
							const rate = await getRateCoinBase(currencyCode);
							response.answer = `Ціна на даний момент - ${rate}.`;
							break;
						}
					}
				}
			},
		},
	],
});
