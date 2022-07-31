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

	// If RU score = 0, UK score must be lower than this:
	const UKRAINIAN_THRESHOLD = 0.85;

	// Return a tuned language guessing function tied to the existing NLP.JS container:
	return (text: string) => {

		let locale: string;
		let guessed = true;

		// Make basic NLP.JS guess:
		try {
			const guessList = language.guess(text, [ 'uk', 'ru' ]) as Array<LanguageGuess>;
			const guessTop = guessList[0];
			const guessUkr = guessList.find(guess => guess.alpha2 === 'uk');
			const guessRus = guessList.find(guess => guess.alpha2 === 'ru');

			if (guessRus && guessUkr && guessRus.score > guessUkr.score && guessUkr.score < UKRAINIAN_THRESHOLD) {
				locale = 'ru';
			} else {
				locale = 'uk';
			}

			if (guessTop.alpha2 !== locale) {
				guessed = false;
			}

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

		// Pack result - later it will be used in a core neural module:
		return { guessed, locale };

	};
};
