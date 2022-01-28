import winston from 'winston';


const defaultFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.printf(({ timestamp, level, message, ...rest }) => {
	  let restString = JSON.stringify(rest, undefined, 2);
	  restString = restString === '{}' ? '' : restString;
	  return `[${timestamp}] ${level} - ${message} ${restString}`;
	}),
);


export const logger = winston.createLogger({
	level: 'info',
	format: defaultFormat,
	transports: [
		new winston.transports.File({
			filename: './logs/combined.log',
		}),
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), defaultFormat),
		}),
	],
});
