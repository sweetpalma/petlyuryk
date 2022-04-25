/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { RedisConnection } from './redis';
import { StoreMessage } from './store-message';
import { StoreChat } from './store-chat';
import { StorePiss } from './store-piss';


/**
 * Main store entry point.
 */
export class Store {
	public readonly message = new StoreMessage();
	public readonly chat = new StoreChat();
	public readonly piss = new StorePiss();

	public static async connect(url: string) {
		return RedisConnection.connect(url);
	}
}
