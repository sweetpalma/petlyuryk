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
	members: number;
	isKicked: boolean;
	isGroup: boolean;
	isMuted: boolean;
}


export class StoreChat extends RedisStore<StoreChatDocument> {
	public readonly domain = 'petlyuryk:chat';
	public override readonly index = {
		id:                <const>'TAG',
		messagesProcessed: <const>'NUMERIC:SORTABLE',
		messagesResponded: <const>'NUMERIC:SORTABLE',
		members:           <const>'NUMERIC:SORTABLE',
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
			totalMembers: await this.totalMembers(),
			totalMembersActive: await this.totalMembersActive(),
			totalKicked: (await this.listKicked(0, 0))[0],
			totalMuted: (await this.listMuted(0, 0))[0],
			totalGroup: (await this.listGroup(0, 0))[0],
		};
	}

	public async total() {
		const [ total ] = await this.search('*', 'LIMIT', 0, 0);
		return total;
	}

	public async totalMembers() {
		type Result = { members: string };
		const [ _, { members } ] = await this.aggregate<Result>('*', 'GROUPBY', 0, 'REDUCE', 'SUM', 1, '@members', 'AS', 'members');
		return parseInt(members);
	}

	public async totalMembersActive() {
		type Result = { members: string, isMuted: string };
		const [ _, ...results ] = await this.aggregate<Result>('*', 'GROUPBY', 1, '@isMuted', 'REDUCE', 'SUM', 1, '@members', 'AS', 'members');
		const { members } = results.find(result => result.isMuted === '0')!;
		return parseInt(members);
	}

	public async messagesProcessed() {
		type Result = { total: string };
		const [ _, { total } ] = await this.aggregate<Result>('*', 'GROUPBY', 0, 'REDUCE', 'SUM', 1, '@messagesProcessed', 'AS', 'total');
		return parseInt(total);
	}

	public async messagesResponded() {
		type Result = { total: string };
		const [ _, { total } ] = await this.aggregate<Result>('*', 'GROUPBY', 0, 'REDUCE', 'SUM', 1, '@messagesResponded', 'AS', 'total');
		return parseInt(total);
	}

	public async listKicked(offset = 0, limit = 10) {
		return this.search('@isKicked:{true}', 'LIMIT', offset, limit);
	}

	public async listMuted(offset = 0, limit = 10) {
		return this.search('@isMuted:{true}', 'LIMIT', offset, limit);
	}

	public async listGroup(offset = 0, limit = 10) {
		return this.search('@isGroup:{true}', 'LIMIT', offset, limit);
	}
}
