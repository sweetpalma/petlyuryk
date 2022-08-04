/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Nlp, NlpHandler, NlpEntities } from '@nlpjs/basic';
import { ControllerUser, ControllerRequest } from '~/controller';


/**
 * Corpus-like class for NLP.JS.
 */
export class NeuralCorpus<User = ControllerUser, Event = ControllerRequest> {

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
		handler?: NlpHandler<User, Event>;
	}>;

	/**
	 * Corpus entities.
	 */
	public readonly entities?: Optional<NlpEntities>;

	constructor(opts: Omit<NeuralCorpus<User, Event>, 'load'>) {
		this.name = opts.name;
		this.entities = opts.entities;
		this.locale = opts.locale;
		this.data = opts.data;
	}

	/**
	 * Load corpus into given NLP container.
	 */
	public load(nlp: Nlp<User, Event>) {

		// Set up locale:
		const [ locale ] = this.locale.split('-');
		if (!locale) throw new Error('Invalid corpus locale.');
		nlp.addLanguage(this.locale);

		// Set up data:
		const handlers: Array<NlpHandler<User, Event>> = [];
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
					if (response.locale === locale && response.intent === intent) {
						await handler(nlp, response);
					}
				});
			}
		}

		// Set up entities:
		if (this.entities) {
			nlp.addEntities(this.entities, locale);
		}

		// Set up handlers:
		const parentHandler = nlp.onIntent?.bind(nlp);
		nlp.onIntent = (async (nlp, response) => {
			await Promise.all([
				...handlers.map(handler => handler(nlp, response)),
				parentHandler && parentHandler(nlp, response),
			]);
		});

	}
}
