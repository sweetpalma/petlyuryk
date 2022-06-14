/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */


/**
 * Generic Regular Expression to match message start with optional preceding spaces.
 */
export const MSG_START = (
	/^\s*/
);


/**
 * Generic Regular Expression to match message end with optional punctuation or trailing spaces.
 */
export const MSG_END = (
	/\s*(?:\.|\?|,|!)*?$/
);


/**
 * Generic Regular Expression to match message start, spacer or punctuation.
 */
export const MSG_START_OR_SPACER = (
	/(?:^|\s|\.|\?|,|!)/
);


/**
 * Generic Regular Expression to match message end, spacer or punctuation.
 */
const MSG_END_OR_SPACER = (
	/(?:$|\s|\.|\?|,|!)/
);


/**
 * Joins multiple Regular Expressions into one, extracting the first non-empty flag as main.
 */
export const compose = (inputs: Array<RegExp>) => (
	new RegExp(inputs.map(i => i.source).join(''), inputs.find(i => i.flags.length > 0)?.flags)
);


/**
 * Wraps given RegExp, making it match as a phrase anywhere in the text.
 * Example: matchPart(/test/) will match 'oh test!', 'test, oh!' and 'oh, test, ah'.
 */
export const matchPart = (input: RegExp) => (
	compose([ MSG_START_OR_SPACER, input, MSG_END_OR_SPACER ])
);


/**
 * Wraps given RegExp, making it match as a full text phrase.
 * Example: matchFull(/test/) will match 'test!', 'test?' but not 'oh, test?' or 'test oh!'.
 */
export const matchFull = (input: RegExp) => (
	compose([ MSG_START, input, MSG_END ])
);


/**
 * Wraps given RegExp, making it match the beginning of the message.
 * Example: matchStart(/test/) will match 'test ho!' and 'test' but not 'oh test!'.
 */
export const matchStart = (input: RegExp) => (
	compose([ MSG_START, input, MSG_END_OR_SPACER ])
);


/**
 * Wraps given RegExp, making it match the end of the message (including possible trailing punctuation).
 * Example: matchEnd(/test/) will match 'oh test!' and 'test', but not 'test, oh?'.
 */
export const matchEnd = (input: RegExp) => (
	compose([ MSG_START_OR_SPACER, input, MSG_END ])
);
