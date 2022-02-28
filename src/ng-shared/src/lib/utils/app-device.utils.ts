import { AppDevice, AppDeviceKey } from '@solargis/types/user-company';

export function getAppDeviceKey(appDevice: AppDevice): AppDeviceKey {
  return {
    app: appDevice.app,
    sgCompanyId: appDevice.company.sgCompanyId,
    sgAccountId: appDevice.user.sgAccountId,
    osFingerprint: appDevice.device.osFingerprint
  };
}

export function getAppDeviceKeyId(appDevice: AppDevice): string {
  return Object.values(getAppDeviceKey(appDevice)).join(',');
}
