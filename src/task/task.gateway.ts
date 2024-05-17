import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { TaskService } from './task.service';
import { Socket, Server } from 'socket.io';
import { CreateTaskDto } from './dto/task.dto';
import { UseFilters } from '@nestjs/common';
import { WebsocketExceptionsFilter } from './task.exception';
import { AuthService } from '../auth/auth.service';
import { parse } from 'cookie';

@WebSocketGateway(3002)
@UseFilters(WebsocketExceptionsFilter) // filter exceptions
export class TaskGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly taskService: TaskService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(socket: Socket) {
    await this.getUserFromSocket(socket);
  }

  @SubscribeMessage('createTask')
  async createTask(
    @MessageBody() data: CreateTaskDto,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);
    console.log(user);

    const newTask = await this.taskService.createTask(data);
    this.server.sockets.emit('createTask', { ...newTask });
  }

  @SubscribeMessage('readTask')
  async readTask(
    @MessageBody('taskId') taskId: number,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);
    console.log(user);

    const task = await this.taskService.getTask(taskId, user.id);
    this.server.sockets.emit('readTask', { ...task });
  }

  @SubscribeMessage('updateTask')
  async updateTask(
    @MessageBody('taskId') taskId: number,
    @ConnectedSocket() clientSocket: Socket,
  ) {
    const user = await this.taskService.getUserFromSocket(clientSocket);
    console.log(user);

    const task = await this.taskService.getTask(taskId, user.id);
    this.server.sockets.emit('readTask', { ...task });
  }

  private async getUserFromSocket(socket: Socket) {
    const cookie = socket.request.headers.cookie;

    if (!cookie) {
      throw new WsException('Unauthorized access');
    }

    // 'authenticationNiyo' is the name of the cookie.
    /** @see {@link AuthService.getUserloginToken}  */
    const { authenticationNiyo: authenticationToken } = parse(cookie);

    const user =
      await this.authService.verifyTokenForSocket(authenticationToken);

    if (!user) {
      throw new WsException('Invalid credentials.');
    }
    return user;
  }
}
