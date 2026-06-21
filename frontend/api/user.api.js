import client from "./client";

export const getProfileApi = () => client.get("/profile");
export const uploadProfilePicApi = (formData) =>
  client.post("/profile/pic", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const updateProfilePicApi = (formData) =>
  client.put("/profile/pic", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteProfilePicApi = () => client.delete("/profile/pic");

export const getBioApi = () => client.get("/users/bio");
export const updateBioApi = (bio) => client.put("/users/bio", { bio });
export const deleteBioApi = () => client.delete("/users/bio");

export const getAcademicApi = () => client.get("/users/academic");
export const updateAcademicApi = (data) => client.put("/users/academic", data);
export const deleteAcademicApi = () => client.delete("/users/academic");

export const getAllUsersApi = (params) => client.get("/users/all", { params });
export const updateUserRoleApi = (id, role) => client.put(`/users/${id}/role`, { role });
