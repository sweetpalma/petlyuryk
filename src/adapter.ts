import { Botkit, BotkitMessage } from 'botkit';
import { Activity, BotAdapter, ConversationReference, TurnContext, ResourceResponse } from 'botbuilder';
import TelegramBot, { Message, User } from 'node-telegram-bot-api';
import { MetadataMessage } from './types';
import { Memory } from './memory';
import { logger } from './logger';


export class TelegramAdapter extends BotAdapter {
	public memory = new Memory();
	public telegram?: TelegramBot;
	public botInfo?: User;

	constructor(public readonly token: string) {
		super();
	}

	public createTelegramBot(controller: Botkit) {
		logger.info('Starting Telegram bot...');
		const telegram = this.telegram = new TelegramBot(this.token, { polling: true });
		telegram.getMe().then(me => {
			this.botInfo = me;
			logger.info(`Bot ${me.first_name}(${me.id}) is ready. Waiting for messages...`);
			telegram.on('message', async (msg) => {
				if (!msg.from || !msg.text) {
					return;
				}
				try {
					await this.memory.pull(controller);
					const context = this.getContextFromTelegramMessage(msg);
					await this.runMiddleware(context, controller.handleTurn.bind(controller));
					await this.memory.push(controller);
				} catch (error) {
					logger.error('unexpected error', { error });
					return;
				}
			});
			telegram.on('error', async (error) => {
				logger.error('error:general', { error });
			});
			telegram.on('polling_error', async (error) => {
				logger.error('error:polling', { error });
			});
			/* eslint-disable @typescript-eslint/no-explicit-any */
			controller.middleware.ingest.use(async (bot: any, msg: any, next: any) => {
				if (msg.reference.conversation.properties.recipientType === 'bot') {
					// intentional no await
					next();
					return;
				}
				const triggersOfType = [
					...((controller as any)._interrupts[msg.type] || []),
					...((controller as any)._triggers[msg.type]   || []),
				];
				for (const trigger of triggersOfType) {
					const triggerIsAcceptable = await (controller as any).testTrigger(trigger, msg);
					if (triggerIsAcceptable) {
						// intentional no await
						next();
						break;
					}
				}
				// if no matching trigger were found - ignore
				// this piece of code helps ignoring non-reply dialog answers in Telegram
				return;
			});
		});
		/* eslint-enable @typescript-eslint/no-explicit-any */
	}

	public async continueConversation(reference: Partial<ConversationReference>, logic: (context: TurnContext) => Promise<void>): Promise<void> {
		const request = TurnContext.applyConversationReference({ type: 'event', name: 'continueConversation' }, reference, true);
		const context = new TurnContext(this, request);
		return this.runMiddleware(context, logic).catch(error => {
			logger.error('error:continueConversation', { error });
		});
	}

	public async deleteActivity(context: TurnContext, reference: Partial<ConversationReference>): Promise<void> {
		return undefined;
	}

	public async updateActivity(context: TurnContext, activity: Partial<Activity>): Promise<void> {
		return undefined;
	}

	public async sendActivities(context: TurnContext, activities: Partial<Activity>[]): Promise<ResourceResponse[]> {
		if (!this.telegram) {
			return [];
		}
		const responses: Array<ResourceResponse> = [];
		for (const activity of activities) {
			let error: Error | null = null;
			const { text, attachments } = activity;
			const [ chatId, threadId ] = activity?.conversation?.id.split(':') || [ null, null ];
			try {

				// Prepare reply information and test message format:
				const reply_to_message_id = activity.channelData?.replyToId || activity.replyToId;
				if (!chatId || !threadId || (text && attachments)) {
					throw new Error('Invalid message format.');
				}

				// Send text::
				if (text && !attachments) {
					const replyMsg = await this.telegram.sendMessage(chatId, text, { reply_to_message_id });
					responses.push({ id: replyMsg.message_id.toString() });
					this.memory.addMessageToThread(replyMsg);
				}

				// Send sticker:
				else if (!text && attachments && attachments[0]?.contentType === 'sticker') {
					const [ sticker ] = attachments;
					const replyMsg = await this.telegram.sendSticker(chatId, sticker.content, { reply_to_message_id });
					responses.push({ id: replyMsg.message_id.toString() });
					this.memory.addMessageToThread(replyMsg);
				}

				// Text format is invalid:
				else {
					throw new Error('Invalid message format.');
				}

			} catch (err) {
				error = err as any; // eslint-disable-line @typescript-eslint/no-explicit-any
			} finally {
				const ctxAct = context.activity;
				const isDialogResponse = threadId !== ctxAct.id;
				logger[error ? 'error' : 'info'](`${ctxAct.type}`, {
					chatId,
					chatName: ctxAct.conversation.name,
					userId: ctxAct.from.id,
					userName: ctxAct.from.name,
					messageId: ctxAct.id,
					threadId,
					isDialogResponse,
					textIn: ctxAct.text,
					textOut: activity.text || null,
					error: error && { ...error, message: (error.message || error.toString()) },
				});
			}
		}
		return responses;
	}

	public getMessageMetadata(msg: BotkitMessage) {
		const { properties } = msg.reference?.conversation;
		if (!properties) throw new Error('Invalid message metadata.');
		return properties as MetadataMessage;
	}

	private getRecipientType(msg: Message) {
		const chatType = msg.chat.type;
		const replyToMessageId = msg.reply_to_message?.from?.id.toString();
		const botId = this.botInfo?.id.toString();
		if (chatType === 'group' || chatType === 'supergroup') {
			if (!replyToMessageId) return 'all';
			return (replyToMessageId && replyToMessageId !== botId) ? 'user' : 'bot';
		} else {
			return (replyToMessageId && replyToMessageId !== botId) ? 'user' : 'bot';
		}
	}

	private getContextFromTelegramMessage(msg: Message) {
		if (!msg.from || !msg.text) {
			throw new Error('Unsupported message format.');
		}
		const metadata: MetadataMessage = {
			messageId: msg.message_id.toString(),
			replyToMessageId: msg.reply_to_message?.message_id.toString(),
			recipientType: this.getRecipientType(msg),
		};
		return new TurnContext(this, {
			type: 'message',
			channelId: 'telegram',
			id: msg.message_id.toString(),
			callerId: msg.from.id.toString(),
			localTimezone: 'Europe/Kiev',
			text: msg.text,
			from: {
				name: msg.from.username || msg.from.first_name,
				id: msg.from.id.toString(),
			},
			recipient: {
				name: msg.reply_to_message?.from?.username || msg.reply_to_message?.from?.first_name || 'all',
				id: msg.reply_to_message?.from?.id.toString() || '0',
			},
			conversation: {
				id: msg.chat.id.toString() + ':' + this.memory.addMessageToThread(msg),
				name: msg.chat.title || msg.chat.id.toString(),
				isGroup: (msg.chat.type === 'group'),
				conversationType: msg.chat.type,
				properties: metadata,
			},
		});
	}
}
