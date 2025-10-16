import winston from 'winston';

const formatConsole = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

export function uncaughtExceptionLogger() {
    winston.exceptions.handle(
        new winston.transports.Console({ format: formatConsole }),
        new winston.transports.File({ filename: 'uncaughtExceptions.log' })
    );
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
}

export function configWinstonLogger() {
    winston.addColors({
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        verbose: 'cyan',
        debug: 'blue',
        silly: 'white',
    });

    const transports = [
        new winston.transports.Console({
            format: formatConsole,
            level: 'debug',
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
        }),
    ];

    winston.configure({
        level: 'info',
        format: winston.format.json(),
        transports,
    });
}
