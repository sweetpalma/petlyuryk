declare interface PetlyurykMessageIn {
	type: 'messageIn';
	id: string;
	private: boolean;
	text: string;
	chat: {
		chatName: string;
		chatId: string;
	}
	from: {
		firstName?: string;
		lastName?: string;
		userName?: string;
		userId: string;
	};
	replyTo?: {
		bot: boolean;
		messageText: string;
		messageId: string;
	};
}

declare interface PetlyurykMessageOut {
	type: 'messageOut';
	intent: string;
	text: string;
	sourceText: string;
	metadata?: object;
	chat: {
		chatId: string;
	}
	replyTo?: {
		messageId: string;
	};
}


declare interface PetlyurykNeuralCorpus {
	name: string;
	locale: string;
	data: Array<{
		intent: string;
		utterances: Array<string>;
		answers: Array<string>;
	}>;
	entities?: {
		[key: string]: string | {
			options: {
				[option: string]: Array<string>;
			}
		}
	};
	contextData?: {
		[key: string]: {
			[option: string]: string | number | boolean;
		}
	}
}


declare interface PetlyurykNeuralResponse {
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
			sourceEvent: PetlyurykMessageIn;
			replyTo: string;
		};
	};
}

declare interface PetlyurykNeuralHandler {
	(_nlp: unknown, response: PetlyurykNeuralResponse): void | Promise<void>;
}


declare interface PetlyurykNeuralHandlerMap {
	[key: string]: Array<PetlyurykNeuralHandler>;
}
