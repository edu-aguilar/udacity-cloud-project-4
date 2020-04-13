import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodoFromUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('UPDATE_TODO')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId: string = getUserId(event)
  const updateTodoReq: UpdateTodoRequest = JSON.parse(event.body)

  logger.info(`updating ${todoId} from user ${userId}`)
  const updatedTodo = await updateTodoFromUser(todoId, userId, updateTodoReq)
  
  if (Object.keys(updatedTodo).length === 0) {
    logger.info('Error updating todo')
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'ToDo not found'
      })
    }
  }
  
  logger.info('Todo updated successfully: ', JSON.stringify(updatedTodo))
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
