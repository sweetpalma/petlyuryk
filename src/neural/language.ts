/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */


/**
 * Language guess result.
 */
export interface LanguageGuess {
	language: string;
	alpha3: string;
	alpha2: string;
	score: number;
}


/**
 * Dedicated NLP.JS language guesser + additional fixes for Ukrainian/Russian detection.
 */
export const languageGuess = (container: unknown) => {

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const language = (container as any).get('Language');
	const letterUa = /[іїєґ'‘]/i;
	const letterRu = /[ыэъё]/i;

	// Return a tuned language guessing function tied to the existing NLP.JS container:
	return (text: string) => {

		let locale: string;
		let guessed = true;

		// Make basic NLP.JS guess:
		try {
			const guessList = language.guess(text, [ 'uk', 'ru' ]) as Array<LanguageGuess>;
			locale = guessList[0]?.alpha2 || 'uk';
		} catch (error) {
			guessed = false;
			locale = 'uk';
		}

		// Guess fix: Russian letters -> Mark as Russian:
		if (locale === 'uk' && text.match(letterRu)) {
			guessed = false;
			locale = 'ru';
		}

		// Guess fix: Ukrainian letters -> Mark as Ukrainian:
		if (locale === 'ru' && text.match(letterUa)) {
			guessed = false;
			locale = 'uk';
		}

		// Guess fix: Laughter:
		if (locale === 'ru' && !text.match(letterRu) && text.match(/(аха|хах|хех|хпх)/i)) {
			guessed = false;
			locale = 'uk';
		}

		// Guess fix: Same character repeat:
		if (locale === 'ru' && !text.match(letterRu) && text.match(/^(.)\1*$/i)) {
			guessed = false;
			locale = 'uk';
		}

		// Guess fix: Smiles:
		if (locale === 'ru' && !text.match(letterRu) && text.match(/^:[\S]{1,3}$/i)) {
			guessed = false;
			locale = 'uk';
		}

		// Guess fix: Short words (less then 3 characters):
		if (locale === 'ru' && !text.match(letterRu) && text.length < 3) {
			guessed = false;
			locale = 'uk';
		}

		// Pack result - later it will be used in a core neural module:
		return { guessed, locale };

	};
};
