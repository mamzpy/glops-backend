import { Request } from 'express';
import { DeviceJwtPayload } from './device-jwt-payload.type';

export type RequestWithDevice = Request & {
  device: DeviceJwtPayload;
};
