import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import constants from '../auth/constants';
import { AuthService } from '../auth/auth.service';

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  constructor(private readonly authService: AuthService) {
    super();
  }
  public catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient<Socket>();

    this.handleClientError(client, exception);
  }

  async handleClientError(
    client: Socket,
    exception: WsException | HttpException,
  ): Promise<void> {
    if (exception instanceof HttpException) {
      const error = exception.getResponse();

      const errorDetails =
        error instanceof Object ? { error: { ...error } } : { error: error };

      client.emit('dataError', { event: 'dataError', ...errorDetails });
    }
    const cookies = client.handshake.headers.cookie;

    if (!cookies) {
      emitDisconnectionErrorAndDisconnect(client);
    }

    const accessToken = getToken(cookies!);

    if (!accessToken) {
      emitDisconnectionErrorAndDisconnect(client);
    }

    const user = await this.authService.verifyTokenForSocket(accessToken!);

    if (!user) {
      emitDisconnectionErrorAndDisconnect(client);
    }
  }
}

function emitDisconnectionErrorAndDisconnect(client: Socket) {
  client.emit('disconnectionError', {
    event: 'disconnectionError',
    message: 'Unauthorized access',
  });
  client.disconnect();
}

function getToken(cookieString: string) {
  // 'authenticationNiyo' is the name of the cookie.
  /** @see {@link AuthService.getUserloginToken}  */

  // only one cookie in the header
  if (!cookieString.includes(';')) {
    return cookieString.includes(constants.cookieName)
      ? cookieString.split('=')[1]
      : null;
  }

  // multiple cookies in header
  const accessToken = cookieString
    .split('; ')
    .find((cookie: string) => cookie.startsWith(constants.cookieName))
    ?.split('=')[1];

  return accessToken;
}
