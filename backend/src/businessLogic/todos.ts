import { TodoItem } from './../models/TodoItem';
import { TodosAccess } from './../dataLayer/todosAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';

import { v4 as generateRandomUUID } from "uuid";

const todosAccess = new TodosAccess()

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosByUserId(userId)
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