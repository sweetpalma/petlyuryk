import { Botkit } from 'botkit';
import { TelegramAdapter } from './adapter';


export interface BotkitExtended extends Botkit {
	adapter: TelegramAdapter;
}


export interface MemoryGlobals {
	[key: string]: string | number | boolean | null | undefined;
}


export interface MetadataMessage {
	recipientType: 'all' | 'user' | 'bot';
	replyToUserId?: string;
	replyToMessageId?: string;
	messageId: string;
}


export interface MetadataUser {
	[key: string]: string | number | boolean | null | undefined;
}
