import { httpClient } from "../httpClient";

export function getMechanisms({ page, page_size, all = false }) {
  const queryParams = all
    ? "all=true"
    : `page=${page + 1}&page_size=${page_size}&all=false`;

  return httpClient.get(`/mechanism/?${queryParams}`);
}

export function addMechanism(newMechanism) {
  return httpClient.post("/mechanism/", newMechanism);
}

export function updateMechanism({ id, ...patch }) {
  return httpClient.put(`/mechanism/${id}`, patch);
}

export function deleteMechanism(id) {
  return httpClient.delete(`/mechanism/${id}`);
}

export function importMechanism(data) {
  return httpClient.post("/mechanism/excel", { data });
}
