/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import Redis from 'ioredis';
import * as telejson from 'telejson';
import { zip, isEqual, isArray } from 'lodash';
import { Mutex } from 'async-mutex';
import { logger } from '../logger';


/**
 * Store document prototype.
 */
export interface RedisStoreDocument {
	id: string;
}


/**
 * Store primary index structure.
 */
export type RedisStoreIndex<D extends RedisStoreDocument> = {
	[key in keyof D]?: 'TEXT' | 'TAG' | 'NUMERIC' | 'NUMERIC:SORTABLE';
};


/**
 * Store document update.
 */
export type RedisStoreUpdate<D extends RedisStoreDocument> = (
	Partial<Omit<D, 'id'>>
);


/**
 * Document-oriented RedisJSON CRUD Store.
 */
export abstract class RedisStore<D extends RedisStoreDocument> {

	/**
	 * Store key prefix. Used to build registry and document keys.
	 */
	public readonly abstract domain: string;

	/**
	 * Redis primary index. May be overriden.
	 */
	public readonly index: RedisStoreIndex<D> = { id: 'TAG' };

	/**
	 * Redis client getter.
	 */
	private get redis() {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		return RedisConnection.getClient();
	}

	/**
	 * Get Redis primary index name.
	 */
	private getRedisIndex() {
		return `${this.domain}:index`;
	}

	/**
	 * Get Redis Key for a Document with given ID.
	 */
	private getRedisKey(id: D['id']) {
		return `${this.domain}:document:${id}`;
	}

	/**
	 * Convert an object-like Redis RESP array into object.
	 * Example: [ "a", 1, "b", "2" ] => { a: 1, b: '2' }.
	 */
	private parseRedisArray(array: Array<unknown>): Record<string, unknown> {
		const keys = array.filter((_, i) => i % 2 === 0);
		const vals = array.filter((_, i) => i % 2 !== 0);
		return Object.fromEntries(zip(keys, vals));
	}

	/**
	 * Check if document with such ID exists.
	 */
	public async exists(id: D['id']) {
		return await this.redis.exists(this.getRedisKey(id)) !== 0;
	}

	/**
	 * Read a document with given ID. Returns NULL if it does not exist.
	 */
	public async read(id: D['id']) {
		const document = await this.redis.call('json.get', this.getRedisKey(id)) as string | null;
		if (document) {
			return telejson.parse(document) as D;
		} else {
			return null;
		}
	}

	/**
	 * Insert a document. Does nothing if document with such ID already exists.
	 */
	public async insert(document: D) {
		await this.redis.call('json.set', this.getRedisKey(document.id), '$', telejson.stringify(document), 'NX');
	}

	/**
	 * Add expiration date in seconds for a document.
	 */
	public async expire(id: D['id'], seconds: number) {
		await this.redis.expire(this.getRedisKey(id), seconds);
	}

	/**
	 * Remove a document. Does nothing if document with such ID does not exist.
	 */
	public async delete(id: D['id']) {
		await this.redis.del(this.getRedisKey(id));
	}

	/**
	 * Update a document. Create a new if document with such ID does not exist.
	 */
	public async upsert<U extends RedisStoreUpdate<D>>(id: D['id'], update: U, writeOnInsert: Omit<D, 'id' | keyof U>) {
		if (!await this.exists(id)) {
			await this.insert({ ...writeOnInsert, ...update, id } as D & U);
		} else {
			await this.update(id, update);
		}
	}

	/**
	 * Update a document. Does nothing if document with such ID does not exist.
	 */
	public async update<U extends RedisStoreUpdate<D>>(id: D['id'], update: U) {
		const currentDocument = await this.read(id);
		const updatedDocument = currentDocument && { ...currentDocument, ...update } as D;
		await this.redis.call('json.set', this.getRedisKey(id), '$', telejson.stringify(updatedDocument), 'XX') ;
	}

	/**
	 * Update a single field in document. Does nothing if document with such ID does not exist.
	 */
	public async updateValue(id: D['id'], field: keyof Omit<D, 'id'>, value: D[typeof field]) {
		if (await this.exists(id)) {
			await this.redis.call('json.set', this.getRedisKey(id), `$.${field}`, telejson.stringify(value));
		}
	}

