import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDB }  from 'aws-sdk'
import { v4 as generateRandomUUID } from "uuid";

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils';

const docClient = new DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Implement creating a new TODO item
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId: string = getUserId(event)

  const newTodoItem: TodoItem = {
    ...newTodo,
    userId,
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
