import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDB } from 'aws-sdk';

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = new DynamoDB.DocumentClient,
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIdIndex = process.env.TODOS_ID_INDEX) { }

  async getTodosByUserId(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName : this.todosTable,
      IndexName : this.todosIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
        }
    }).promise()

    const todos = result.Items
    return todos as TodoItem[]
  }
}
