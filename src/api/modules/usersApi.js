import { httpClient } from "../httpClient";

export function getUsers({ page, page_size, all = false }) {
  const queryParams = all
    ? "all=true"
    : `page=${page + 1}&page_size=${page_size}&all=false`;

  return httpClient.get(`/auth/users?${queryParams}`);
}

export function getCurrentUser() {
  return httpClient.get("/auth/user");
}

export function updateUser({ id, ...patch }) {
  return httpClient.put(`/auth/user/${id}`, patch);
}

export function deleteUser(id) {
  return httpClient.delete(`/auth/user/${id}`);
}

export function addUser(newUser) {
  return httpClient.post("/auth/register", newUser);
}

export function changePassword({ id, ...newUser }) {
  return httpClient.post(`/auth/user/${id}/change-password`, newUser);
}
