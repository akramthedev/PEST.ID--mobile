import * as Device from 'expo-device';

export default function getDeviceInfo() {
    return {
        brand: Device.brand,
        model: Device.modelName,
        os: Device.osName,
        osVersion: Device.osVersion,
        deviceType: Device.deviceType,
    };
}
