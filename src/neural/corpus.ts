/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NeuralResponse } from '.';


/**
 * Typed NLP.JS intent handler.
 */
export interface NeuralHandler {
	(nlp: unknown, response: NeuralResponse): void | Promise<void>;
}


/**
 * Corpus-like class for NLP.JS.
 */
export class NeuralCorpus {

	/**
	 * Corpus unique name.
	 */
	public readonly name: string;

	/**
	 * Corpus locale.
	 */
	public readonly locale: string;

	/**
	 * Corpus data and handlers.
	 */
	public readonly data: Array<{
		intent: string;
		utterances: Array<string>;
		answers?: Array<string>;
		handler?: NeuralHandler;
	}>;

	/**
	 * Corpus entities.
	 */
	public readonly entities?: Optional<{
		[key: string]: string | {
			options: {
				[option: string]: Array<string>;
			}
		}
	}>;

	constructor(opts: Omit<NeuralCorpus, 'load'>) {
		this.name = opts.name;
		this.entities = opts.entities;
		this.locale = opts.locale;
		this.data = opts.data;
	}

	/**
	 * Load corpus into given NLP container.
	 */
	public load(nlp: any) {

		// Set up locale:
		const [ locale ] = this.locale.split('-');
		if (!locale) throw new Error('Invalid corpus locale.');
		nlp.addLanguage(this.locale);

		// Set up data:
		const handlers: Array<NeuralHandler> = [];
		for (const { intent, utterances, answers, handler } of this.data) {
			for (const utterance of utterances) {
				nlp.addDocument(locale, utterance, intent);
			}
			if (answers) {
				for (const answer of answers) {
					nlp.addAnswer(locale, intent, answer);
				}
			}
			if (handler) {
				handlers.push(async (nlp, response) => {
					if (response.intent !== intent) return;
					await handler(nlp, response);
				});
			}
		}

		// Set up entities:
		if (this.entities) {
			nlp.addEntities(this.entities, locale);
		}

		// Set up handlers:
		const parentHandler = nlp.onIntent?.bind(nlp);
		nlp.onIntent = <NeuralHandler>(async (nlp, response) => {
			await Promise.all([
				...handlers.map(handler => handler(nlp, response)),
				parentHandler && parentHandler(nlp, response),
			]);
		});

	}
}
