import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { getTodoById, generateSignedUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('GENERATE_S3_UPLOAD_URL')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info(`Checking if todo ${todoId} exists`)
  const todo = await getTodoById(todoId)

  if (todo) {
    logger.info('Generate S3 URL and updating selected todo')
    const signedUrl = await generateSignedUrl(todo)
    
    logger.info('Todo updated successfully')
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }

  } else {
    logger.info('todo not found')
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
}
