import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "pharmacy.db");
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'Tablet',
    batch_number TEXT,
    expiry_date TEXT,
    barcode TEXT,
    requires_prescription INTEGER DEFAULT 0,
    buying_cost REAL DEFAULT 0
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    patient_phone TEXT,
    patient_age TEXT,
    patient_sex TEXT,
    patient_weight TEXT,
    allergies TEXT,
    allergy_reaction TEXT,
    pregnancy_status TEXT,
    diagnosis TEXT,
    doctor_name TEXT,
    medical_conditions TEXT,
    current_medicines TEXT,
    prescription_notes TEXT,
    safety_warnings TEXT,
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS prescription_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    brand TEXT,
    dose TEXT,
    frequency TEXT,
    duration TEXT,
    instructions TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total REAL NOT NULL,
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS sale_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sale_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_brand TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    line_total REAL NOT NULL,
    buying_cost REAL DEFAULT 0,
    profit REAL DEFAULT 0,
    FOREIGN KEY (sale_id) REFERENCES sales(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS restocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    supplier_name TEXT,
    quantity_added INTEGER NOT NULL,
    buying_cost REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS purchase_invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER,
    supplier_name TEXT,
    invoice_number TEXT,
    invoice_date TEXT,
    subtotal REAL DEFAULT 0,
    discount_total REAL DEFAULT 0,
    vat_total REAL DEFAULT 0,
    grand_total REAL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    brand TEXT,
    quantity INTEGER DEFAULT 0,
    bonus_quantity INTEGER DEFAULT 0,
    batch_number TEXT,
    expiry_date TEXT,
    pack_size TEXT,
    unit_cost REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    vat REAL DEFAULT 0,
    line_total REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(invoice_id) REFERENCES purchase_invoices(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'cashier',
    created_at TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    username TEXT,
    role TEXT,
    action TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
  )
`).run();

function addColumnIfMissing(columnName: string, columnDefinition: string) {
  const columns = db.prepare("PRAGMA table_info(products)").all() as any[];
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.prepare(`ALTER TABLE products ADD COLUMN ${columnDefinition}`).run();
  }
}

function addSaleItemColumnIfMissing(
  columnName: string,
  columnDefinition: string
) {
  const columns = db.prepare("PRAGMA table_info(sale_items)").all() as any[];
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.prepare(`ALTER TABLE sale_items ADD COLUMN ${columnDefinition}`).run();
  }
}

addColumnIfMissing("quantity", "quantity INTEGER DEFAULT 0");
addColumnIfMissing("unit", "unit TEXT DEFAULT 'Tablet'");
addColumnIfMissing("batch_number", "batch_number TEXT");
addColumnIfMissing("expiry_date", "expiry_date TEXT");
addColumnIfMissing("barcode", "barcode TEXT");
addColumnIfMissing(
  "requires_prescription",
  "requires_prescription INTEGER DEFAULT 0"
);
addColumnIfMissing("buying_cost", "buying_cost REAL DEFAULT 0");

addSaleItemColumnIfMissing("buying_cost", "buying_cost REAL DEFAULT 0");
addSaleItemColumnIfMissing("profit", "profit REAL DEFAULT 0");

const countResult = db
  .prepare("SELECT COUNT(*) as count FROM products")
  .get() as { count: number };

if (countResult.count === 0) {
  db.prepare(`
    INSERT INTO products 
    (name, brand, price, quantity, unit, batch_number, expiry_date, barcode, requires_prescription, buying_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Paracetamol",
    "Panadol",
    50,
    100,
    "Tablet",
    "BATCH001",
    "2027-12-31",
    "1234567890",
    0,
    20
  );
}

const userCount = db
  .prepare("SELECT COUNT(*) as count FROM users")
  .get() as { count: number };

