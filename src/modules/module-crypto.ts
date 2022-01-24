import axios from 'axios';
import { sample } from 'lodash';
import { Botkit } from 'botkit';
import { regexPhrase, regexNamed } from '../utils';


const TRIGGER_CURRENCY = [
	regexPhrase(regexNamed(/(що|як) там (?<code>[a-zа-яіїє ]+)\??$/i)),
];


const TRIGGER_CURRENCY_MARKET = [
	regexPhrase(regexNamed(/(що|як) там ринок/i)),
];


const RESPONSE_CURRENCY_MARKET = [
	'ТУ ЗЕ МУН!',
	'Ведмеді душать.',
	'Та єбать його в рот, втянули нахуй знов в якусь хуйню...',
	'Знов кити хитають.',
	'Фіксуємо дохід.',
	'Докупаємо...',
];


const RESPONSE_CURRENCY_UNKNOWN = [
	'Такої хуйні немає на коїнбейз, йди нахуй.',
];


const CURRENCY_NICKNAME: {[key: string]: string} = {
	'біток': 'BTC',
	'біткоїн': 'BTC',
	'біткоін': 'BTC',
	'гривня': 'UAH',
	'долар': 'USD',
	'рубль': 'RUB',
	'євро': 'EUR',
	'етер': 'ETH',
	'ефір': 'ETH',
	'юань': 'CNY',
};


export default (controller: Botkit) => {
	const round = (n: string | number) => parseFloat(`${n}`).toFixed(2);
	controller.interrupts(TRIGGER_CURRENCY_MARKET, 'message', async (bot, msg) => {
		await bot.say(sample(RESPONSE_CURRENCY_MARKET)!);
	});
	controller.interrupts(TRIGGER_CURRENCY, 'message', async (bot, msg) => {
		try {
			const rawCode = msg.matches.groups.code as string;
			const code = encodeURIComponent(CURRENCY_NICKNAME[rawCode.toLowerCase()] || rawCode);
			switch (code) {
				case 'UAH': {
					const { data } = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=UAH');
					await bot.say(`За один бакс просять ${round(1 / data.data.rates.USD)} гривень.`);
					break;
				}
				case 'USD': {
					const { data } = await axios.get('https://api.coinbase.com/v2/exchange-rates?currency=UAH');
					await bot.say(`Ціна на даний момент - ${round(1 / data.data.rates.USD)}₴.`);
					break;
				}
				case 'RUB': {
					await bot.say('Стабільно йде на дно.');
					break;
				}
				default: {
					const { data } = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${code}`);
					const randomPhrase = sample(RESPONSE_CURRENCY_MARKET)!;
					await bot.say(`Ціна на даний момент - ${round(data.data.rates.USD)}$. ${randomPhrase}`);
					break;
				}
			}
		} catch (error) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any)?.response?.status === 400) {
				await bot.say(sample(RESPONSE_CURRENCY_UNKNOWN)!);
			} else {
				throw error;
			}
		}
	});
};
