import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient() as WebSocket;
    const data = ctx.getData();
    const error = exception.getError();

    const details = error instanceof Object ? { ...error } : { message: error };
    console.log(details);

    client.send(
      JSON.stringify({
        event: 'error',
        data: {
          id: (client as any).id,
          rid: data.rid,
          ...details,
        },
      }),
    );
  }
}
