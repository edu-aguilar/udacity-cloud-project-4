import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB }  from 'aws-sdk'
import { v4 as generateRandomUUID } from "uuid";

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'

const docClient = new DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TODO: Implement creating a new TODO item

  const newTodoItem: TodoItem = {
    ...newTodo,
    userId: '12345',  // GET USERID FROM JWT
    todoId: generateRandomUUID(),
    createdAt: new Date().toISOString(),
    done: false
  }

  const result = await createTodo(newTodoItem)

  console.log(result);
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({item: newTodoItem})
  }
}

const createTodo = async (todo: TodoItem) => {
  await docClient.put({
    TableName: todosTable,
    Item: todo
  }).promise()
}
