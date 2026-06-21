import Device from "../models/device.model.js";

export const registerDeviceService = async (data) => {
  const exists = await Device.findOne({
    userId: data.userId,
    deviceId: data.deviceId,
  });
  if (exists) {
    exists.lastSyncAt = new Date();
    if (data.pushToken) exists.pushToken = data.pushToken;
    return exists.save();
  }
  return Device.create(data);
};

export const getUserDevicesService = async (userId) => {
  return Device.find({ userId });
};

export const removeDeviceService = async (id, userId) => {
  return Device.findOneAndDelete({ _id: id, userId });
};
