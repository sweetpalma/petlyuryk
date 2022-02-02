/**
 * Part of Petlyuryk by SweetPalma, all rights reserved.
 * This code is licensed under GNU GENERAL PUBLIC LICENSE, check LICENSE file for details.
 */
import winston from 'winston';


const pickByTopic = (topic: string) => (
	winston.format((info, opts) => {
		return info.message.startsWith(topic) ? info : false;
	})()
);


const formatConsole = winston.format.combine(
	winston.format.timestamp(),
	winston.format.printf(({ level, timestamp, message, ...rest }) => {
	  const restString = JSON.stringify({ date: timestamp, ...rest }, undefined, 2);
	  return `${level} ${message} ${restString.length > 2 ? restString : ''}`;
	}),
);


const formatJSON = winston.format.combine(
	winston.format.timestamp(),
	winston.format.printf(({ level, timestamp,  message, ...rest }) => {
	  return JSON.stringify({ level, message, date: timestamp, ...rest });
	}),
);


const defaultFileSettings: winston.transports.FileTransportOptions = {
	// tailable: true,
	// maxsize: 1024 * 1024,
	// maxFiles: 32,
};


/**
 * Unified Petlyuryk logging system.
 */
export const logger = winston.createLogger({
	level: 'info',
	transports: process.env.NODE_ENV === 'test' ? [] : [

		// Console: Combined:
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				formatConsole,
			),
		}),

		// File: Combined:
		new winston.transports.File({
			...defaultFileSettings,
			filename: '/app/logs/combined.log',
			format: winston.format.combine(
				formatJSON,
			),
		}),

		// File: Combined:
		new winston.transports.File({
			...defaultFileSettings,
			level: 'error',
			filename: '/app/logs/error.log',
			format: winston.format.combine(
				formatJSON,
			),
		}),

		// File: Topic - Bot:
		new winston.transports.File({
			...defaultFileSettings,
			filename: '/app/logs/topic-bot.log',
			format: winston.format.combine(
				pickByTopic('bot'),
				formatJSON,
			),
		}),

		// File: Topic - Neural:
		new winston.transports.File({
			...defaultFileSettings,
			filename: '/app/logs/topic-neural.log',
			format: winston.format.combine(
				pickByTopic('neural'),
				formatJSON,
			),
		}),

	],
});