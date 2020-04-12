import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDB } from 'aws-sdk';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

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

  async getTodoById(todoId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName : this.todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: {
          ':todoId': todoId
      }
    }).promise()

    const todo = result.Items[0]
    return todo as TodoItem
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return todo as TodoItem
  }

  async deleteTodo(userId: string, todoId: string) {
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        "userId": userId,
        "todoId": todoId
      }
    }).promise()
  }

  async updateTodoFromUser(todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<TodoItem> {
    const result = await this.docClient.update({
      TableName : this.todosTable,
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

    return result.Attributes as TodoItem
  }
}
