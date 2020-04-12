import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB } from 'aws-sdk'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const docClient = new DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const userId: string = getUserId(event)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const result = await docClient.update({
    TableName : todosTable,
    Key: {
      "todoId": todoId,
      "userId": userId
    },
    UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeValues: {
      ":name": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done
    },
    ExpressionAttributeNames: {
      "#n": 'name'
    },
    ReturnValues:"UPDATED_NEW"
  }).promise()

  // 3 - devolver 404 si no lo encuentra
  console.log(`updated record: ${JSON.stringify(result)}`)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
