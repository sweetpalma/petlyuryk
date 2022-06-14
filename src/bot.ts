/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TelegramBot from 'node-telegram-bot-api';
import { Controller, ControllerRequest } from './controller';
import { Store } from './store';
import { logger } from './logger';


/**
 * Node Telegram Bot API has no good TypeScript bindings unfortunately.
 */
const getChatMemberCount = async (telegram: TelegramBot, chatId: number | string) => {
	const count = await (telegram as any).getChatMemberCount(chatId) as number;
	return count - 1; // remove bot from count
};


/**
 * Start a new Telegram bot using provided controller and token string.
 */
export const startTelegramBot = async (controller: Controller, token: string, expire?: number) => {

	// Prepare bot and retrieve bot information:
	const telegram = new TelegramBot(token, { polling: true });
	const me = await telegram.getMe();
	const startupDate = new Date();

	// Store: Connect:
	const store = new Store();

	/*
	// Update chat information on a startup:
	// todo fix timeouts here
	logger.info('bot:update:start');
	const [ _, ...chats ] = await store.chat.search('*', 'LIMIT', 0, 10000);
	await Promise.all(chats.map(async ({ id, ...chat }) => {
		try {
			const count = await getChatMemberCount(telegram, id);
			await store.chat.updateValue(id, 'isKicked', false);
			await store.chat.updateValue(id, 'members', count);
		} catch (_) {
			await store.chat.updateValue(id, 'isKicked', true);
			await store.chat.updateValue(id, 'members', 0);
		}
	}));
	logger.info('bot:update:finish');
	*/

	// Log: Startup date:
	logger.info('bot:ready', { expire: expire || 0 });

	// Handler: Text messages:
	telegram.on('text', async (msg) => {
		try {

			// Filter out:
			// - Messages without text
			// - Messages without sender (conditions unclear)
			// - Messages created before the bot started
			// - Forwarded messages
			if (!msg.from || !msg.text || msg.forward_date || new Date(msg.date * 1000) < startupDate) {
				return;
			}

			// Extract basic message information:
			const { chat, from, message_id, reply_to_message } = msg;
			const isAdressedToBot = (reply_to_message?.from?.id === me.id);
			const isGroup = (chat.type !== 'private');
			const chatId = chat.id.toString();

			// Check that message is adressed to the bot and sanitize text from the trigger:
			const botTrigger = new RegExp(`(Петлюрику?|@${me.username}),?`, 'i');
			const isBotTrigger = msg.text.match(botTrigger) !== null;
			const text = msg.text.replace(botTrigger, '').trim();

			// Store: Log chat information:
			await store.chat.upsert(chat.id.toString(), {
				updatedAt: new Date(),
				members: await getChatMemberCount(telegram, chat.id),
				username: chat.username || null,
				title: chat.title || null,
				isKicked: false,
				isGroup,
			}, {
				createdAt: new Date(),
				messagesProcessed: 0,
				messagesResponded: 0,
				isMuted: false,
			});

			// Build a controller request:
			const request: ControllerRequest = {
				id: msg.message_id.toString(),
				isBotTrigger,
				text,
				chat: {
					id: chatId,
					title: chat.title,
					isGroup,
				},
				user: {
					id: from.id.toString(),
					username: from.username,
					firstName: from.first_name,
					lastName: from.last_name,
				},
				replyTo: reply_to_message && {
					isAdressedToBot,
					messageId: reply_to_message.message_id.toString(),
					messageText: reply_to_message.text!,
				},
			};

			// Store: Bump processed messages count:
			await store.chat.updateIncrement(chatId, 'messagesProcessed', 1);

			// Process incoming request and stop if no response:
			const response = await controller.process(request);
			if (!response) {
				return;
			}

			// Try sending a response:
			let delivered = true;
			try {

				const { text, replyTo } = response;
				await telegram.sendMessage(chatId, text, {
					reply_to_message_id: replyTo && parseInt(replyTo.messageId),
					disable_web_page_preview: true,
					parse_mode: 'HTML',
				});

			// Mark delivery as failed if bot is muted:
			} catch (error: any) {
				if (error.code === 'ETELEGRAM' && error.response?.statusCode) {
					delivered = false;
				} else {
					throw error;
				}
			}

			// Store: Bump responded messages count and log final result:
			await store.chat.updateValue(chatId, 'isMuted', !delivered );
			await store.chat.updateIncrement(chatId, 'messagesResponded');

			// Log: Message information:
			logger.info('bot:message', { delivered, request, response });

			// Store: Save message information:
			await store.message.insert({
				id: message_id.toString(),
				createdAt: new Date(),
				updatedAt: new Date(),
				delivered: delivered,
				intent: response.intent,
				chatId: chatId,
				userId: from.id.toString(),
				textInput: text,
				textOutput: response.text,
			});

			// Store: Set message expiration:
			if (expire) {
				await store.message.expire(message_id.toString(), expire);
			}

		} catch (error: any) {
			logger.error('bot:error', {
				error: error.message || error.toString(),
				stack: error.stack?.split('\n').map((t: string) => t.trim()),
			});
		}
	});

	// Handler: Mute status:
	telegram.on('my_chat_member' as any, async (msg: any) => {
		const canSendMessages = msg.new_chat_member?.can_send_messages || false;
		await store.chat.updateValue(msg.chat.id.toString(), 'isMuted', !canSendMessages );
	});

};
