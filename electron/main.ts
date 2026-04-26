import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import db, {
  completeSale,
  getSalesHistory,
  getSalesSummary,
  getSaleItems,
  getReportsSummary,
  restockProduct,
  getRestockHistory,
  addSupplier,
  getSuppliers,
  loginUser,
  getUsers,
  addUser,
  getSettings,
  updateSettings,
  updateProduct,
  deleteProduct,
  addAuditLog,
  getAuditLogs,
  changePassword,
} from "../database/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ubuntu/Linux graphics fix
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("ozone-platform", "x11");

let mainWindow: BrowserWindow | null = null;

ipcMain.handle("sales:items", (_event, saleId) => {
  return getSaleItems(saleId);
});

ipcMain.handle("products:getAll", () => {
  const products = db.prepare("SELECT * FROM products").all();
  console.log("Products sent to UI:", products);
  return products;
});

ipcMain.handle("auth:changePassword", (_event, data) => {
  return changePassword(data);
});

ipcMain.handle("reports:summary", (_event, period) => {
  return getReportsSummary(period);
});

ipcMain.handle("stock:restock", (_event, restock) => {
  return restockProduct(restock);
});

ipcMain.handle("settings:get", () => {
  return getSettings();
});

ipcMain.handle("audit:add", (_event, log) => {
  return addAuditLog(log);
});

ipcMain.handle("audit:getAll", () => {
  return getAuditLogs();
});

ipcMain.handle("products:update", (_event, product) => {
  return updateProduct(product);
});

ipcMain.handle("products:delete", (_event, id) => {
  return deleteProduct(id);
});

ipcMain.handle("settings:update", (_event, settings) => {
  return updateSettings(settings);
});

ipcMain.handle("suppliers:add", (_event, supplier) => {
  return addSupplier(supplier);
});

ipcMain.handle("auth:login", (_event, credentials) => {
  return loginUser(credentials.username, credentials.password);
});

ipcMain.handle("users:getAll", () => {
  return getUsers();
});

ipcMain.handle("users:add", (_event, user) => {
  return addUser(user);
});

ipcMain.handle("suppliers:getAll", () => {
  return getSuppliers();
});

ipcMain.handle("stock:history", () => {
  return getRestockHistory();
});

ipcMain.handle(
  "products:add",
  (
    _event,
    product: {
      name: string;
      brand: string;
      price: number;
      quantity: number;
      unit: string;
      batch_number: string;
      expiry_date: string;
      barcode: string;
      requires_prescription: boolean;
    }
  ) => {
    const stmt = db.prepare(`
      INSERT INTO products 
      (name, brand, price, quantity, unit, batch_number, expiry_date, barcode, requires_prescription)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      product.name,
      product.brand,
      product.price,
      product.quantity,
      product.unit,
      product.batch_number,
      product.expiry_date,
      product.barcode,
      product.requires_prescription ? 1 : 0
    );
  }
);
function createWindow() {
  const preloadPath = path.join(process.cwd(), "electron/preload.cjs");

  console.log("Preload path:", preloadPath);

    mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "MedTrack POS",
    icon: path.join(process.cwd(), "assets/icon.png"),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadURL("http://localhost:5173");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.handle("sale:complete", async (_event, cart) => {
  const saleId = completeSale(cart);
  return { success: true, saleId };
});

ipcMain.handle("sales:summary", () => {
  return getSalesSummary();
});

ipcMain.handle("sales:history", () => {
  return getSalesHistory();
});