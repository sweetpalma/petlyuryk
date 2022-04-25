/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { RedisStore, RedisStoreDocument } from './redis';


export interface StorePissDocument extends RedisStoreDocument {
	count: number;
}


export class StorePiss extends RedisStore<StorePissDocument> {
	public readonly domain = 'petlyuryk:piss';
	public async readCount(chatId: string) {
		const document = await this.read(chatId);
		return document?.count || 0;
	}

	public async bumpCount(chatId: string) {
		await this.upsert(chatId, {}, { count: 0 });
		await this.updateIncrement(chatId, 'count');
	}
}