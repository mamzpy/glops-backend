import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DeviceJwtPayload } from '../../modules/auth/types/device-jwt-payload.type';
import { RequestWithDevice } from '../../modules/auth/types/request-with-device.type';

export const CurrentDevice = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DeviceJwtPayload => {
    const request = context.switchToHttp().getRequest<RequestWithDevice>();
    return request.device;
  },
);
