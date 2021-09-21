import { Botkit } from 'botkit';
import { TelegramAdapter } from './adapter';


export interface BotkitExtended extends Botkit {
	adapter: TelegramAdapter;
}


export interface MetadataMessage {
	recipientType: 'all' | 'user' | 'bot';
	replyToMessageId?: string;
	messageId: string;
}


export interface MetadataUser {
	[key: string]: string | number | null | undefined;
}
