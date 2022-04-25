/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { RedisStore, RedisStoreDocument } from './redis';


export interface StoreMessageDocument extends RedisStoreDocument {
	createdAt: Date;
	updatedAt: Date;
	delivered: boolean;
	intent: string;
	chatId: string;
	userId: string;
	textOutput: string;
	textInput: string;
}


export class StoreMessage extends RedisStore<StoreMessageDocument> {
	public readonly domain = 'petlyuryk:message';
	public override readonly index = {
		id:         <const>'TAG',
		intent:     <const>'TEXT',
		chatId:     <const>'TAG',
		userId:     <const>'TAG',
		textOutput: <const>'TEXT',
		textInput:  <const>'TEXT',
	};
}
