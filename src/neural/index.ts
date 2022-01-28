/* eslint-disable @typescript-eslint/no-var-requires */
const { dockStart } = require('@nlpjs/basic');
import { sample } from 'lodash';
import { readdirSync } from 'fs';
import { join } from 'path';


import RuInsults from '../knowledge/ua-insults.json';
import UaResponseDunno from '../knowledge/ua-response-dunno.json';
import { Controller } from '../controller';
// import { logger } from '../logger';


export default async (controller: Controller) => {

	// Load NLP.JS basic container:
	const container = await dockStart({
		use: [ 'Basic', 'LangUk', 'LangRu' ],
		settings: {
			nlp: {
				log: false,
	    	threshold: 0.7,
	    	autoLoad: false,
	    	autoSave: false,
	    	forceNER: true,
			},
			'console': {
      	'debug': false,
    	},
		},
	});

	// Prepare NLP and Language modules and load modules:
	const language = container.get('Language');
	const nlp = container.get('nlp');

	// Prepare intent handler list and load modules:
	const handlers: {[key: string]: undefined | Array<PetlyurykNeuralHandler>} = {};
	const moduleList = readdirSync(join(__dirname, 'modules'));
	for (const moduleFileName of moduleList) {

		// Prepare module:
		const moduleFilePath = join(__dirname, 'modules', moduleFileName);
		const module = require(moduleFilePath);

		// Load corpus:
		if (module.corpus) {
			await nlp.addCorpus(module.corpus);
		}

		// Load intent handlers:
		if (module.handlers as PetlyurykNeuralHandlerMap) {
			Object.keys(module.handlers).map(intent => {
				handlers[intent] = [ ...(handlers[intent] || []), ...module.handlers[intent] ];
			});
		}

	}

	// Train model:
	/* eslint-disable no-console, @typescript-eslint/no-empty-function */
	const consoleLog = console.log;
	console.log = () => {};
	await nlp.train();
	console.log = consoleLog;
	/* eslint-enable no-console, @typescript-eslint/no-empty-function */

	// Setup handler: Intent handlers:
	nlp.onIntent = async (_nlp: typeof nlp, response: PetlyurykNeuralResponse) => {
		const intentHandlers = handlers[response.intent];
		if (intentHandlers) {
			for (const handler of intentHandlers) {
				await handler(_nlp, response);
			}
		}
	};

	// Setup handler: Incoming messages:
	controller.on('messageIn', async (event, stop) => {

		// Match message to the personal trigger:
		const { text } = event;
		const personalTrigger = /(^|\s)Петлюрику?,?($|\s|\.|,|!)/i;
		const isReferencedByName = text.match(personalTrigger);

		// Guess language before processing message:
		type LanguageResult = { alpha3: string, alpha2: string, language: string, score: number };
		const guessList = language.guess(event.text, [ 'uk', 'ru', 'en' ]) as LanguageResult[];
		const scoreRu = guessList.find(guess => guess.alpha2 === 'ru')?.score || 0;
		const scoreUa = guessList.find(guess => guess.alpha2 === 'uk')?.score || 0;
		const locale = guessList[0].alpha2;

		// Skip message if it is in Ukrainian and is not addressed to the bot.
		// This helps to lower workload on the neural engine:
		if (locale !== 'ru' && !isReferencedByName && !event.replyTo?.bot && !event.private) {
			return;
		}

		// Prepare input message by adding some context to it:
		const input = {
			text: text.replace(personalTrigger, ''),
			from: event.from,
			activity: {
				conversation: {
					id: `${event.chat.chatId}:${event.from.userId}`,
					sourceEvent: event,
					replyTo: event.id,
				},
			},
		};

		// Trigger hostile reaction if message is in russian and is not a reply:
		if (locale === 'ru' && !event.replyTo && !event.private) {
			input.text = RuInsults[0];
		}

		// Build NLP response using input:
		const response = await nlp.process(input) as PetlyurykNeuralResponse;
		// const context = await ctxManager.getContext(input);
		if (!response.answer || response.answer.length === 0) {
			response.answer = sample(UaResponseDunno)!;
		}

		// Send response message:
		controller.trigger({
			type: 'messageOut',
			intent: `neural.${response.locale}.${response.intent}`.toLowerCase(),
			text: response.answer,
			sourceText: event.text,
			chat: {
				chatId: event.chat.chatId,
			},
			replyTo: {
				messageId: response.activity.conversation.replyTo,
			},
			metadata: {
				language: {
					locale,
					scoreUa,
					scoreRu,
				},
				response: {
					text: response.text,
					answer: response.answer,
					score: response.score,
					locale: response.locale,
					from: response.from,
					intent: response.intent,
					classifications: response.classifications.filter(c => c.score > 0),
					entities: response.entities,
				},
			},
		});
		stop();
		return;

	});

};
