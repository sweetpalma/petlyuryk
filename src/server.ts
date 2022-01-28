import TelegramBot from 'node-telegram-bot-api';
import { Controller } from './controller';
import { logger } from './logger';

export const startTelegramBot = async (controller: Controller, token: string) => {

	// Prepare bot and get information:
	const telegram = new TelegramBot(token, { polling: true });
	const me = await telegram.getMe();

	// Message Handling: Incoming:
	telegram.on('text', async (msg) => {
		if (!msg.from || !msg.text) {
			return;
		}

		// try {
		await controller.trigger({
			type: 'messageIn',
			private: msg.chat.type === 'private',
			id: msg.message_id.toString(),
			text: msg.text,
			chat: {
				chatName: msg.chat.title || msg.chat.username || msg.chat.id.toString(),
				chatId: msg.chat.id.toString(),
			},
			from: {
				firstName: msg.from.first_name,
				lastName: msg.from.last_name,
				userName: msg.from.username,
				userId: msg.from.id.toString(),
			},
			replyTo: !msg.reply_to_message ? undefined : {
				bot: msg.reply_to_message.from?.id === me.id,
				messageId: msg.reply_to_message.message_id.toString(),
				messageText: msg.reply_to_message.text || '',
			},
		});
		// } catch (err) {
		// const error = (err as Error).message || (err as Error).toString();
		// logger.error('error:general', { error });
		// throw error;
		// }
	});

	// Message Handling: Outgoing:
	controller.on('messageOut', async (event) => {

		// Send message:
		const chatId = event.chat.chatId;
		const reply_to_message_id = event.replyTo?.messageId ? parseInt(event.replyTo?.messageId) : undefined;
		await telegram.sendMessage(chatId, event.text, {
			reply_to_message_id,
			disable_web_page_preview: true,
			parse_mode: 'HTML',
		});

		// Log:
		logger.info('msg:out', {
			intent: event.intent,
			sourceText: event.sourceText,
			text: event.text,
			metadata: event.metadata,
		});

	});

};
