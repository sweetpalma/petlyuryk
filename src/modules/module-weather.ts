import axios from 'axios';
import { sample } from 'lodash';
import { Botkit } from 'botkit';
import { regexPhrase, regexNamed } from '../utils';


const TRIGGER_WEATHER_CITY = (
	regexPhrase(regexNamed(/(що|шо|як) там (?<city>[а-яґєії\s-]+)\??$/i))
);


const RESPONSE_WEATHER_CITY_UNKNOWN = (
	'Єбанутий? Не знаю такого міста.'
);


const RESPONSE_WEATHER_CITY_RUSSIAN = [
	'Там зараз тільки ядерний попіл.',
	'Там зараз кислотний дощ, землетрус, масові пожежі.',
	'Там зараз повна срака, як і завжди.',
];


export default (controller: Botkit) => {
	const { OPENWEATHER_TOKEN } = process.env;
	if (!OPENWEATHER_TOKEN) {
		return;
	}
	controller.interrupts(TRIGGER_WEATHER_CITY, 'message', async (bot, msg) => {
		try {
			const weatherCity = msg.matches.groups.city;
			const weatherURL = `https://api.openweathermap.org/data/2.5/weather?units=metric&lang=ua&q=${encodeURIComponent(weatherCity)}&appid=${OPENWEATHER_TOKEN}`;
			const { data } = await axios.get(weatherURL);
			if (data.sys.country !== 'RU') {
				await bot.say(`Там зараз ${parseInt(data.main.temp)}C, ${data.weather[0].description}.`);
			} else {
				await bot.say(sample(RESPONSE_WEATHER_CITY_RUSSIAN)!);
			}
		} catch (error) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((error as any)?.response?.status === 404) {
				await bot.say(RESPONSE_WEATHER_CITY_UNKNOWN);
			} else {
				throw error;
			}
		}
	});
};
