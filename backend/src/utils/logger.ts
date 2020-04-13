import { createLogger as _createLogger, format, transports } from 'winston'

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param loggerName - a name of a logger that will be added to all messages
 */
export function createLogger(loggerName: string) {
  return _createLogger({
    level: 'info',
    format: format.json(),
    defaultMeta: { name: loggerName },
    transports: [
      new transports.Console()
    ]
  })
}