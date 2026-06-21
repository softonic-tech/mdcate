import client from "./client";

// GET USER PROFILE
export const getProfileApi = () => client.get("/profile");

// UPLOAD PROFILE PIC
export const uploadProfilePicApi = (formData) =>
  client.post("/profile/pic", formData);

// UPDATE PROFILE PIC (replace)
export const updateProfilePicApi = (formData) =>
  client.put("/profile/pic", formData);

// DELETE PROFILE PIC
export const deleteProfilePicApi = () =>
  client.delete("/profile/pic");