if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);

  db.prepare(`
    INSERT INTO users
    (username, password, full_name, role, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    "admin",
    hashedPassword,
    "System Admin",
    "admin",
    new Date().toISOString()
  );
}

  const defaultSettings = [
    ["pharmacy_name", "Main Pharmacy"],
    ["branch_name", "Main Branch"],
    ["receipt_footer", "Thank you for shopping with us."],
    ["low_stock_threshold", "10"],
  ];

  for (const [key, value] of defaultSettings) {
    db.prepare(`
      INSERT OR IGNORE INTO app_settings (key, value)
      VALUES (?, ?)
    `).run(key, value);
  }

export function reduceStock(id: number, qty: number) {
  const product = db
    .prepare("SELECT quantity FROM products WHERE id = ?")
    .get(id) as any;

  if (!product) throw new Error("Product not found");

  if (Number(product.quantity) < Number(qty)) {
    throw new Error("Not enough stock");
  }

  db.prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?").run(
    qty,
    id
  );
}

export function completeSale(cart: any[]) {
  const saleTotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    const saleResult = db
      .prepare("INSERT INTO sales (total, created_at) VALUES (?, ?)")
      .run(saleTotal, now);

    const saleId = Number(saleResult.lastInsertRowid);

    for (const item of cart) {
      reduceStock(item.id, item.qty);

      const product = db
        .prepare("SELECT buying_cost FROM products WHERE id = ?")
        .get(item.id) as any;

      const buyingCost = Number(product?.buying_cost || 0);
      const unitPrice = Number(item.price);
      const quantity = Number(item.qty);
      const lineTotal = unitPrice * quantity;
      const profit = (unitPrice - buyingCost) * quantity;

      db.prepare(`
        INSERT INTO sale_items
        (sale_id, product_id, product_name, product_brand, quantity, unit_price, line_total, buying_cost, profit)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        saleId,
        item.id,
        item.name,
        item.brand,
        quantity,
        unitPrice,
        lineTotal,
        buyingCost,
        profit
      );
    }

    return saleId;
  });

  return transaction();
}

export function savePrescription(data: {
  patient_name: string;
  patient_phone: string;
  patient_age: string;
  patient_sex: string;
  patient_weight: string;
  allergies: string;
  allergy_reaction: string;
  pregnancy_status: string;
  diagnosis: string;
  doctor_name: string;
  medical_conditions: string;
  current_medicines: string;
  prescription_notes: string;
  safety_warnings: any[];
  items: any[];
}) {
  if (!data.patient_name) {
    throw new Error("Patient name is required");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Add at least one medicine");
  }

  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    const result = db
      .prepare(`
        INSERT INTO prescriptions
        (
          patient_name,
          patient_phone,
          patient_age,
          patient_sex,
          patient_weight,
          allergies,
          allergy_reaction,
          pregnancy_status,
          diagnosis,
          doctor_name,
          medical_conditions,
          current_medicines,
          prescription_notes,
          safety_warnings,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        data.patient_name,
        data.patient_phone || "",
        data.patient_age || "",
        data.patient_sex || "",
        data.patient_weight || "",
        data.allergies || "",
        data.allergy_reaction || "",
        data.pregnancy_status || "",
        data.diagnosis || "",
        data.doctor_name || "",
        data.medical_conditions || "",
        data.current_medicines || "",
        data.prescription_notes || "",
        JSON.stringify(data.safety_warnings || []),
        now
      );

    const prescriptionId = Number(result.lastInsertRowid);

    for (const item of data.items) {
      db.prepare(`
        INSERT INTO prescription_items
        (
          prescription_id,
          product_id,
          product_name,
          brand,
          dose,
          frequency,
          duration,
          instructions,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        prescriptionId,
        item.id || null,
        item.name || "",
        item.brand || "",
        item.dose || "",
        item.frequency || "",
        item.duration || "",
        item.instructions || "",
        now
      );
    }

    return prescriptionId;
  });

  return transaction();
}

export function getSalesSummary() {
  const today = new Date().toISOString().slice(0, 10);

  return db
    .prepare(`
      SELECT 
        COUNT(*) as sale_count,
        COALESCE(SUM(total), 0) as total_sales
      FROM sales
      WHERE DATE(created_at) = DATE(?)
    `)
    .get(today) as { sale_count: number; total_sales: number };
}

