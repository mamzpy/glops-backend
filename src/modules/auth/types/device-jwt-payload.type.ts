export type DeviceJwtPayload = {
  readonly sub: string;
  readonly deviceId: string;
  readonly stationId: string;
  readonly type: string;
};
