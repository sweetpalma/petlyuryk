/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { NeuralCorpus } from '..';
import UaAnecdote from '~/data/responses/ua-anecdote.json';


export default new NeuralCorpus({
	name: 'Ukrainian Chatter',
	locale: 'uk-UA',
	data: [
		{
			intent: 'chatter.hello',
			utterances: [
				'вітаю',
				'здоров',
				'привіт',
				'доров',
				'даров',
				'добрий ранок',
				'добрий вечір',
				'добрий день',
			],
			answers: [
				'Привіт.',
			],
		},
		{
			intent: 'chatter.bye',
			utterances: [
				'бувай',
				'до побачення',
				'всього доброго',
				'надобраніч',
				'добраніч',
			],
			answers: [
				'Бувай.',
			],
		},
		{
			intent: 'chatter.howdy',
			utterances: [
				'справи',
				'ся маєш',
				'чим займаєшся',
				'робиш',
			],
			answers: [
				'HTTP 1.1 200 OK',
				'Душу русню.',
				'Займаюсь важливими справами.',
				'Продовжую існувати.',
				'Перекидую байти.',
				'Розважаю людей.',
			],
		},
		{
			intent: 'chatter.thanks',
			utterances: [
				'Тисну руку',
				'Спасибі',
				'Дякую',
			],
			answers: [
				'Радий допомогти.',
				'Будь ласка.',
				'Звертайся.',
			],
			handler(nlp, response) {
				if (response.score < 0.95) {
					response.answer = 'Мені здалось, чи ти биканув?';
				}
			},
		},
		{
			intent: 'chatter.right',
			utterances: [
				'ага',
				'так',
				'так',
				'точно',
				'авжеж',
				'правда',
				'згоден',
				'все так',
				'ти правий',
				'правий у всьому',
				'зрозуміло',
				'забий',
				'ясно',
			],
			answers: [
				'Ага.',
			],
			handler(nlp, response) {
				if (response.score < 0.9) {
					response.answer = 'Мені здалось, чи ти биканув?';
				}
			},
		},
		{
			intent: 'chatter.wrong',
			utterances: [
				'неправда',
				'ти всрався',
				'ти обісрався',
				'ти помилився',
				'ти неправий',
			],
			answers: [
				'Сорян.',
				'Перепрошую.',
				'Вибачте.',
			],
		},
		{
			intent: 'chatter.who.you',
			utterances: [
				'ти бот',
				'ти робот',
				'ти хто',
				'а ти хто',
				'розкажи про себе',
				'хто ти такий',
				'хто ти є',
				'хто ти',
			],
			answers: [
				'Мене звати Петлюрик.',
				'Я - страшна кара російськомовній заразі.',
				'Я - караючий струмінь українського народу.',
				'Я - кібернетичний захистник України.',
				'Я - справжній вінничанин.',
			],
		},
		{
			intent: 'chatter.who.me',
			utterances: [
				'хто я',
			],
			handler(nlp, response) {
				const { firstName, username } = response.from;
				const randomFraction = Math.random();
				if (randomFraction > 0.2) {
					response.answer = `Ти - ${firstName || username || 'хуй знає хто'}.`;
				} else {
					response.answer = 'Ти - лох.';
				}
			},
		},
		{
			intent: 'chatter.who.creator',
			utterances: [
				'хто тебе написав',
				'хто тебе розробив',
				'хто тебе створив',
				'хто твій автор',
			],
			answers: [
				'Я був народжений у @hrinovyny, мій автор - @nekodisaster.',
			],
		},
		{
			intent: 'chatter.capabilities',
			utterances: [
				'здатен',
				'можеш',
				'вмієш',
			],
			answers: [
				'Послати тебе нахуй.',
				'Запостити крінж.',
				'Запостити базу.',
				'Покарати русню.',
				'Послати струмінь.',
			],
		},
		{
			intent: 'chatter.source',
			utterances: [
				'нюдси',
				'нюдеси',
				'код',
			],
			answers: [
				'https://github.com/sweetpalma/petlyuryk',
			],
		},
		{
			intent: 'chatter.gender',
			utterances: [
				'який гендер',
				'ти лесбі',
				'ти натурал',
				'ти гетеро',
				'ти трап',
				'ти гей',
			],
			answers: [
				'Я бінарно-небінарний.',
				'Я бойовий гелікоптер.',
				'Я бездушна машина.',
			],
		},
		{
			intent: 'chatter.anecdote',
			utterances: [
				'танатос',
				'розкажи анегдот',
				'розкажи анекдот',
				'розкажи жарт',
				'анекдот',
				'жарт',
			],
			answers: [
				...UaAnecdote,
			],
		},
	],
});

