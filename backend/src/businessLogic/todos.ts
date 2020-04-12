import { TodoItem } from './../models/TodoItem';
import { TodosAccess } from './../dataLayer/todosAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { S3 } from 'aws-sdk'

import { v4 as generateRandomUUID } from "uuid"
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const bucketName = process.env.TODOS_IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
const s3 = new S3({
  signatureVersion: 'v4' // Use Sigv4 algorithm
})

const todosAccess = new TodosAccess()

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {

  return todosAccess.getTodosByUserId(userId)
}

export async function getTodoById(todoId: string): Promise<TodoItem> {

  return todosAccess.getTodoById(todoId)
}

export async function createTodo(todo: CreateTodoRequest, userId: string) {

  const newTodoItem: TodoItem = {
    ...todo,
    userId,
    todoId: generateRandomUUID(),
    createdAt: new Date().toISOString(),
    done: false
  }

  return todosAccess.createTodo(newTodoItem)
}

export async function deleteTodo(userId: string, todoId: string) {

  return todosAccess.deleteTodo(userId, todoId)
}

export async function generateSignedUrl(todo: TodoItem) {

  const imageId = generateRandomUUID()
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })

  const imgUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

  const todoToUpdate: TodoItem = {
    ...todo,
    attachmentUrl: imgUrl
  }

  await updateExistingTodo(todoToUpdate)

  return signedUrl
}

export async function updateTodoFromUser(todoId: string, userId: string, updatedTodo: UpdateTodoRequest) {
  
  return todosAccess.updateTodoFromUser(todoId, userId, updatedTodo)
}

async function updateExistingTodo(todoToUpdate: TodoItem) {

  return todosAccess.createTodo(todoToUpdate)
}
