export type ControllerEvent = (
	PetlyurykMessageIn | PetlyurykMessageOut
);


export type ControllerEventNarrow<T, N> = (
	T extends { type: N } ? T : never
);


export type ControllerHandler<T extends ControllerEvent = ControllerEvent> = {
	(event: T, stopProcessing: () => void): void | Promise<void>;
};


export class Controller {
	private readonly handlers: {[key: string]: undefined | Array<ControllerHandler>} = {};

	public on<E extends ControllerEvent, T extends E['type']>(type: T, handler: ControllerHandler<ControllerEventNarrow<E, T>>) {
		const handlers = this.handlers[type] = this.handlers[type] || [];
		handlers.push(handler as ControllerHandler);
	}

	public async trigger(event: ControllerEvent) {
		const handlers = this.handlers[event.type] || [];
		for (const handler of handlers) {
			let shouldStop = false;
			await handler(event, () => {
				shouldStop = true;
			});
			if (shouldStop) {
				break;
			}
		}
	}
}


export class ControllerTest extends Controller {
	public lastMessageIn?: PetlyurykMessageIn;
	public lastMessageOut?: PetlyurykMessageOut;

	constructor() {
		super();
		this.on('messageIn', async (event) => {
			this.lastMessageIn = event;
		});
		this.on('messageOut', async (event) => {
			this.lastMessageOut = event;
		});
	}

	async messageIn(event: Partial<PetlyurykMessageIn>) {
		await this.trigger({
			type: 'messageIn',
			id: '1234567890',
			text: 'Test Text',
			private: false,
			chat: {
				chatName: 'Test Chat',
				chatId: '1234567890',
			},
			from: {
				userName: 'TestUser',
				userId: '1234567890',
			},
			...event,
		});
	}
}
