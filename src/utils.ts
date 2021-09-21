export const regexPhrase = (input: string | RegExp, flags = 'i') => {
	const regexFlags = input instanceof RegExp ? input.flags : flags;
	const regexSource = input instanceof RegExp ? input.source : input;
	return new RegExp('(^|\\s)' + regexSource + '($|\\s|\\.|,|!)', regexFlags);
};

export const regexNamed = (input: string | RegExp, flags = 'i') => {
	const regexFlags = input instanceof RegExp ? input.flags : flags;
	const regexSource = input instanceof RegExp ? input.source : input;
	return new RegExp('Петлюрику?,? ' + regexSource, regexFlags);
};
