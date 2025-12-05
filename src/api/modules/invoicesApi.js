import { httpClient } from "../httpClient";

export function getLastInvoiceId() {
  return httpClient.get("/invoice/last-id");
}

export function getInvoicesNumbers() {
  return httpClient.get("/invoice/sales-invoices");
}

export function createInvoice(invoice) {
  return httpClient.post("/invoice/", invoice);
}

export function getInvoices({ type, page, page_size, all = false }) {
  if (all) {
    return httpClient.get(`/invoice/${type}?all=true`);
  }
  return httpClient.get(
    `/invoice/${type}?page=${page + 1}&page_size=${page_size}&all=false`
  );
}

export function updateInvoice({ id, ...body }) {
  return httpClient.put(`/invoice/${id}`, body);
}

export function deleteInvoice(id) {
  return httpClient.delete(`/invoice/${id}`);
}

export function confirmInvoice(id) {
  return httpClient.post(`/invoice/${id}/confirm`);
}

export function confirmTalabSheraaInvoice({ id, ...body }) {
  return httpClient.post(
    `/invoice/${id}/PurchaseRequestConfirmation`,
    body
  );
}

export function refreshInvoice(id) {
  return httpClient.get(`/invoice/updateprice/${id}`);
}

export function returnWarrantyInvoice({ id, ...body }) {
  return httpClient.post(`/invoice/${id}/ReturnWarranty`, body);
}

export function getWarrantyReturnStatus(id) {
  return httpClient.get(`/invoice/${id}/WarrantyReturnStatus`);
}

export function priceReport(id) {
  return httpClient.get(`/invoice/price-report/${id}`);
}

export function getInvoice(id) {
  return httpClient.get(`/invoice/${id}`);
}

export function detailsReport(id) {
  return httpClient.get(`/invoice/fifo-prices/${id}`);
}
