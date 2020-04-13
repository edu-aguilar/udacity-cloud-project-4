import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getUserId } from '../utils'
import { getTodosByUserId } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GET_TODOS')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId: string = getUserId(event)
  let todos = []

  logger.info(`fetching todos for user ${userId}`)
  todos = await getTodosByUserId(userId)

  if (todos.length !== 0) {
    logger.info('Fetch todos successfully')
  } else {
    logger.info('error fetching todos')
  }
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({items: todos})
  }
}
