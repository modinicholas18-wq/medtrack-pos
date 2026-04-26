import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Tab =
  | "dashboard"
  | "pos"
  | "inventory"
  | "drugs"
  | "rx"
  | "suppliers"
  | "reports"
  | "settings";

declare global {
  interface Window {
    api: any;
  }
}

function App() {
  const [salesSummary, setSalesSummary] = useState({
    sale_count: 0,
    total_sales: 0,
  });

  const [reportsSummary, setReportsSummary] = useState<any>({
    todaySummary: {
      sale_count: 0,
      total_sales: 0,
      average_sale: 0,
    },
    topProducts: [],
    dailySales: [],
  });

  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [posSearch] = useState("");

  const [receipt, setReceipt] = useState<any | null>(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("Tablet");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [barcode, setBarcode] = useState("");
  const [requiresPrescription, setRequiresPrescription] = useState(false);

  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [saleItems, setSaleItems] = useState<any[]>([]);
  const [loadingSaleItems, setLoadingSaleItems] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement | null>(null);
  const [reportPeriod, setReportPeriod] = useState("today");

  const [restockProductId, setRestockProductId] = useState("");
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockSupplier, setRestockSupplier] = useState("");
  const [restockCost, setRestockCost] = useState("");
  const [restockHistory, setRestockHistory] = useState<any[]>([]);

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierLocation, setSupplierLocation] = useState("");

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState("cashier");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [appSettings, setAppSettings] = useState<any>({
    pharmacy_name: "Main Pharmacy",
    branch_name: "Main Branch",
    receipt_footer: "Thank you for shopping with us.",
    low_stock_threshold: "10",
  });

  const [pharmacyName, setPharmacyName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("Tablet");
  const [editBatchNumber, setEditBatchNumber] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editBarcode, setEditBarcode] = useState("");
  const [editRequiresPrescription, setEditRequiresPrescription] = useState(false);
  const [editBuyingCost, setEditBuyingCost] = useState("");

  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    try {
      const user = await window.api.loginUser({
        username: loginUsername,
        password: loginPassword,
      });

      setCurrentUser(user);
      setLoginUsername("");
      setLoginPassword("");
    } catch (err: any) {
      alert(err.message);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    setActiveTab("dashboard");
  }
  async function loadProducts() {
    const data = await window.api.getProducts();
    setProducts(data || []);
  }

  async function loadAuditLogs() {
  const data = await window.api.getAuditLogs();
  setAuditLogs(data || []);
}

