import winston from 'winston';

export const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.colorize(),
		winston.format.json(),
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.timestamp(),
				winston.format.printf(({ timestamp, level, message, ...rest }) => {
		            let restString = JSON.stringify(rest, undefined, 2);
		            restString = restString === '{}' ? '' : restString;
		            return `[${timestamp}] ${level} - ${message} ${restString}`;
		          },
		        ),
			),
		}),
	],
});
