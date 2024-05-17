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

      console.log(error);

      const errorDetails =
        error instanceof Object ? { ...error } : { message: error };

      client.emit('dataError', { event: 'dataError', ...errorDetails });
    }
    const cookies = client.handshake.headers.cookie;

    if (!cookies) {
      client.emit('disconnectionError', 'Unauthorized access');
      client.disconnect();
    }

    const accessToken = getToken(cookies!);

    if (!accessToken) {
      client.emit('disconnectionError', 'Unauthorized access');
      client.disconnect();
    }

    const user = await this.authService.verifyTokenForSocket(accessToken!);

    if (!user) {
      client.emit('disconnectionError', 'Unauthorized access');
      client.disconnect();
    }
  }
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

  console.log(accessToken, 'hhhhh');

  return accessToken;
}
