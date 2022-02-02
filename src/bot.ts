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
 * Start a new Telegram bot using provided controller and token string.
 */
export const startTelegramBot = async (controller: Controller, token: string) => {

	// Prepare bot and retrieve bot information:
	const telegram = new TelegramBot(token, { polling: true });
	const me = await telegram.getMe();
	const startupDate = new Date();

	// Store: Connect:
	const store = new Store();

	// Update chat information on a startup:
	logger.info('bot:update');
	const [ _, ...chats ] = await store.chat.search();
	await Promise.all(chats.map(async ({ id, ...chat }) => {
		try {
			await (telegram as any).getChatMemberCount(id);
			await store.chat.updateValue(id, 'isKicked', false);
		} catch (_) {
			await store.chat.updateValue(id, 'isKicked', true);
		}
	}));

	// Log: Startup date:
	logger.info('bot:ready');

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
			const { chat, from, reply_to_message } = msg;
			const chatId = chat.id.toString();
			const isAdressedToBot = (reply_to_message?.from?.id === me.id);
			const isGroup = (chat.type !== 'private');

			// Store: Log chat information:
			await store.chat.upsert(chat.id.toString(), {
				updatedAt: new Date(),
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
				text: msg.text,
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
			logger.info('bot:message', { delivered, request, response });

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
