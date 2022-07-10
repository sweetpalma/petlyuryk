/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */


/**
 * Generic chat information.
 */
export interface ControllerChat {
	id: string;
	title?: Optional<string>;
	isGroup: boolean;
}


/**
 * Generic user information.
 */
export interface ControllerUser {
	id: string;
	username?: Optional<string>;
	firstName?: Optional<string>;
	lastName?: Optional<string>;
}


/**
 * Generic controller request.
 */
export interface ControllerRequest {
	id: string;
	chat: ControllerChat;
	user: ControllerUser;
	text: string;
	isBotTrigger: boolean;
	replyTo?: Optional<{
		isAdressedToBot: boolean;
		userId: string;
		messageText: string;
		messageId: string;
	}>;
}


/**
 * Generic controller response.
 */
export interface ControllerResponse {
	intent: string;
	text: string;
	replyTo?: Optional<{
		messageId: string;
	}>;
}


/**
 * Controller middleware handler.
 */
export interface ControllerHandler {
	(req: ControllerRequest, stopProcessing: () => void): Promise<ControllerResponse | void> | ControllerResponse | void;
}


/**
 * Generic middleware pipeline request processor.
 */
export class Controller {
	private handlers: Array<ControllerHandler> = [];

	/**
	 * Add new controller middleware.
	 */
	public addHandler(handler: ControllerHandler) {
		this.handlers.push(handler);
	}

	/**
	 * Run request through middleware pipeline and get the response (or null).
	 */
	public async process(request: ControllerRequest) {
		let shouldStop = false;
		const stopProcessing = () => {
			shouldStop = true;
		};
		for (const handler of this.handlers) {
			const response = await handler(request, stopProcessing);
			if (response) {
				return response;
			}
			if (shouldStop) {
				break;
			}
		}
		// no response is found, return
		return null;
	}
}


/**
 * Generic middleware pipeline request processor, adapted for Jest tests.
 */
export class ControllerTest extends Controller {
	public override async process(request: Partial<ControllerRequest>) {
		return super.process({
			id: '1234567890',
			isBotTrigger: true,
			text: 'Test Text',
			chat: {
				id: '1234567890',
				title: 'Test Chat',
				isGroup: false,
			},
			user: {
				id: '1234567890',
				username: 'TestUser',
				firstName: 'Test',
				lastName: 'User',
			},
			...request,
		});
	}
}
