/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
declare module '@nlpjs/basic' {

	/**
	 * NLP .process(...) input.
	 */
	export interface NlpInput<User, Event> {
		locale?: Optional<string>;
		text: string;
		from: User;
		activity: {
			conversation: {
				id: string;
				sourceEvent: Event;
				replyTo: string;
			};
		};
	}

	/**
	 * NLP .process(...) output.
	 */
	export interface NlpResponse<User, Event> {
		text: string;
		answer: string;
		locale: string;
		intent: string;
		score: number;
		from: User;
		domain?: string;
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
				sourceEvent: Event;
				replyTo: string;
			};
		};
	}

	/**
	 * NLP response entities.
	 */
	export interface NlpEntities {
		[key: string]: string | {
			options: {
				[option: string]: Array<string>;
			}
		}
	}

	/**
	 * NLP response handler.
	 */
	export interface NlpHandler<User, Event> {
		(nlp: Nlp<User, Event>, response: NlpResponse<User, Event>): void | Promise<void>;
	}

	/**
	 * NLP submodule.
	 */
	export interface Nlp<User, Event> {
		train(): Promise<void>;
		process(input: NlpInput<User, Event>): Promise<NlpResponse<User, Event>>;
		addLanguage(locale: string): void;
		addDocument(locale: string, utterance: string, intent: string): void;
		addAnswer(locale: string, intent: string, answer: string): void;
		addEntities(entities: NlpEntities, locale: string): void;
		assignDomain(locale: string, intent: string, domain: string): void;
		onIntent?: NlpHandler<User, Event>;
	}

	/**
	 * Language detection result.
	 */
	export interface LanguageGuess {
		language: string;
		alpha3: string;
		alpha2: string;
		score: number;
	}

	/**
	 * Language detection submodule.
	 */
	export interface Language {
		guess(text: string, locales: Array<string>): Array<LanguageGuess>;
	}

	/**
	 * NLP.JS core container.
	 */
	export interface Container {
		get<User, Event>(module: 'nlp'): Nlp<User, Event>;
		get(module: 'Language'): Language;
	}

	/**
	 * NLP.JS core container builder.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export const dockStart: (opts: any) => Promise<Container>;

}