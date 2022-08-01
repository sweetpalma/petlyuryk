/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import { last } from 'lodash';
import { NeuralCorpus } from '..';


/**
 * Sourced from: https://github.com/wjclub/telegram-bot-getids
 */
const ages: {[key: number]: number} = {
	2768409: 1383264000000,
	7679610: 1388448000000,
	11538514: 1391212000000,
	15835244: 1392940000000,
	23646077: 1393459000000,
	38015510: 1393632000000,
	44634663: 1399334000000,
	46145305: 1400198000000,
	54845238: 1411257000000,
	63263518: 1414454000000,
	101260938: 1425600000000,
	101323197: 1426204000000,
	111220210: 1429574000000,
	103258382: 1432771000000,
	103151531: 1433376000000,
	116812045: 1437696000000,
	122600695: 1437782000000,
	109393468: 1439078000000,
	112594714: 1439683000000,
	124872445: 1439856000000,
	130029930: 1441324000000,
	125828524: 1444003000000,
	133909606: 1444176000000,
	157242073: 1446768000000,
	143445125: 1448928000000,
	148670295: 1452211000000,
	152079341: 1453420000000,
	171295414: 1457481000000,
	181783990: 1460246000000,
	222021233: 1465344000000,
	225034354: 1466208000000,
	278941742: 1473465000000,
	285253072: 1476835000000,
	294851037: 1479600000000,
	297621225: 1481846000000,
	328594461: 1482969000000,
	337808429: 1487707000000,
	341546272: 1487782000000,
	352940995: 1487894000000,
	369669043: 1490918000000,
	400169472: 1501459000000,
	805158066: 1563208000000,
	1974255900: 1634000000000,
};


const getDate = (userId: number) => {
	const ids = Object.keys(ages).map(id => parseInt(id));
	const baseId = ids[0];
	if (userId < baseId) {
		return new Date(ages[baseId]);
	}
	if (userId > last(ids)!) {
		return new Date(ages[last(ids)!]);
	}
	for (const id of ids) {
		if (userId <= id) {
			// const lage = ages[baseId];
			// const uage = ages[id];
			// const rate = (id - baseId) / (userId - baseId);
			// const date = Math.floor(rate * (uage - lage) + lage);
			// console.log(lage, uage, rate, date);
			return new Date(ages[id]);
		}
	}
	// Sometimes TS can't figure out that function will never return undefined:
	throw new Error;
};


export default new NeuralCorpus({
	name: 'Ukrainian Market',
	locale: 'uk-UA',
	data: [
		{
			intent: 'age',
			utterances: [
				'дата',
				'дата створення',
				'вік акаунту',
				'вік',
			],
			async handler(nlp, response) {
				const { replyTo, user } = response.activity.conversation.sourceEvent;
				if (!replyTo) {
					const id = parseInt(user.id);
					response.answer = `Приблизна дата створення вашого акаунту - ${getDate(id).toLocaleDateString('uk-UA')}.`;
				} else if (replyTo.isAdressedToBot) {
					response.answer = 'Приблизна дата створення цього акаунту - 22.05.1879.';
				} else {
					const id = parseInt(replyTo.userId);
					response.answer = `Приблизна дата створення цього акаунту - ${getDate(id).toLocaleDateString('uk-UA')}.`;
				}
			},
		},
	],
});
