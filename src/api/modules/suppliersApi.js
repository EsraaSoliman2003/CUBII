import { httpClient } from "../httpClient";

export function getSuppliers({ page, page_size, all = false }) {
  const queryParams = all
    ? "all=true"
    : `page=${page + 1}&page_size=${page_size}&all=false`;

  return httpClient.get(`/supplier/?${queryParams}`);
}

export function addSupplier(newSupplier) {
  return httpClient.post("/supplier/", newSupplier);
}

export function updateSupplier({ id, ...patch }) {
  return httpClient.put(`/supplier/${id}`, patch);
}

export function deleteSupplier(id) {
  return httpClient.delete(`/supplier/${id}`);
}

export function importSupplier(data) {
  return httpClient.post("/supplier/excel", { data });
}
