import { TodoItem } from './../models/TodoItem';
import { TodosAccess } from './../dataLayer/todosAccess';

const todosAccess = new TodosAccess()

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  return todosAccess.getTodosByUserId(userId)
}