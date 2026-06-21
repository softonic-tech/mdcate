import client from "./client";

export const registerDevice = (data) => client.post("/devices/register", data);
export const getUserDevices = () => client.get("/devices");
export const deleteDevice = (id) => client.delete(`/devices/${id}`);
