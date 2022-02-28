import { AppDeviceKey, UpdateAppDeviceOpts } from '@solargis/types/user-company';

export interface UpdateAppDeviceRequest {
  key: AppDeviceKey;
  update: UpdateAppDeviceOpts;
}
