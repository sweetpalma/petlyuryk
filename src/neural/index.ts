/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
/* eslint-disable no-console, @typescript-eslint/no-var-requires, @typescript-eslint/no-empty-function */
const { dockStart } = require('@nlpjs/basic');
import { readdirSync } from 'fs';
import { join } from 'path';
import { Controller, ControllerRequest } from '../controller';
import { logger } from '../logger';
import { languageGuess } from './language';


/**
 * Neural network threshold.
 */
export const NEURAL_THRESHOLD = (
	0.7
);


/**
 * Typed wrapper around NLP.JS corpus structure, augmented with intent handler map.
 */
export interface NeuralModule {
	name: string;
	locale: string;
	data: Array<{
		intent: string;
		utterances: Array<string>;
		answers: Array<string>;
	}>;
	handlers?: {
		[key: string]: Array<NeuralHandler>;
	};
	contextData?: {
		[key: string]: {
			[option: string]: string | number | boolean;
		}
	};
	entities?: {
		[key: string]: string | {
			options: {
				[option: string]: Array<string>;
			}
		}
	};
}


/**
 * Typed wrapper around NLP.JS response structure.
 */
export interface NeuralResponse {
	text: string;
	answer: string;
	locale: string;
	intent: string;
	score: number;
	from: {
		firstName?: string;
		lastName?: string;
		userName?: string;
		userId: string;
	};
	classifications: Array<{
		intent: string;
		score: number;
	}>;
	entities: Array<{
		option: string;
		accuracy: number;
		entity: string;
	}>;
	activity: {
		conversation: {
			id: string;
			sourceEvent: ControllerRequest;
			replyTo: string;
		};
	};
}

/**
 * Typed NLP.JS intent handler.
 */
export interface NeuralHandler {
	(_nlp: unknown, response: NeuralResponse): void | Promise<void>;
}


/**
 * Typed NLP.JS language guessing result.
 */
export interface NeuralLanguage {
	language: string;
	alpha3: string;
	alpha2: string;
	score: number;
}


/**
 * Typed neural submodule helper.
 */
export const neuralModule = (submodule: NeuralModule) => (
	submodule
);


/**
 * Petlyuryk neural processor module.
 */
export default async (controller: Controller, testMode = false) => {

	// Prepare basic NLP.JS container:
	const container = await dockStart({
		use: [ 'Basic', 'LangUk', 'LangRu' ],
		settings: {
			nlp: {
	    	threshold: NEURAL_THRESHOLD,
	    	trainByDomain: false,
	    	autoLoad: false,
	    	autoSave: false,
	    	forceNER: true,
			},
		},
	});

	// Extract NLP module from container:
	const nlp = container.get('nlp');

	// Extract custom language guesser:
	const guess = languageGuess(container);

	// Prepare unified intent handler:
	const neuralHandlers: NeuralModule['handlers'] = {};
	nlp.onIntent = async (_nlp: typeof nlp, response: NeuralResponse) => {
		const intentHandlers = neuralHandlers[response.intent];
		if (intentHandlers) {
			for (const handler of intentHandlers) {
				await handler(_nlp, response);
			}
		}
	};

	// Load neural sub-modules:
	const moduleList = readdirSync(join(__dirname, 'modules'));
	for (const moduleFileName of moduleList) {
		try {

			// Prepare loading information:
			const moduleFilePath = join(__dirname, 'modules', moduleFileName);
			const [ moduleName ] = moduleFileName.split('.');
			logger.info('neural:load', { moduleName });

			// Evaluate module and extract NLP.JS corpus and intent handler information:
			const { handlers, ...corpus } = require(moduleFilePath).default as NeuralModule;

			// Load NLP.JS corpus:
			await nlp.addCorpus(corpus);

			// Load optional intent handlers:
			if (handlers) {
				Object.keys(handlers).map(intent => {
					neuralHandlers[intent] = [
						...(neuralHandlers[intent] || []),
						...handlers[intent],
					];
				});
			}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			logger.error('neural:load', {
				error: error.message || error.toString(),
				stack: error.stack?.split('\n').map((t: string) => t.trim()),
			});
		}
	}

	// Train neural model.
	// Console is disable with monkey patching because there is literally no other way to do this.
	const startDate = new Date();
	const consoleLog = console.log;
	console.log = () => {};
	await nlp.train();
	console.log = consoleLog;
	logger.info('neural:train', {
		startDate,
		endDate: new Date(),
	});

	// Build up the final controller handler:
	logger.info('neural:ready');
	controller.addHandler(async (request) => {

		// Match message to the personal trigger:
		const { text, isBotTrigger, replyTo } = request;

		// Guess language before processing message:
		const { locale, guessed } = guess(text);

		// Skip message if it is in Ukrainian and is not addressed to the bot:
		if (locale !== 'ru' && !isBotTrigger && !replyTo?.isAdressedToBot && request.chat.isGroup) {
			return;
		}

		// Prepare NLP.JS input:
		const input = {
			locale: guessed ? undefined : locale,
			text,
			from: request.user,
			activity: {
				conversation: {
					id: `${request.chat.id}:${request.user.id}`,
					sourceEvent: request,
					replyTo: request.id,
				},
			},
		};

		// Run NLP.JS processor and stop if no answer:
		const response: NeuralResponse = await nlp.process(input);
		logger.info('neural:response', {
			locale: response.locale,
			intent: response.intent,
			text: response.text,
			answer: response.answer || null,
			score: response.score,
			from: response.from,
			classifications: response.classifications.filter(c => c.score > 0),
			entities: response.entities,
		});

		// Pack a response:
		if (response.answer) {
			return {
				intent: `neural.${response.locale}.${response.intent}`.toLowerCase(),
				replyTo: { messageId: response.activity.conversation.replyTo },
				text: response.answer,
			};
		}

	});

};
