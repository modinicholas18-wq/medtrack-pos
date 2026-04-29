console.log("PRELOAD LOADED");

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  getProducts: () => ipcRenderer.invoke("products:getAll"),
  addProduct: (product) => ipcRenderer.invoke("products:add", product),
  completeSale: (cart) => ipcRenderer.invoke("sale:complete", cart),
  getSalesSummary: () => ipcRenderer.invoke("sales:summary"),
  getSalesHistory: () => ipcRenderer.invoke("sales:history"),
  getSaleItems: (saleId) => ipcRenderer.invoke("sales:items", saleId),
  getReportsSummary: (period) => ipcRenderer.invoke("reports:summary", period),
  restockProduct: (restock) => ipcRenderer.invoke("stock:restock", restock),
  getRestockHistory: () => ipcRenderer.invoke("stock:history"),
  addSupplier: (supplier) => ipcRenderer.invoke("suppliers:add", supplier),
  getSuppliers: () => ipcRenderer.invoke("suppliers:getAll"),
  loginUser: (credentials) => ipcRenderer.invoke("auth:login", credentials),
  getUsers: () => ipcRenderer.invoke("users:getAll"),
  addUser: (user) => ipcRenderer.invoke("users:add", user),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (settings) => ipcRenderer.invoke("settings:update", settings),
  updateProduct: (product) => ipcRenderer.invoke("products:update", product),
  deleteProduct: (id) => ipcRenderer.invoke("products:delete", id),
  addAuditLog: (log) => ipcRenderer.invoke("audit:add", log),
  getAuditLogs: () => ipcRenderer.invoke("audit:getAll"),
  changePassword: (data) => ipcRenderer.invoke("auth:changePassword", data),
  createPurchaseInvoice: (invoice) =>
  ipcRenderer.invoke("purchaseInvoices:create", invoice),

  getPurchaseInvoices: () =>
    ipcRenderer.invoke("purchaseInvoices:getAll"),

  getPurchaseInvoiceItems: (invoiceId) =>
    ipcRenderer.invoke("purchaseInvoices:getItems", invoiceId),

  savePrescription: (data) =>
  ipcRenderer.invoke("prescriptions:save", data),
});