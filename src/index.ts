/* eslint-disable no-console */
import { join } from 'path';
import { Botkit } from 'botkit';
import { MongoDbStorage } from 'botbuilder-storage-mongodb';
import { MongoClient } from 'mongodb';
import { TelegramAdapter } from './adapter';


const token = process.env.TELEGRAM_TOKEN;
if (!token) {
	console.error('No TELEGRAM_TOKEN provided.');
	process.exit(1);
}


const { MONGO_INITDB_ROOT_USERNAME, MONGO_INITDB_ROOT_PASSWORD } = process.env;
if (!MONGO_INITDB_ROOT_USERNAME || !MONGO_INITDB_ROOT_PASSWORD) {
	console.error('No MONGO_INITDB_ROOT_USERNAME or MONGO_INITDB_ROOT_PASSWORD provided.');
	process.exit(1);
}


const mongoUrl = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@mongo:27017/`;
const mongoClient = new MongoClient(mongoUrl);
mongoClient.connect()
	.then(() => {
		const collection = MongoDbStorage.getCollection(mongoClient);
		const storage = new MongoDbStorage(collection);
		const adapter = new TelegramAdapter(token);
		const controller = new Botkit({ adapter, storage, disable_webserver: true });
		adapter.createTelegramBot(controller);
		return controller;
	})
	.catch(error => {
		console.error('Failed to connect to the MongoDB.');
		console.error(error);
		process.exit(2);
	})
	.then(controller => {
		controller.loadModules(join(__dirname, 'modules'), [ '.ts' ]);
	})
	.catch(error => {
		console.error('Failed to load Petlyuryk modules.');
		console.error(error);
		process.exit(2);
	});