	/**
	 * Increment a single field in document. Does nothing if document with such ID does not exist.
	 */
	public async updateIncrement(id: D['id'], field: keyof Omit<D, 'id'>, diff = 1) {
		if (await this.exists(id)) {
			await this.redis.call('json.numIncrBy', this.getRedisKey(id), `$.${field}`, diff);
		}
	}

	/**
	 * Run RediSearch query and return result (total count and document list).
	 */
	public async search<T = D>(query = '*', ...args: Array<string | number>) {
		await this.forceIndex(this.getRedisIndex(), this.index);
		const queryData = [ this.getRedisIndex(), query, ...args ];
		const redisData = await this.redis.call('ft.search', ...queryData) as Array<unknown>;
		const redisDocs = redisData.slice(1).filter(isArray).map(cols => telejson.parse(cols[cols.length - 1]));
		logger.info('redis:search', { query: `ft.search ${queryData.join(' ')}`, count: redisData[0] });
		return [ redisData[0], ...redisDocs ] as [ number, ...Array<T> ];
	}

	/**
	 * Run RediSearch query and return result (total count and aggregation result).
	 */
	public async aggregate<T = unknown>(query = '*', ...args: Array<string | number>) {
		await this.forceIndex(this.getRedisIndex(), this.index);
		const queryData = [ query, ...args ];
		const redisData = await this.redis.call('ft.aggregate', this.getRedisIndex(), ...queryData ) as Array<unknown>;
		const redisDocs = redisData.slice(1).filter(isArray).map(this.parseRedisArray);
		logger.info('redis:aggregate', { query: `ft.aggregate ${queryData.join(' ')}`, count: redisData[0] });
		return [ redisData[0], ...redisDocs ] as [ number, ...Array<T> ];
	}

	/**
	 * Create a new RediSearch index using given index name and schema. Will throw error if such index already exists.
	 */
	private async createIndex(index: string, schema: RedisStoreIndex<D>) {
		const argsPrefix = [ 'PREFIX', 1, this.domain ];
		const argsSchema = [ 'SCHEMA', ...Object.entries(schema).map(([ key, type ]) => [ `$.${key}`, 'AS', key, ...type.split(':') ]).flat() ];
		await this.redis.call('ft.create', index, 'ON', 'JSON', ...argsPrefix, ...argsSchema);
		logger.info('redis:index:create', { index, schema: this.index });
	}

	/**
	 * Create a new RediSearch index using given index name and schema. Will throw error if such index does not exist.
	 */
	private async deleteIndex(index: string) {
		await this.redis.call('ft.dropindex', index);
		logger.info('redis:index:delete', { index });
	}

	/**
	 * Get info about RediSearch index. Will return NULL if such index does not exist.
	 */
	private async readIndex(index: string) {
		try {
			const callResult = await this.redis.call('ft.info', this.getRedisIndex()) as Array<unknown>;
			const infoObject = this.parseRedisArray(callResult) as { attributes: Array<[]> };
			const attributes = infoObject.attributes.map(this.parseRedisArray).map(o => {
				return [ o.attribute, ('SORTABLE' in o) ? (o.type + ':SORTABLE') : (o.type)  ];
			});
			return Object.fromEntries(attributes) as RedisStoreIndex<D>;
		} catch (_) {
			return null;
		}
	}

	/**
	 * Ensure that RediSearch index exists and is up to date.
	 */
	private async forceIndex(index: string, schema: RedisStoreIndex<D>) {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		await RedisConnection.runExclusive(async () => {
			const info = await this.readIndex(index);
			if (!isEqual(info, this.index)) {
				if (!info) {
					await this.createIndex(index, schema);
				} else {
					await this.deleteIndex(index);
					await this.createIndex(index, schema);
				}
			}
		});
	}

}


/**
 * Redis connection handler.
 */
export class RedisConnection {
	private static redisClient?: Redis = undefined;
	private static redisMutex = new Mutex();

	/**
	 * Try connecting to Redis.
	 */
	public static async connect(url: string) {
		RedisConnection.redisClient = new Redis(url);
	}

	/**
	 * Exclusive application-wide code execution. Useful for operations like index creation.
	 */
	public static async runExclusive(...args: Parameters<Mutex['runExclusive']>) {
		return RedisConnection.redisMutex.runExclusive(...args);
	}

	/**
	 * Get Redis client. Throws an error if connection is not ready yet.
	 */
	public static getClient() {
		const { redisClient } = RedisConnection;
		if (!redisClient) throw new Error('No connection available.');
		return redisClient;
	}
}
