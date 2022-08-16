import 'source-map-support/register'
import { TodosAccess } from '../dataLayer/todosAcess'
import { TodosStorage } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`getTodos with user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  logger.info(`createTodo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest) {
  logger.info(`updateTodo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate: updateTodoRequest })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Not found')  

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  
  }

  todosAccess.updateTodoItem(userId, todoId, updateTodoRequest as TodoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`deleteTodo ${todoId} for user ${userId}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Not found')  

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
    throw new Error('User is not authorized to delete item')  
  }

  todosAccess.deleteTodoItem(userId, todoId)
}

export async function updateAttachmentUrl(userId: string, todoId: string, attachmentId: string) {
  logger.info(`updateAttachmentUrl ${attachmentId}`)

  const attachmentUrl = await todosStorage.getAttachmentUrl(attachmentId)

  logger.info(`updateTodo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(userId, todoId)

  if (!item)
    throw new Error('Not found')  

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item')  
  }

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function generateUploadUrl(attachmentId: string): Promise<string> {
  logger.info(`generateUploadUrl ${attachmentId}`)

  const uploadUrl = await todosStorage.getUploadUrl(attachmentId)

  return uploadUrl
}