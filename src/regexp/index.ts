import { sample } from 'lodash';
import { Controller } from '../controller';


const replies = [

	// Glory to Ukraine:
	{
		intent: 'glory.ukraine',
		triggers: [
			/(^|\s)Слава Україні(\.|\?|!)?$/i,
		],
		responses: [
			'Героям Слава!',
		],
	},
	{
		intent: 'glory.nation',
		triggers: [
			/(^|\s)Слава Нації(\.|\?|!)?$/i,
		],
		responses: [
			'Смерть ворогам!',
		],
	},
	{
		intent: 'glory.over',
		triggers: [
			/(^|\s)Україна(\.|\?|!)?$/i,
		],
		responses: [
			'Понад усе!',
		],
	},

	// Putin:
	{
		intent: 'putin',
		triggers: [
			/(^|\s)(Путін|Путин)(\.|\?|!)?$/i,
		],
		responses: [
			'Путін - хуйло.',
		],
	},

	// Laugh:
	{
		intent: 'laugh',
		triggers: [
			/(^|\s)([ахїі]{4,})(\s|\.|\?|!|$)/i,
		],
		responses: [
			'Єбать ти смішний.',
			'Зараз лусну від сміху.',
			'Ніхуя ти клоун.',
		],
	},

	// Retarded jokes:
	{
		intent: 'joke.da',
		triggers: [
			/(^|\s)да(!|\?|.)?$/i,
		],
		responses: [
			'Хуй на',
			'Пізда',
		],
	},
	{
		intent: 'joke.ni',
		triggers: [
			/(^|\s)ні(!|\?|.)?$/i,
		],
		responses: [
			'Рука в гавні.',
			'Рука в гімні.',
			'Рука в гівні.',
		],
	},
	{
		intent: 'joke.ne',
		triggers: [
			/(^|\s)нє(!|\?|.)?$/i,
		],
		responses: [
			'Рука в гавнє.',
		],
	},
	{
		intent: 'joke.sho',
		triggers: [
			/(^|\s)шо(!|\?|.)?$/i,
		],
		responses: [
			'В рот зайшло.',
		],
	},

];


export default async (controller: Controller) => {
	controller.on('messageIn', async (event, stop) => {
		const { text } = event;
		for (const reply of replies) {
			for (const trigger of reply.triggers) {
				if (!text.match(trigger)) {
					continue;
				}
				controller.trigger({
					type: 'messageOut',
					intent: `regexp.${reply.intent}`,
					text: sample(reply.responses)!,
					sourceText: event.text,
					chat: {
						chatId: event.chat.chatId,
					},
					replyTo: {
						messageId: event.id,
					},
					metadata: {
						trigger: trigger.toString(),
					},
				});
				stop();
				return;
			}
		}
	});
};