export function getSalesHistory() {
  return db
    .prepare(`
      SELECT *
      FROM sales
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all();
}

export function getSaleItems(saleId: number) {
  return db
    .prepare(`
      SELECT *
      FROM sale_items
      WHERE sale_id = ?
    `)
    .all(saleId);
}

export function getReportsSummary(period: string = "today") {
  const now = new Date();

  let startDate = "";
  const endDate = now.toISOString().slice(0, 10);

  if (period === "today") {
    startDate = endDate;
  }

  if (period === "week") {
    const firstDay = new Date(now);
    firstDay.setDate(now.getDate() - 6);
    startDate = firstDay.toISOString().slice(0, 10);
  }

  if (period === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate = firstDay.toISOString().slice(0, 10);
  }

  if (period === "year") {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    startDate = firstDay.toISOString().slice(0, 10);
  }

  console.log("REPORT PERIOD:", period);
  console.log("DATE RANGE:", startDate, "→", endDate);

  const todaySummary = db
    .prepare(`
      SELECT 
        COUNT(*) as sale_count,
        COALESCE(SUM(total), 0) as total_sales,
        COALESCE(AVG(total), 0) as average_sale,
        COALESCE((
          SELECT SUM(si.profit)
          FROM sale_items si
          JOIN sales s2 ON s2.id = si.sale_id
          WHERE DATE(s2.created_at) BETWEEN DATE(?) AND DATE(?)
        ), 0) as total_profit
      FROM sales
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    `)
    .get(startDate, endDate, startDate, endDate);

  const topProducts = db
  .prepare(`
    SELECT 
      si.product_id,
      si.product_name,
      si.product_brand,
      SUM(si.quantity) as total_quantity,
      SUM(si.line_total) as total_revenue,
      SUM(si.profit) as total_profit,
      CASE 
        WHEN SUM(si.line_total) > 0 
        THEN ROUND((SUM(si.profit) / SUM(si.line_total)) * 100, 2)
        ELSE 0 
      END as profit_margin
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE DATE(s.created_at) BETWEEN DATE(?) AND DATE(?)
    GROUP BY si.product_id, si.product_name, si.product_brand
    ORDER BY total_profit DESC
    LIMIT 10
  `)
  .all(startDate, endDate);

  const lowProfitProducts = db
  .prepare(`
    SELECT 
      si.product_id,
      si.product_name,
      si.product_brand,
      SUM(si.quantity) as total_quantity,
      SUM(si.line_total) as total_revenue,
      SUM(si.profit) as total_profit,
      CASE 
        WHEN SUM(si.line_total) > 0 
        THEN ROUND((SUM(si.profit) / SUM(si.line_total)) * 100, 2)
        ELSE 0 
      END as profit_margin
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    WHERE DATE(s.created_at) BETWEEN DATE(?) AND DATE(?)
    GROUP BY si.product_id, si.product_name, si.product_brand
    HAVING profit_margin < 20
    ORDER BY profit_margin ASC
    LIMIT 10
  `)
  .all(startDate, endDate);

  const dailySales = db
    .prepare(`
      SELECT 
        DATE(s.created_at) as sale_date,
        COUNT(DISTINCT s.id) as sale_count,
        COALESCE(SUM(s.total), 0) as total_sales,
        COALESCE(SUM(si.profit), 0) as total_profit
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      WHERE DATE(s.created_at) BETWEEN DATE(?) AND DATE(?)
      GROUP BY DATE(s.created_at)
      ORDER BY sale_date DESC
    `)
    .all(startDate, endDate);

  return {
  period,
  startDate,
  endDate,
  todaySummary,
  topProducts,
  lowProfitProducts,
  dailySales,
  };
}

export function restockProduct(restock: {
  product_id: number;
  supplier_name: string;
  quantity_added: number;
  buying_cost: number;
}) {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(restock.product_id) as any;

  if (!product) {
    throw new Error("Product not found");
  }

  if (Number(restock.quantity_added) <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  const now = new Date().toISOString();

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE products
      SET 
        quantity = quantity + ?,
        buying_cost = ?
      WHERE id = ?
    `).run(
      restock.quantity_added,
      Number(restock.buying_cost || 0),
      restock.product_id
    );

    db.prepare(`
      INSERT INTO restocks
      (product_id, product_name, supplier_name, quantity_added, buying_cost, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      restock.product_id,
      product.name,
      restock.supplier_name,
      restock.quantity_added,
      Number(restock.buying_cost || 0),
      now
    );
  });

  transaction();

  return true;
}

export function getRestockHistory() {
  return db
    .prepare(`
      SELECT *
      FROM restocks
      ORDER BY created_at DESC
      LIMIT 50
    `)
    .all();
}

console.log("Database loaded at:", dbPath);

export function addSupplier(supplier: {
  name: string;
  phone: string;
  location: string;
}) {
  if (!supplier.name) {
    throw new Error("Supplier name is required");
  }

  const now = new Date().toISOString();

  return db
    .prepare(`
      INSERT INTO suppliers
      (name, phone, location, created_at)
      VALUES (?, ?, ?, ?)
    `)
    .run(
      supplier.name,
      supplier.phone || "",
      supplier.location || "",
      now
    );
}

export function getSuppliers() {
  return db
    .prepare(`
      SELECT *
      FROM suppliers
      ORDER BY name ASC
    `)
    .all();
}

export function loginUser(username: string, password: string) {
  const user = db
    .prepare(`
      SELECT id, username, password, full_name, role
      FROM users
      WHERE username = ?
    `)
    .get(username) as any;

  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isValid = bcrypt.compareSync(password, user.password);

  if (!isValid) {
    throw new Error("Invalid username or password");
  }

  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
  };
}

export function getUsers() {
  return db
    .prepare(`
      SELECT id, username, full_name, role, created_at
      FROM users
      ORDER BY created_at DESC
    `)
    .all();
}

export function addUser(user: {
  username: string;
  password: string;
  full_name: string;
  role: string;
}) {
  if (!user.username || !user.password || !user.role) {
    throw new Error("Username, password and role are required");
  }

  const hashedPassword = bcrypt.hashSync(user.password, 10);
  const now = new Date().toISOString();

  return db
    .prepare(`
      INSERT INTO users
      (username, password, full_name, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      user.username,
      hashedPassword,
      user.full_name || "",
      user.role,
      now
    );
}

export function getSettings() {
  const rows = db
    .prepare(`
      SELECT key, value
      FROM app_settings
    `)
    .all() as any[];

  const settings: any = {};

  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return settings;
}

export function updateSettings(settings: {
  pharmacy_name: string;
  branch_name: string;
  receipt_footer: string;
  low_stock_threshold: string;
}) {
  const entries = Object.entries(settings);

  const transaction = db.transaction(() => {
    for (const [key, value] of entries) {
      db.prepare(`
        INSERT INTO app_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(key, String(value));
    }
  });

  transaction();

  return getSettings();
}

export function updateProduct(product: {
  id: number;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
  batch_number: string;
  expiry_date: string;
  barcode: string;
  requires_prescription: boolean;
  buying_cost?: number;
}) {
  if (!product.id) {
    throw new Error("Product ID is required");
  }

  if (!product.name || Number(product.price) < 0 || Number(product.quantity) < 0) {
    throw new Error("Invalid product details");
  }

  return db
    .prepare(`
      UPDATE products
      SET
        name = ?,
        brand = ?,
        price = ?,
        quantity = ?,
        unit = ?,
        batch_number = ?,
        expiry_date = ?,
        barcode = ?,
        requires_prescription = ?,
        buying_cost = ?
      WHERE id = ?
    `)
    .run(
      product.name,
      product.brand || "",
      Number(product.price),
      Number(product.quantity),
      product.unit || "Tablet",
      product.batch_number || "",
      product.expiry_date || "",
      product.barcode || "",
      product.requires_prescription ? 1 : 0,
      Number(product.buying_cost || 0),
      product.id
    );
}

export function deleteProduct(id: number) {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(id) as any;

  if (!product) {
    throw new Error("Product not found");
  }

  return db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function addAuditLog(log: {
  user_id?: number;
  username?: string;
  role?: string;
  action: string;
  details?: string;
}) {
  return db
    .prepare(`
      INSERT INTO audit_logs
      (user_id, username, role, action, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      log.user_id || null,
      log.username || "",
      log.role || "",
      log.action,
      log.details || "",
      new Date().toISOString()
    );
}

export function getAuditLogs() {
  return db
    .prepare(`
      SELECT *
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `)
    .all();
}

export function changePassword(data: {
  user_id: number;
  current_password: string;
  new_password: string;
}) {
  if (!data.user_id || !data.current_password || !data.new_password) {
    throw new Error("All password fields are required");
  }

  const user = db
    .prepare(`
      SELECT id, password
      FROM users
      WHERE id = ?
    `)
    .get(data.user_id) as any;

  if (!user) {
    throw new Error("User not found");
  }

  const isCurrentPasswordValid = bcrypt.compareSync(
    data.current_password,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = bcrypt.hashSync(data.new_password, 10);

  db.prepare(`
    UPDATE users
    SET password = ?
    WHERE id = ?
  `).run(hashedPassword, data.user_id);

  return true;
}

export function createPurchaseInvoice(invoice: {
  supplier_id?: number;
  supplier_name: string;
  invoice_number: string;
  invoice_date: string;
  items: Array<{
    product_id?: number;
    product_name: string;
    brand?: string;
    quantity: number;
    bonus_quantity?: number;
    batch_number?: string;
    expiry_date?: string;
    pack_size?: string;
    unit_cost: number;
    discount?: number;
    vat?: number;
    line_total?: number;
  }>;
}) {
  if (!invoice.supplier_name || !invoice.invoice_number) {
    throw new Error("Supplier and invoice number are required");
  }

  if (!invoice.items || invoice.items.length === 0) {
    throw new Error("Invoice must have at least one item");
  }

  const now = new Date().toISOString();

  const subtotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.unit_cost || 0) * Number(item.quantity || 0),
    0
  );

  const discountTotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.discount || 0),
    0
  );

  const vatTotal = invoice.items.reduce(
    (sum, item) => sum + Number(item.vat || 0),
    0
  );

  const grandTotal = invoice.items.reduce((sum, item) => {
    const line =
      item.line_total ??
      Number(item.unit_cost || 0) * Number(item.quantity || 0) -
        Number(item.discount || 0) +
        Number(item.vat || 0);

    return sum + Number(line || 0);
  }, 0);

  const transaction = db.transaction(() => {
    const invoiceResult = db
      .prepare(`
        INSERT INTO purchase_invoices
        (supplier_id, supplier_name, invoice_number, invoice_date, subtotal, discount_total, vat_total, grand_total, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        invoice.supplier_id || null,
        invoice.supplier_name,
        invoice.invoice_number,
        invoice.invoice_date || now.slice(0, 10),
        subtotal,
        discountTotal,
        vatTotal,
        grandTotal,
        now
      );

    const invoiceId = Number(invoiceResult.lastInsertRowid);

    for (const item of invoice.items) {
      const totalQuantity =
        Number(item.quantity || 0) + Number(item.bonus_quantity || 0);

      const lineTotal =
        item.line_total ??
        Number(item.unit_cost || 0) * Number(item.quantity || 0) -
          Number(item.discount || 0) +
          Number(item.vat || 0);

      db.prepare(`
        INSERT INTO purchase_invoice_items
        (invoice_id, product_id, product_name, brand, quantity, bonus_quantity, batch_number, expiry_date, pack_size, unit_cost, discount, vat, line_total, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        invoiceId,
        item.product_id || null,
        item.product_name,
        item.brand || "",
        Number(item.quantity || 0),
        Number(item.bonus_quantity || 0),
        item.batch_number || "",
        item.expiry_date || "",
        item.pack_size || "",
        Number(item.unit_cost || 0),
        Number(item.discount || 0),
        Number(item.vat || 0),
        Number(lineTotal || 0),
        now
      );

      let productId = item.product_id || null;

if (!productId) {
  const existingProduct = db
    .prepare(`
      SELECT id
      FROM products
      WHERE LOWER(name) = LOWER(?)
        AND LOWER(brand) = LOWER(?)
      LIMIT 1
    `)
    .get(item.product_name, item.brand || "") as any;

  if (existingProduct) {
    productId = existingProduct.id;
  }
}

if (productId) {
  db.prepare(`
    UPDATE products
    SET
      quantity = quantity + ?,
      batch_number = ?,
      expiry_date = ?,
      buying_cost = ?
    WHERE id = ?
  `).run(
    totalQuantity,
    item.batch_number || "",
    item.expiry_date || "",
    Number(item.unit_cost || 0),
    productId
  );
} else {
  db.prepare(`
    INSERT INTO products
    (name, brand, price, quantity, unit, batch_number, expiry_date, barcode, requires_prescription, buying_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.product_name,
    item.brand || "",
    0,
    totalQuantity,
    "Tablet",
    item.batch_number || "",
    item.expiry_date || "",
    "",
    0,
    Number(item.unit_cost || 0)
  );
}
    }

    return invoiceId;
  });

  const invoiceId = transaction();

  return {
    success: true,
    invoiceId,
  };
}

export function getPurchaseInvoices() {
  return db
    .prepare(`
      SELECT *
      FROM purchase_invoices
      ORDER BY created_at DESC
      LIMIT 100
    `)
    .all();
}

export function getPurchaseInvoiceItems(invoiceId: number) {
  return db
    .prepare(`
      SELECT *
      FROM purchase_invoice_items
      WHERE invoice_id = ?
      ORDER BY id ASC
    `)
    .all(invoiceId);
}

export default db;