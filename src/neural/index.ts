/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-empty-function */
const { dockStart } = require('@nlpjs/basic');
import { readdirSync } from 'fs';
import { sample } from 'lodash';
import { join } from 'path';

import { logger } from '../logger';
import { Controller, ControllerRequest } from '../controller';
import UaDunnoAsk from '../data/responses/ua-dunno-ask.json';
import UaDunnoEnd from '../data/responses/ua-dunno-end.json';
import { languageGuess } from './language';
import { NeuralCorpus } from './corpus';
export { NeuralCorpus };


/**
 * Neural network threshold.
 */
export const NEURAL_THRESHOLD = (
	0.7
);


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
 * Petlyuryk neural processor module.
 */
export default async (controller: Controller, testMode = false) => {

	// Prepare basic NLP.JS container:
	const container = await dockStart({
		use: [ 'Basic', 'LangUk', 'LangRu' ],
		settings: {
			nlp: {
				nlu: { log: () => null },
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

	// Load neural sub-modules:
	const moduleList = readdirSync(join(__dirname, 'modules'));
	for (const moduleFileName of moduleList) {
		try {

			// Prepare loading information:
			const moduleFilePath = join(__dirname, 'modules', moduleFileName);
			const [ moduleName ] = moduleFileName.split('.');
			logger.info('neural:load', { moduleName });

			// Import neural corpus and load it:
			const corpus = require(moduleFilePath).default as NeuralCorpus;
			corpus.load(nlp);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			logger.error('neural:load', {
				error: error.message || error.toString(),
				stack: error.stack?.split('\n').map((t: string) => t.trim()),
			});
		}
	}

	// Train neural model.
	const startDate = new Date();
	await nlp.train();
	logger.info('neural:train', { startDate, endDate: new Date() });

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

		// Prepare DUNNO response:
		if (!response.answer && request.replyTo && request.replyTo.messageText !== '...') {
			const { messageText } = request.replyTo;
			if (UaDunnoEnd.includes(messageText)) {
				response.answer = '...';
			} else if (UaDunnoAsk.includes(messageText)) {
				response.answer = sample(UaDunnoEnd)!;
			} else {
				response.answer = sample(UaDunnoAsk)!;
			}
		}

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
