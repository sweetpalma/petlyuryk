/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { RedisStore, RedisStoreDocument } from './redis';


export interface StoreChatDocument extends RedisStoreDocument {
	createdAt: Date;
	updatedAt: Date;
	messagesResponded: number;
	messagesProcessed: number;
	username: Nullable<string>;
	title: Nullable<string>;
	isKicked: boolean;
	isGroup: boolean;
	isMuted: boolean;
}


export class StoreChat extends RedisStore<StoreChatDocument> {
	public readonly domain = 'petlyuryk:chat';
	public override readonly index = {
		id:                <const>'TAG',
		messagesProcessed: <const>'NUMERIC',
		messagesResponded: <const>'NUMERIC',
		username:          <const>'TEXT',
		title:             <const>'TEXT',
		isKicked:          <const>'TAG',
		isGroup:           <const>'TAG',
		isMuted:           <const>'TAG',
	};

	public async stats() {
		return {
			total: await this.total(),
			messagesProcessed: await this.messagesProcessed(),
			messagesResponded: await this.messagesResponded(),
			totalKicked: (await this.listKicked(0, 0))[0],
			totalMuted: (await this.listMuted(0, 0))[0],
			totalGroup: (await this.listGroup(0, 0))[0],
		};
	}

	public async total() {
		const [ total ] = await this.search('*', 0, 0);
		return total;
	}

	public async messagesProcessed() {
		type Result = { total: number };
		const [ _, { total } ] = await this.aggregate<Result>('*', 'GROUPBY', 0, 'REDUCE', 'SUM', 1, '@messagesProcessed', 'AS', 'total');
		return total;
	}

	public async messagesResponded() {
		type Result = { total: number };
		const [ _, { total } ] = await this.aggregate<Result>('*', 'GROUPBY', 0, 'REDUCE', 'SUM', 1, '@messagesResponded', 'AS', 'total');
		return total;
	}

	public async listKicked(offset?: number, limit?: number) {
		return this.search('@isKicked:{true}', offset, limit);
	}

	public async listMuted(offset?: number, limit?: number) {
		return this.search('@isMuted:{true}', offset, limit);
	}

	public async listGroup(offset?: number, limit?: number) {
		return this.search('@isGroup:{true}', offset, limit);
	}
}