async function logAction(action: string, details: string) {
  if (!currentUser) return;

  await window.api.addAuditLog({
    user_id: currentUser.id,
    username: currentUser.username,
    role: currentUser.role,
    action,
    details,
  });
}

  async function loadRestockHistory() {
  const data = await window.api.getRestockHistory();
  setRestockHistory(data || []);
  }

  async function loadSuppliers() {
  const data = await window.api.getSuppliers();
  setSuppliers(data || []);
  }

  async function loadUsers() {
  const data = await window.api.getUsers();
  setUsers(data || []);
  }

  async function loadSettings() {
    const data = await window.api.getSettings();

    setAppSettings(data || {});

    setPharmacyName(data?.pharmacy_name || "Main Pharmacy");
    setBranchName(data?.branch_name || "Main Branch");
    setReceiptFooter(data?.receipt_footer || "Thank you for shopping with us.");
    setLowStockThreshold(data?.low_stock_threshold || "10");
  }

  async function loadSalesSummary() {
    const data = await window.api.getSalesSummary();
    setSalesSummary(
      data || {
        sale_count: 0,
        total_sales: 0,
      }
    );
  }

  async function loadSalesHistory() {
    const data = await window.api.getSalesHistory();
    setSalesHistory(data || []);
  }
  async function changeReportPeriod(period: string) {
  setReportPeriod(period);
  await loadReportsSummary(period);
}

  async function loadReportsSummary(period = reportPeriod) {
  try {
    const data = await window.api.getReportsSummary(period);

    setReportsSummary({
      todaySummary: data?.todaySummary || {
        sale_count: 0,
        total_sales: 0,
        average_sale: 0,
      },
      topProducts: data?.topProducts || [],
      dailySales: data?.dailySales || [],
      period: data?.period || period,
      startDate: data?.startDate,
      endDate: data?.endDate,
    });
  } catch (error) {
    console.error("Reports error:", error);
  }
  }

  async function openSaleDetails(sale: any) {
    setSelectedSale(sale);
    setSaleItems([]);
    setLoadingSaleItems(true);

    const items = await window.api.getSaleItems(sale.id);

    setSaleItems(items || []);
    setLoadingSaleItems(false);
  }

  useEffect(() => {
  loadProducts();
  loadRestockHistory();
  loadSuppliers();
  loadUsers();
  loadSettings();
  loadSalesSummary();
  loadSalesHistory();
  loadReportsSummary();
  loadAuditLogs();
  }, []);

  useEffect(() => {
  if (activeTab === "pos") {
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  }
  }, [activeTab]);

  function getDaysUntilExpiry(expiryDateValue: string) {
    if (!expiryDateValue) return null;

    const today = new Date();
    const expiry = new Date(expiryDateValue);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference = expiry.getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }

  const lowStockLimit = Number(appSettings.low_stock_threshold || 10);

  const lowStockProducts = products.filter(
    (p) => Number(p.quantity) <= lowStockLimit
  );

  const expiredProducts = products.filter((p) => {
    const days = getDaysUntilExpiry(p.expiry_date);
    return days !== null && days < 0;
  });

  const nearExpiryProducts = products.filter((p) => {
    const days = getDaysUntilExpiry(p.expiry_date);
    return days !== null && days >= 0 && days <= 30;
  });

  async function handleChangePassword(event: React.FormEvent) {
  event.preventDefault();

  if (!currentPassword || !newPasswordValue || !confirmPassword) {
    alert("Fill all password fields");
    return;
  }

  if (newPasswordValue !== confirmPassword) {
    alert("New passwords do not match");
    return;
  }

  try {
    await window.api.changePassword({
      user_id: currentUser.id,
      current_password: currentPassword,
      new_password: newPasswordValue,
    });

    alert("Password changed ✅ Please login again.");

    setCurrentPassword("");
    setNewPasswordValue("");
    setConfirmPassword("");

    handleLogout();
  } catch (err: any) {
    alert(err.message);
  }
}

  async function handleSaveSettings(event: React.FormEvent) {
    event.preventDefault();

    const updated = await window.api.updateSettings({
      pharmacy_name: pharmacyName,
      branch_name: branchName,
      receipt_footer: receiptFooter,
      low_stock_threshold: lowStockThreshold,
    });

    setAppSettings(updated);

    alert("Settings saved ✅");
  }
  async function handleAddUser(event: React.FormEvent) {
    event.preventDefault();

    if (!newUsername || !newPassword || !newRole) {
      alert("Username, password and role are required");
      return;
    }

    try {
      await window.api.addUser({
        username: newUsername,
        password: newPassword,
        full_name: newFullName,
        role: newRole,
      });

      alert("User created ✅");

      setNewUsername("");
      setNewPassword("");
      setNewFullName("");
      setNewRole("cashier");

      await logAction("USER_CREATED", `Created user: ${newUsername} (${newRole})`);
      await loadAuditLogs();
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }
  async function handleAddSupplier(event: React.FormEvent) {
  event.preventDefault();

  if (!supplierName) {
    alert("Supplier name is required");
    return;
  }

  await window.api.addSupplier({
    name: supplierName,
    phone: supplierPhone,
    location: supplierLocation,
  });

  alert("Supplier added ✅");

  setSupplierName("");
  setSupplierPhone("");
  setSupplierLocation("");

  await loadSuppliers();
}
  async function handleRestock(event: React.FormEvent) {
  event.preventDefault();

  if (!restockProductId || !restockQuantity) {
    alert("Select a medicine and enter quantity");
    return;
  }

  await window.api.restockProduct({
    product_id: Number(restockProductId),
    supplier_name: restockSupplier,
    quantity_added: Number(restockQuantity),
    buying_cost: Number(restockCost || 0),
  });

  alert("Stock updated ✅");

  setRestockProductId("");
  setRestockQuantity("");
  setRestockSupplier("");
  setRestockCost("");

  await loadProducts();
  await loadRestockHistory();
  await loadReportsSummary(reportPeriod);
  await logAction(
    "STOCK_RESTOCKED",
    `Restocked product ID ${restockProductId} by ${restockQuantity} units`
  );

  await loadAuditLogs();
  }
  
  function startEditProduct(product: any) {
  setEditingProduct(product);

  setEditName(product.name || "");
  setEditBrand(product.brand || "");
  setEditPrice(String(product.price || ""));
  setEditQuantity(String(product.quantity || ""));
  setEditUnit(product.unit || "Tablet");
  setEditBatchNumber(product.batch_number || "");
  setEditExpiryDate(product.expiry_date || "");
  setEditBarcode(product.barcode || "");
  setEditRequiresPrescription(Boolean(product.requires_prescription));
  setEditBuyingCost(String(product.buying_cost || ""));
}

function cancelEditProduct() {
  setEditingProduct(null);
  setEditName("");
  setEditBrand("");
  setEditPrice("");
  setEditQuantity("");
  setEditUnit("Tablet");
  setEditBatchNumber("");
  setEditExpiryDate("");
  setEditBarcode("");
  setEditRequiresPrescription(false);
  setEditBuyingCost("");
}

async function handleUpdateProduct(event: React.FormEvent) {
  event.preventDefault();

  if (!editingProduct) return;

  await window.api.updateProduct({
    id: editingProduct.id,
    name: editName,
    brand: editBrand,
    price: Number(editPrice),
    quantity: Number(editQuantity),
    unit: editUnit,
    batch_number: editBatchNumber,
    expiry_date: editExpiryDate,
    barcode: editBarcode,
    requires_prescription: editRequiresPrescription,
    buying_cost: Number(editBuyingCost || 0),
  });

  alert("Medicine updated ✅");

  cancelEditProduct();
  await logAction("PRODUCT_UPDATED", `Updated medicine: ${editName}`);
  await loadAuditLogs();
  await loadProducts();
  await loadReportsSummary(reportPeriod);

}

async function handleDeleteProduct(product: any) {
  const confirmed = confirm(
    `Delete ${product.name}? This cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await window.api.deleteProduct(product.id);

    alert("Medicine deleted ✅");

    await logAction("PRODUCT_DELETED", `Deleted medicine: ${product.name}`);
    await loadAuditLogs();
    await loadProducts();
    await loadReportsSummary(reportPeriod);
  } catch (err: any) {
    alert(err.message);
  }
}
  async function handleAddMedicine(event: React.FormEvent) {
    event.preventDefault();

    if (!name || !brand || !price || !quantity || !expiryDate) {
      alert("Fill required fields");
      return;
    }

    await window.api.addProduct({
      name,
      brand,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      batch_number: batchNumber,
      expiry_date: expiryDate,
      barcode,
      requires_prescription: requiresPrescription,
    });

    setName("");
    setBrand("");
    setPrice("");
    setQuantity("");
    setUnit("Tablet");
    setBatchNumber("");
    setExpiryDate("");
    setBarcode("");
    setRequiresPrescription(false);
    setShowForm(false);
    
    await logAction("PRODUCT_ADDED", `Added medicine: ${name}`);
    await loadAuditLogs();
    await loadProducts();
    await loadReportsSummary();
  }

  function addToCart(product: any) {
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      if (existing.qty + 1 > product.quantity) {
        alert("Not enough stock");
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      if (product.quantity < 1) {
        alert("Out of stock");
        return;
      }

      setCart([...cart, { ...product, qty: 1 }]);
    }
  }

  function removeFromCart(id: number) {
    setCart(cart.filter((item) => item.id !== id));
  }

  function updateQty(id: number, qty: number) {
    const product = products.find((p) => p.id === id);

    if (!product) return;
    if (qty <= 0) return;

    if (qty > product.quantity) {
      alert("Cannot exceed available stock");
      return;
    }

    setCart(cart.map((item) => (item.id === id ? { ...item, qty } : item)));
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  async function handleCheckout() {
    try {
      const receiptItems = cart.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        qty: item.qty,
        unit: item.unit,
        price: Number(item.price),
        lineTotal: Number(item.price) * item.qty,
      }));

      const response = await window.api.completeSale(cart);

      const newReceipt = {
        saleId: response?.saleId || "N/A",
        pharmacyName: appSettings.pharmacy_name || "Main Pharmacy",
        cashier: "Cashier",
        createdAt: new Date().toISOString(),
        items: receiptItems,
        total,
      };

      setReceipt(newReceipt);
      alert("Sale completed ✅");

      setCart([]);
      setActiveTab("dashboard");

      await logAction(
        "SALE_COMPLETED",
        `Completed sale worth KSh ${Number(total).toLocaleString()}`
      );

      await loadAuditLogs();

      await loadProducts();
      await loadSalesSummary();
      await loadSalesHistory();
      await loadReportsSummary(reportPeriod);
    } catch (err: any) {
      alert(err.message);
    }
  }
  function handleBarcodeScan(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter") return;

  const code = barcodeInput.trim();

  if (!code) return;

  const product = products.find((p) => String(p.barcode) === code);

  if (!product) {
    alert("❌ Product not found");
    setBarcodeInput("");
    barcodeInputRef.current?.focus();
    return;
  }

  if (Number(product.quantity) <= 0) {
    alert("⚠️ Out of stock");
    setBarcodeInput("");
    barcodeInputRef.current?.focus();
    return;
  }

  addToCart(product);
  setBarcodeInput("");

  setTimeout(() => {
    barcodeInputRef.current?.focus();
  }, 50);
 }
  function printReceipt() {
    window.print();
  }

  function renderLogin() {
    return (
      <div className="login-screen">
        <form className="login-card" onSubmit={handleLogin}>
          <h1>MedTrack POS</h1>
          <p>Sign in to continue</p>

          <input
            type="text"
            placeholder="Username"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <button type="submit">Login</button>

          <small>Authorized staff only</small>
        </form>
      </div>
    );
  }
  function renderDashboard() {
    return (
      <>
        <section className="hero-card">
          <div>
            <p className="label">Primary action</p>
            <h2>Start a pharmacy sale</h2>
            <p>Search drugs by brand, generic name, or barcode.</p>
          </div>

          <button className="primary-btn" onClick={() => setActiveTab("pos")}>
            Open POS / Billing
          </button>
        </section>

        <section className="summary-grid">
          <div className="summary-card">
            <p>Today’s Sales</p>
            <h3>KSh {Number(salesSummary.total_sales || 0).toLocaleString()}</h3>
            <small>{salesSummary.sale_count || 0} completed sales</small>
          </div>

          <div className="summary-card warning">
            <p>Low Stock</p>
            <h3>{lowStockProducts.length}</h3>
            <small>Items needing reorder</small>
          </div>

          <div className="summary-card danger">
            <p>Expiry Alerts</p>
            <h3>{expiredProducts.length + nearExpiryProducts.length}</h3>
            <small>Expired or expiring soon</small>
          </div>

          <div className="summary-card">
            <p>Total Products</p>
            <h3>{products.length}</h3>
            <small>Saved in local database</small>
          </div>
        </section>

        <section className="lower-grid">
          <div className="panel alerts-panel">
            <div className="panel-head">
              <h2>Pharmacy Alerts</h2>
              <p>Low stock, expired and near-expiry medicines</p>
            </div>

            {lowStockProducts.length === 0 &&
            expiredProducts.length === 0 &&
            nearExpiryProducts.length === 0 ? (
              <div className="alert-item">
                <span>✅</span>
                <div>
                  <strong>No urgent alerts</strong>
                  <p>Stock and expiry status look okay.</p>
                </div>
              </div>
            ) : (
              <>
                {expiredProducts.map((p) => (
                  <div className="alert-item alert-danger" key={`expired-${p.id}`}>
                    <span>⛔</span>
                    <div>
                      <strong>{p.name} expired</strong>
                      <p>Brand: {p.brand} • Expired on {p.expiry_date}</p>
                    </div>
                  </div>
                ))}

                {nearExpiryProducts.map((p) => {
                  const days = getDaysUntilExpiry(p.expiry_date);

                  return (
                    <div className="alert-item alert-warning" key={`near-${p.id}`}>
                      <span>⚠️</span>
                      <div>
                        <strong>{p.name} near expiry</strong>
                        <p>
                          Brand: {p.brand} • Expires in {days} day(s)
                        </p>
                      </div>
                    </div>
                  );
                })}

                {lowStockProducts.map((p) => (
                  <div className="alert-item alert-warning" key={`low-${p.id}`}>
                    <span>📦</span>
                    <div>
                      <strong>{p.name} low stock</strong>
                      <p>
                        Remaining: {p.quantity} {p.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="panel recent-sales-panel">
            <div className="panel-head">
              <h2>Recent Sales</h2>
              <p>Latest transactions</p>
            </div>

            {salesHistory.length === 0 ? (
              <p>No sales yet</p>
            ) : (
              salesHistory.map((sale) => (
                <div
                  className="table-row sales-row"
                  key={sale.id}
                  onClick={() => openSaleDetails(sale)}
                  style={{ cursor: "pointer" }}
                >
                  <span>Sale #{sale.id}</span>
                  <span>KSh {Number(sale.total || 0).toLocaleString()}</span>
                  <span>{new Date(sale.created_at).toLocaleString("en-KE")}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="lower-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Quick Operations</h2>
              <p>Common pharmacy tasks</p>
            </div>

            <div className="operation-grid">
              <button onClick={() => setActiveTab("pos")}>🧾 New Sale</button>
              <button onClick={() => setActiveTab("inventory")}>
                💊 Add Medicine
              </button>
              <button onClick={() => setActiveTab("inventory")}>
                📦 Receive Stock
              </button>
              <button onClick={() => setActiveTab("rx")}>
                📋 Upload Prescription
              </button>
              <button onClick={() => setActiveTab("suppliers")}>
                🚚 Add Supplier
              </button>
              <button onClick={() => setActiveTab("reports")}>
                📊 View Reports
              </button>
            </div>
          </div>

          <div className="panel alerts-panel">
            <div className="panel-head">
              <h2>Inventory Summary</h2>
              <p>Current product database status</p>
            </div>

            <div className="alert-item">
              <span>💊</span>
              <div>
                <strong>Products in database</strong>
                <p>{products.length} medicines saved locally</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  function downloadCSV(filename: string, rows: any[]) {
  if (rows.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function printCurrentReport() {
  window.print();
}

function exportTopProductsCSV() {
  const rows = (reportsSummary?.topProducts || []).map((product: any) => ({
    Medicine: product.product_name,
    Brand: product.product_brand,
    QuantitySold: product.total_quantity,
    Revenue: product.total_revenue,
    Profit: product.total_profit,
    ProfitMargin: `${product.profit_margin || 0}%`,
  }));

  downloadCSV(`top-products-${reportPeriod}.csv`, rows);
}

function exportDailySalesCSV() {
  const rows = (reportsSummary?.dailySales || []).map((day: any) => ({
    Date: day.sale_date,
    SalesCount: day.sale_count,
    Revenue: day.total_sales,
    Profit: day.total_profit,
  }));

  downloadCSV(`daily-sales-${reportPeriod}.csv`, rows);
}
  function renderReports() {
    const periodLabelMap: any = {
      today: "Today",
      week: "This Week",
      month: "This Month",
      year: "This Year",
    };

    const periodLabel = periodLabelMap[reportPeriod] || "Selected Period";
    const todaySummary = reportsSummary?.todaySummary || {};
    const topProducts = reportsSummary?.topProducts || [];
    const dailySales = reportsSummary?.dailySales || [];
    const lowProfitProducts = reportsSummary?.lowProfitProducts || [];

    const revenueChartData = [...dailySales].reverse().map((day: any) => ({
      ...day,
      total_sales: Number(day.total_sales || 0),
      total_profit: Number(day.total_profit || 0),
    }));

    const topProductsChartData = topProducts.map((product: any) => ({
      ...product,
      total_quantity: Number(product.total_quantity || 0),
      total_revenue: Number(product.total_revenue || 0),
      total_profit: Number(product.total_profit || 0),
      profit_margin: Number(product.profit_margin || 0),
    }));

    return (

      <section className="inventory-container">
        <div className="report-actions">
          <button onClick={printCurrentReport}>Print Report</button>
          <button onClick={exportTopProductsCSV}>Export Top Products CSV</button>
          <button onClick={exportDailySalesCSV}>Export Daily Sales CSV</button>
        </div>
        <div className="report-filters">
          <button
            className={reportPeriod === "today" ? "active" : ""}
            onClick={() => changeReportPeriod("today")}
          >
            Today
          </button>

          <button
            className={reportPeriod === "week" ? "active" : ""}
            onClick={() => changeReportPeriod("week")}
          >
            This Week
          </button>

          <button
            className={reportPeriod === "month" ? "active" : ""}
            onClick={() => changeReportPeriod("month")}
          >
            This Month
          </button>

          <button
            className={reportPeriod === "year" ? "active" : ""}
            onClick={() => changeReportPeriod("year")}
          >
            This Year
          </button>

          <span>
            Showing: {reportsSummary?.startDate || "-"} to{" "}
            {reportsSummary?.endDate || "-"}
          </span>
        </div>
        <section className="summary-grid">
          <div className="summary-card">
            <p>Revenue</p>
            <h3>KSh {Number(todaySummary.total_sales || 0).toLocaleString()}</h3>
            <small>{periodLabel}</small>
          </div>

          <div className="summary-card">
            <p>Transactions</p>
            <h3>{todaySummary.sale_count || 0}</h3>
            <small>Completed sales today</small>
          </div>

          <div className="summary-card">
            <p>Average Sale</p>
            <h3>KSh {Number(todaySummary.average_sale || 0).toLocaleString()}</h3>
            <small>Average transaction value</small>
          </div>

          <div className="summary-card">
            <p>Gross Profit</p>
            <h3>
              KSh {Number(todaySummary.total_profit || 0).toLocaleString()}
            </h3>
            <small>{periodLabel}</small>
          </div>
        </section>

        <section className="lower-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>{periodLabel} Revenue Trend</h2>
              <p>Revenue for {periodLabel.toLowerCase()}</p>
            </div>

            {revenueChartData.length === 0 ? (
              <p>No revenue data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueChartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sale_date" />
                  <YAxis tickFormatter={(value) => `KSh ${Number(value).toLocaleString()}`} />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      const label =
                        name === "total_sales"
                          ? "Revenue"
                          : name === "total_profit"
                          ? "Gross Profit"
                          : name;

                      return [`KSh ${Number(value).toLocaleString()}`, label];
                    }}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar
                    dataKey="total_sales"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={90}
                  />
                  <Bar
                    dataKey="total_profit"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={90}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Most Profitable Medicines ({periodLabel})</h2>
              <p>Ranked by gross profit for {periodLabel.toLowerCase()}</p>
            </div>

            {topProductsChartData.length === 0 ? (
              <p>No top-selling product data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProductsChartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product_name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name === "total_profit") {
                        return [`KSh ${Number(value).toLocaleString()}`, "Gross Profit"];
                      }

                      if (name === "profit_margin") {
                        return [`${Number(value).toLocaleString()}%`, "Profit Margin"];
                      }

                      return [Number(value).toLocaleString(), name];
                    }}
                    labelFormatter={(label) => `Medicine: ${label}`}
                  />
                  <Bar
                    dataKey="total_profit"
                    fill="#22c55e"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={90}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="lower-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Top Selling Medicines (Table)</h2>
              <p>Quantity and revenue breakdown</p>
            </div>

            <div className="inventory-table">
              <div className="table-header">
                <span>Medicine</span>
                <span>Qty</span>
                <span>Revenue</span>
                <span>Profit</span>
                <span>Margin</span>
              </div>

              {topProducts.length === 0 ? (
                <p style={{ padding: "16px" }}>No data</p>
              ) : (
                topProducts.map((product: any, index: number) => (
                  <div className="table-row" key={index}>
                    <span>
                      <strong>{product.product_name}</strong>
                      <small>{product.product_brand}</small>
                    </span>
                    <span>{product.total_quantity}</span>
                    <span>
                      KSh {Number(product.total_revenue || 0).toLocaleString()}
                    </span>
                    <span>
                      KSh {Number(product.total_profit || 0).toLocaleString()}
                    </span>
                    <span>{Number(product.profit_margin || 0).toLocaleString()}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Low-Profit Products</h2>
              <p>Products with profit margin below 20%</p>
            </div>

            <div className="inventory-table">
              <div className="table-header">
                <span>Medicine</span>
                <span>Revenue</span>
                <span>Profit</span>
                <span>Margin</span>
              </div>

              {lowProfitProducts.length === 0 ? (
                <p style={{ padding: "16px" }}>No low-profit products found</p>
              ) : (
                lowProfitProducts.map((product: any, index: number) => (
                  <div className="table-row row-warning" key={index}>
                    <span>
                      <strong>{product.product_name}</strong>
                      <small>{product.product_brand}</small>
                    </span>

                    <span>
                      KSh {Number(product.total_revenue || 0).toLocaleString()}
                    </span>

                    <span>
                      KSh {Number(product.total_profit || 0).toLocaleString()}
                    </span>

                    <span>{Number(product.profit_margin || 0).toLocaleString()}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Daily Sales (Table)</h2>
              <p>Sales count and revenue per day</p>
            </div>

            <div className="inventory-table">
              <div className="table-header">
                <span>Date</span>
                <span>Sales</span>
                <span>Revenue</span>
                <span>Profit</span>
              </div>

              {dailySales.length === 0 ? (
                <p style={{ padding: "16px" }}>No data</p>
              ) : (
                dailySales.map((day: any) => (
                  <div className="table-row" key={day.sale_date}>
                    <span>{day.sale_date}</span>
                    <span>{day.sale_count}</span>
                    <span>KSh {Number(day.total_sales || 0).toLocaleString()}</span>
                    <span>KSh {Number(day.total_profit || 0).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </section>
    );
  }

  function renderPOS() {
    const filteredProducts = products.filter((p) =>
      `${p.name} ${p.brand}`.toLowerCase().includes(posSearch.toLowerCase())
    );

    return (
      <section className="pos-layout">
        <div className="panel">
          <div className="panel-head">
            <h2>POS / Billing</h2>
            <p>Search and click a medicine to add it to cart.</p>
          </div>

          <input
            ref={barcodeInputRef}
            className="pos-search scanner-input"
            type="text"
            placeholder="Scanner ready — scan barcode or type and press Enter..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeScan}
          />

          <div className="pos-products">
            {filteredProducts.length === 0 ? (
              <p>No medicine found</p>
            ) : (
              filteredProducts.map((product) => (
                <button
                  className="pos-product"
                  key={product.id}
                  onClick={() => {
                    if (product.quantity > 0) addToCart(product);
                  }}
                  disabled={product.quantity === 0}
                >
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.brand}</small>
                  </span>

                  <span>
                    <small>Stock</small>
                    <b>
                      {product.quantity === 0
                        ? "Out of stock"
                        : `${product.quantity} ${product.unit}`}
                    </b>
                  </span>

                  <span>
                    <small>Price</small>
                    <b>KSh {Number(product.price).toLocaleString()}</b>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="panel cart-panel">
          <div className="panel-head">
            <h2>Cart</h2>
            <p>{cart.length} item type(s)</p>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <p>No items added yet</p>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>KSh {Number(item.price).toLocaleString()} each</small>
                  </div>

                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, Number(e.target.value))}
                  />

                  <b>KSh {(Number(item.price) * item.qty).toLocaleString()}</b>

                  <button onClick={() => removeFromCart(item.id)}>×</button>
                </div>
              ))
            )}
          </div>

          <div className="cart-total">
            <span>Total</span>
            <strong>KSh {Number(total).toLocaleString()}</strong>
          </div>

          <button
            className="checkout-btn"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Complete Sale
          </button>
        </div>
      </section>
    );
  }

  function renderInventory() {
    const filteredProducts = products.filter((p) =>
      `${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <section className="inventory-container">
        <div className="inventory-header">
          <input
            type="text"
            placeholder="Search medicine or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "+ Add Medicine"}
          </button>
        </div>

        {showForm && (
          <div className="panel">
            <div className="panel-head">
              <h2>Add Medicine</h2>
            </div>

            <form className="medicine-form" onSubmit={handleAddMedicine}>
              <div className="form-row">
                <input
                  placeholder="Generic name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  placeholder="Brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="form-row">
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-row">
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                  <option>Tablet</option>
                  <option>Capsule</option>
                  <option>Bottle</option>
                  <option>Vial</option>
                  <option>Tube</option>
                </select>

                <input
                  placeholder="Batch"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                />
              </div>

              <div className="form-row">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <input
                  placeholder="Barcode"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={requiresPrescription}
                  onChange={(e) => setRequiresPrescription(e.target.checked)}
                />
                Requires prescription
              </label>

              <button type="submit">Save Medicine</button>
            </form>
            {editingProduct && (
              <div className="panel edit-panel">
                <div className="panel-head">
                  <h2>Edit Medicine</h2>
                  <p>Updating: {editingProduct.name}</p>
                </div>

                <form className="medicine-form" onSubmit={handleUpdateProduct}>
                  <div className="form-row">
                    <input
                      placeholder="Generic name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />

                    <input
                      placeholder="Brand"
                      value={editBrand}
                      onChange={(e) => setEditBrand(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Price"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />

                    <input
                      type="number"
                      placeholder="Quantity"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <select value={editUnit} onChange={(e) => setEditUnit(e.target.value)}>
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Bottle</option>
                      <option>Vial</option>
                      <option>Tube</option>
                    </select>

                    <input
                      placeholder="Batch"
                      value={editBatchNumber}
                      onChange={(e) => setEditBatchNumber(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                    />

                    <input
                      placeholder="Barcode"
                      value={editBarcode}
                      onChange={(e) => setEditBarcode(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Buying cost"
                      value={editBuyingCost}
                      onChange={(e) => setEditBuyingCost(e.target.value)}
                    />

                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={editRequiresPrescription}
                        onChange={(e) => setEditRequiresPrescription(e.target.checked)}
                      />
                      Requires prescription
                    </label>
                  </div>

                  <div className="form-actions">
                    <button type="submit">Update Medicine</button>
                    <button type="button" onClick={cancelEditProduct}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}



        <section className="lower-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Receive / Restock Medicine</h2>
              <p>Add stock to an existing medicine</p>
            </div>

            <form className="medicine-form" onSubmit={handleRestock}>
              <div className="form-row">
                <select
                  value={restockProductId}
                  onChange={(e) => setRestockProductId(e.target.value)}
                >
                  <option value="">Select medicine</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.brand} ({product.quantity} {product.unit})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Quantity received"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                />
              </div>

              <div className="form-row">
              <select
              value={restockSupplier}
              onChange={(e) => setRestockSupplier(e.target.value)}
            >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
            </select>

                <input
                  type="number"
                  placeholder="Buying cost per batch"
                  value={restockCost}
                  onChange={(e) => setRestockCost(e.target.value)}
                />
              </div>

              <button type="submit">Receive Stock</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Recent Restocks</h2>
              <p>Latest stock receiving records</p>
            </div>

            <div className="inventory-table restock-table">
              <div className="table-header">
                <span>Medicine</span>
                <span>Supplier</span>
                <span>Qty</span>
                <span>Date</span>
              </div>

              {restockHistory.length === 0 ? (
                <p style={{ padding: "16px" }}>No restocks yet</p>
              ) : (
                restockHistory.map((item) => (
                  <div className="table-row" key={item.id}>
                    <span>{item.product_name}</span>
                    <span>{item.supplier_name || "-"}</span>
                    <span>{item.quantity_added}</span>
                    <span>{new Date(item.created_at).toLocaleString("en-KE")}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="inventory-table">
          <div className="table-header">
            <span>Medicine</span>
            <span>Stock</span>
            <span>Price</span>
            <span>Expiry</span>
            <span>Batch</span>
            <span>Rx</span>
            <span>Actions</span>
          </div>

          {filteredProducts.map((p) => {
            const days = getDaysUntilExpiry(p.expiry_date);
            const isLowStock = Number(p.quantity) <= 10;
            const isExpired = days !== null && days < 0;
            const isNearExpiry = days !== null && days >= 0 && days <= 30;

            return (
              <div
                className={`table-row ${
                  isExpired
                    ? "row-danger"
                    : isNearExpiry || isLowStock
                    ? "row-warning"
                    : ""
                }`}
                key={p.id}
              >
                <span>
                  <strong>{p.name}</strong>
                  <small>{p.brand}</small>
                </span>

                <span>
                  {p.quantity} {p.unit}
                  {isLowStock && <small>Low stock</small>}
                </span>

                <span>KSh {Number(p.price).toLocaleString()}</span>

                <span>
                  {p.expiry_date || "-"}
                  {isExpired && <small>Expired</small>}
                  {isNearExpiry && !isExpired && <small>Near expiry</small>}
                </span>

                <span>{p.batch_number || "-"}</span>
                <span>{p.requires_prescription ? "Yes" : "No"}</span>
                <span className="row-actions">
                  <button onClick={() => startEditProduct(p)}>Edit</button>
                  <button className="danger-btn" onClick={() => handleDeleteProduct(p)}>
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  function renderReceipt() {
    if (!receipt) return null;

    return (
      <div className="receipt-overlay">
        <div className="receipt-modal">
          <div className="receipt-content" id="receipt-print-area">
            <h2>{receipt.pharmacyName}</h2>
            <p>Official Sales Receipt</p>

            <div className="receipt-meta">
              <span>Sale ID: #{receipt.saleId}</span>
              <span>Cashier: {receipt.cashier}</span>
              <span>{new Date(receipt.createdAt).toLocaleString("en-KE")}</span>
            </div>

            <div className="receipt-items">
              {receipt.items.map((item: any) => (
                <div className="receipt-item" key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.qty} {item.unit} × KSh{" "}
                      {Number(item.price).toLocaleString()}
                    </small>
                  </div>

                  <b>KSh {Number(item.lineTotal).toLocaleString()}</b>
                </div>
              ))}
            </div>

            <div className="receipt-total">
              <span>Total</span>
              <strong>KSh {Number(receipt.total).toLocaleString()}</strong>
            </div>

            <p className="receipt-footer">
              {appSettings.receipt_footer || "Thank you for shopping with us."}
            </p>
          </div>

          <div className="receipt-actions">
            <button onClick={printReceipt}>Print Receipt</button>
            <button onClick={() => setReceipt(null)}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  function renderSaleDetails() {
    if (!selectedSale) return null;

    return (
      <div
        className="receipt-overlay"
        onClick={() => {
          setSelectedSale(null);
          setSaleItems([]);
        }}
      >
        <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
          <div className="receipt-content">
            <h2>Sale #{selectedSale.id}</h2>
            <p>{new Date(selectedSale.created_at).toLocaleString("en-KE")}</p>

            <div className="receipt-items">
              {loadingSaleItems ? (
                <p>Loading items...</p>
              ) : saleItems.length === 0 ? (
                <p>No items found</p>
              ) : (
                saleItems.map((item) => (
                  <div className="receipt-item" key={item.id}>
                    <div>
                      <strong>{item.product_name}</strong>
                      <small>
                        {item.quantity} × KSh{" "}
                        {Number(item.unit_price).toLocaleString()}
                      </small>
                    </div>

                    <b>KSh {Number(item.line_total).toLocaleString()}</b>
                  </div>
                ))
              )}
            </div>

            <div className="receipt-total">
              <span>Total</span>
              <strong>KSh {Number(selectedSale.total).toLocaleString()}</strong>
            </div>
          </div>

          <div className="receipt-actions">
            <button
              onClick={() => {
                setSelectedSale(null);
                setSaleItems([]);
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderSuppliers() {
  return (
    <section className="inventory-container">
      <section className="lower-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Add Supplier</h2>
            <p>Register medicine suppliers</p>
          </div>

          <form className="medicine-form" onSubmit={handleAddSupplier}>
            <div className="form-row">
              <input
                placeholder="Supplier name"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />

              <input
                placeholder="Phone number"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
              />
            </div>

            <input
              placeholder="Location"
              value={supplierLocation}
              onChange={(e) => setSupplierLocation(e.target.value)}
            />

            <button type="submit">Save Supplier</button>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Supplier Directory</h2>
            <p>Saved supplier contacts</p>
          </div>

          <div className="inventory-table">
            <div className="table-header">
              <span>Name</span>
              <span>Phone</span>
              <span>Location</span>
            </div>

            {suppliers.length === 0 ? (
              <p style={{ padding: "16px" }}>No suppliers yet</p>
            ) : (
              suppliers.map((supplier) => (
                <div className="table-row" key={supplier.id}>
                  <span>{supplier.name}</span>
                  <span>{supplier.phone || "-"}</span>
                  <span>{supplier.location || "-"}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Supplier Restock History</h2>
          <p>Recent stock received from suppliers</p>
        </div>

        <div className="inventory-table">
          <div className="table-header">
            <span>Supplier</span>
            <span>Medicine</span>
            <span>Qty</span>
            <span>Date</span>
          </div>

          {restockHistory.length === 0 ? (
            <p style={{ padding: "16px" }}>No supplier activity yet</p>
          ) : (
            restockHistory.map((item) => (
              <div className="table-row" key={item.id}>
                <span>{item.supplier_name || "-"}</span>
                <span>{item.product_name}</span>
                <span>{item.quantity_added}</span>
                <span>{new Date(item.created_at).toLocaleString("en-KE")}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </section>
  );

  }
  
  function renderSettings() {
    if (currentUser?.role !== "admin") {
      return renderPlaceholder("Access Denied");
    }

    return (
      <section className="inventory-container">
              <div className="panel">
        <div className="panel-head">
          <h2>Pharmacy Settings</h2>
          <p>Configure receipt, branch and stock alerts</p>
        </div>

        <form className="medicine-form" onSubmit={handleSaveSettings}>
          <div className="form-row">
            <input
              placeholder="Pharmacy name"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
            />

            <input
              placeholder="Branch name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <input
              placeholder="Receipt footer"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
            />

            <input
              type="number"
              placeholder="Low stock threshold"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          </div>

          <button type="submit">Save Settings</button>
        </form>
      </div>
      <div className="panel">
  <div className="panel-head">
    <h2>Change Password</h2>
    <p>Update your admin password</p>
  </div>

  <form className="medicine-form" onSubmit={handleChangePassword}>
    <div className="form-row">
      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="New password"
        value={newPasswordValue}
        onChange={(e) => setNewPasswordValue(e.target.value)}
      />
    </div>

    <input
      type="password"
      placeholder="Confirm new password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    <button type="submit">Change Password</button>
  </form>
</div>
        <section className="lower-grid">
          <div className="panel">
            <div className="panel-head">
              <h2>Create User</h2>
              <p>Admin can create staff accounts</p>
            </div>

            <form className="medicine-form" onSubmit={handleAddUser}>
              <div className="form-row">
                <input
                  placeholder="Full name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />

                <input
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>

              <div className="form-row">
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <button type="submit">Create User</button>
            </form>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Users</h2>
              <p>Registered system users</p>
            </div>

            <div className="inventory-table users-table">
              <div className="table-header">
                <span>Name</span>
                <span>Username</span>
                <span>Role</span>
              </div>

              {users.length === 0 ? (
                <p style={{ padding: "16px" }}>No users found</p>
              ) : (
                users.map((user) => (
                  <div className="table-row" key={user.id}>
                    <span>{user.full_name || "-"}</span>
                    <span>{user.username}</span>
                    <span>{user.role}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <section className="panel">
            <div className="panel-head">
              <h2>Audit Logs</h2>
              <p>Recent system activity</p>
            </div>

            <div className="inventory-table audit-table">
              <div className="table-header">
                <span>User</span>
                <span>Role</span>
                <span>Action</span>
                <span>Details</span>
                <span>Date</span>
              </div>

              {auditLogs.length === 0 ? (
                <p style={{ padding: "16px" }}>No audit logs yet</p>
              ) : (
                auditLogs.map((log) => (
                  <div className="table-row" key={log.id}>
                    <span>{log.username || "-"}</span>
                    <span>{log.role || "-"}</span>
                    <span>{log.action}</span>
                    <span>{log.details || "-"}</span>
                    <span>{new Date(log.created_at).toLocaleString("en-KE")}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </section>
    );
  }
  function renderPlaceholder(title: string) {
    return (
      <section className="panel">
        <div className="panel-head">
          <h2>{title}</h2>
          <p>This section will be built after the POS flow.</p>
        </div>
      </section>
    );
  }

  function renderActiveScreen() {
    if (activeTab === "dashboard") return renderDashboard();
    if (activeTab === "pos") return renderPOS();
    if (activeTab === "inventory") return renderInventory();

    if (
      (activeTab === "reports" ||
        activeTab === "suppliers" ||
        activeTab === "settings") &&
      currentUser?.role === "cashier"
    ) {
      return renderPlaceholder("Access Denied");
    }

    if (activeTab === "reports") return renderReports();
    if (activeTab === "suppliers") return renderSuppliers();
    if (activeTab === "settings") return renderSettings();

    return renderDashboard();
  }

  if (!currentUser) {
  return renderLogin();
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>MedTrack POS</h1>
          <p>
            Good afternoon, {currentUser.full_name || currentUser.username} •{" "}
            {appSettings.branch_name || "Main Branch"} • Role: {currentUser.role}
          </p>
        </div>

        <div className="top-actions">
          <span className="sync-badge">● Online & Synced</span>
          <span className="date-box">25 Apr 2026</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="workspace">{renderActiveScreen()}</main>

      <nav className="dock">
        {[
          ["dashboard", "🏠", "Dashboard"],
          ["pos", "🧾", "POS"],
          ["inventory", "📦", "Inventory"],
          ...(currentUser.role === "admin" || currentUser.role === "manager"
            ? [
                ["suppliers", "🚚", "Suppliers"],
                ["reports", "📊", "Reports"],
                ["settings", "⚙️", "Settings"],
              ]
            : []),
        ].map(([key, icon, label]) => (
          <button
            key={key}
            className={activeTab === key ? "active" : ""}
            onClick={() => setActiveTab(key as Tab)}
          >
            <span>{icon}</span>
            <small>{label}</small>
          </button>
        ))}
      </nav>

      {renderReceipt()}
      {renderSaleDetails()}
    </div>
  );
}

export default App;