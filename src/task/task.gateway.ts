import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { TaskService } from './task.service';
import { Socket, Server } from 'socket.io';
import { CreateTaskDto, TaskQueryDto, UpdateTaskDto } from './dto/task.dto';

import {
  ParseIntPipe,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { WebsocketExceptionsFilter } from './task.exception';

/**
 * A web socket gateway class for `Tasks` CRUD operations
 */
@WebSocketGateway({ namespace: 'api/sockets' })
@UseFilters(WebsocketExceptionsFilter) // filter exceptions
@UsePipes(new ValidationPipe({ transform: true }))
export class TaskGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly taskService: TaskService) {}

  /** first point of contact before any bi-directional communication is established */
  async handleConnection(socket: Socket) {
    const user = await this.taskService.getUserFromSocket(socket);

    // This condition can be removed if the client application restricts task views
    // to only authorized users.

    if (!user) {
      socket.emit('disconnectionError', {
        event: 'disconnectionError',
        message: 'Unauthorized access',
      });

      socket.disconnect();
    }
  }

  /**
   * socket method for creating tasks. streams to clients listening on
   * `createTask` and `readAllTasks` pattern. For the `readAllTasks`, the data
   * is paginated.
   */
  @SubscribeMessage('createTask')
  async createTask(
    @MessageBody() data: CreateTaskDto,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);

    const newTask = await this.taskService.createTask(data);

    if (!newTask) {
      clientSocket.emit('dataError', {
        message: 'Task could not be created. User does not exist',
      });
      return;
    }

    const eventObj = {
      message: 'Task created successfully',
      task: newTask,
    };

    clientSocket.emit('createTask', eventObj);

    // stream user tasks
    const tasks = await this.taskService.getPagedUserTasks(user!.id, {
      pageNumber: 1,
      pageSize: 10,
    });

    clientSocket.emit('readAllTasks', { ...tasks });
  }

  /**
   * socket method for creating tasks. streams to clients listening on
   * `readTask` pattern
   */
  @SubscribeMessage('readTask')
  async readTask(
    @MessageBody('taskId', ParseIntPipe) taskId: number,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);

    const task = await this.taskService.getTask(taskId, user!.id);

    const data = task ?? { message: `Task with id ${taskId}, was not found` };

    clientSocket.emit('readTask', { ...data });
  }

  /**
   * socket method for reading paginated tasks. streams to clients listening on
   * `readAllTasks` pattern. the data is paginated, but the number of results, page number,
   * and filter query are determined by the client. If no query is provided, the default values
   * are used.
   */
  @SubscribeMessage('readAllTasks')
  async readAllTasks(
    @MessageBody() tasksQuery: TaskQueryDto,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);

    const tasks = await this.taskService.getPagedUserTasks(
      user!.id,
      tasksQuery,
    );

    clientSocket.emit('readAllTasks', { ...tasks });
  }

  /**
   * socket method for updating tasks. streams to clients listening on
   * `updateTask` and `readAllTasks` pattern. For the `readAllTasks`, the data
   * is paginated, but only the first 10 tasks and the first page.
   */
  @SubscribeMessage('updateTask')
  async updateTask(
    @MessageBody('taskId') taskId: number,
    @MessageBody() data: UpdateTaskDto,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);

    console.log(data, taskId);

    const isUpdated = await this.taskService.updateTask(taskId, user!.id, data);

    const message = isUpdated
      ? { message: 'Update successful' }
      : { error: `Task with id ${taskId}, not found` };

    clientSocket.emit('updateTask', message);

    // stream user tasks
    const tasks = await this.taskService.getPagedUserTasks(user!.id, {
      pageNumber: 1,
      pageSize: 10,
    });

    clientSocket.emit('readAllTasks', { ...tasks });
  }

  /**
   * socket method for deleting tasks. streams to clients listening on
   * `deleteTask` and `readAllTasks` pattern. For the `readAllTasks`, the data
   * is paginated, but only the first 10 tasks and the first page.
   */
  @SubscribeMessage('deleteTask')
  async deleteTask(
    @MessageBody('taskId', ParseIntPipe) taskId: number,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);

    const taskDeleted = await this.taskService.deleteTask(taskId, user!.id);

    console.log(taskDeleted);

    const deleteMessage = taskDeleted
      ? 'Task deleted successfully'
      : `Task with id ${taskId}, was not found`;

    clientSocket.emit('deleteTask', { message: deleteMessage });

    const tasks = await this.taskService.getPagedUserTasks(user!.id, {
      pageNumber: 1,
      pageSize: 10,
    });

    clientSocket.emit('readAllTasks', { ...tasks });
  }
}
