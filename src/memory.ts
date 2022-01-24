import { Botkit }  from 'botkit';
import { Message } from 'node-telegram-bot-api';
import { MetadataUser, MemoryGlobals } from './types';
import { logger } from './logger';


// Purpose of this class is to store additional information about current dialog state.
// Mostly message thread information.
export class Memory {
	public readonly storageKey = 'petlyuryk';
	private globals: MemoryGlobals = {};
	private metadataUser: {[key: string]: MetadataUser | undefined} = {};
	private threads: {[key: string]: string} = {};

	// Save current state to the Botkit Storage.
	public async pull(controller: Botkit) {
		try {
			const storageData = await controller.storage.read([ this.storageKey ]);
			const petlyurykStorage = storageData[this.storageKey] || {};

			this.globals = petlyurykStorage.globals || {};
			this.metadataUser = petlyurykStorage.metadataUser || {};
			this.threads = petlyurykStorage.threads || {};

			logger.info('memory:pull', { success: true, error: null });
		} catch (error) {
			logger.info('memory:pull', { success: true, error });
		}
	}

	// Load current state from a Botkit Storage.
	public async push(controller: Botkit) {
		try {
			const { threads, metadataUser, globals } = this;
			const data = { threads, metadataUser, globals };
			await controller.storage.write({ [this.storageKey]: data });
			logger.info('memory:push', { success: true, error: null });
		} catch (error) {
			logger.info('memory:push', { success: true, error });
		}
	}

	// Add Telegram message to the Thread context.
	public addMessageToThread(msg: Message) {
		const replyToMessageId = msg.reply_to_message?.message_id.toString();
		if (!replyToMessageId) {
			this.threads[msg.message_id] = msg.message_id.toString();
			return msg.message_id;
		} else {
			this.threads[msg.message_id] = this.threads[replyToMessageId] || msg.message_id.toString();
			return this.threads[msg.message_id];
		}
	}

	// Get global variable:
	public getGlobal<T extends MemoryGlobals[keyof MemoryGlobals]>(key: keyof MemoryGlobals, defaultValue: T) {
		return this.globals[key];
	}

	// Set global variable:
	public setGlobal<T extends MemoryGlobals[keyof MemoryGlobals]>(key: keyof MemoryGlobals, value: T) {
		const oldValue = this.globals[key];
		this.globals[key] = value;
		logger.info('memory:setGlobal', { key, oldValue, newValue: value });
	}

	// Get user metadata.
	public getUserMetadata<T extends MetadataUser[keyof MetadataUser]>(userId: string, key: keyof MetadataUser, defaultValue: T): T {
		const userMetadata = this.metadataUser[userId] || {};
		return userMetadata[key] !== undefined ? userMetadata[key] as T : defaultValue;
	}

	// Set user metadata.
	public setUserMetadata(userId: string, key: keyof MetadataUser, value: MetadataUser[keyof MetadataUser]) {
		const userMetadata = this.metadataUser[userId] || {};
		const oldValue = userMetadata[key] || null;
		this.metadataUser[userId] = { ...this.metadataUser[userId], [key]: value };
		logger.info('memory:setUserMetadata', { userId, key, oldValue, newValue: value });
	}
}
