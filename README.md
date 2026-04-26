# 💊 MedTrack POS

**MedTrack POS** is a modern, offline-first pharmacy point-of-sale system designed for efficient sales, inventory tracking, and pharmacy management.

---

## 🚀 Features

* 🧾 POS system for fast sales processing
* 📦 Inventory management with batch & expiry tracking
* 🔄 Stock restocking with supplier tracking
* 📊 Sales reports & analytics
* 👥 User management (Admin, Cashier roles)
* 🔐 Secure authentication (hashed passwords)
* 🧠 Audit logs for system tracking
* ⚡ Offline-first (works without internet)

---

## 🖥️ Tech Stack

* **Frontend:** React (Vite + TypeScript)
* **Desktop App:** Electron
* **Database:** SQLite (better-sqlite3)
* **Charts:** Recharts

---

## 📦 Installation (Development)

```bash
git clone https://github.com/modinicholas18-wq/medtrack-pos.git
cd medtrack-pos
npm install
npm run desktop
```

---

## 🛠️ Build Desktop App

```bash
npm run dist
```

### Outputs:

* `.AppImage` (Linux portable app)
* `.deb` (Linux installer)
* `.exe` (Windows installer — build on Windows)

---

## 🔑 Default Login

```text
Username: admin
Password: admin123
```

⚠️ Change this immediately after first login.

---

## 📁 Project Structure

```
medtrack-pos/
├── electron/        # Electron main process
├── src/             # React frontend
├── database/        # SQLite database logic
├── assets/          # Icons & assets
├── dist/            # Build outputs
```

---

## 🌐 Roadmap

* ☁️ Cloud sync (online + offline support)
* 🤖 AI-powered drug assistant
* 📱 Mobile support
* 🏪 Multi-branch pharmacy support

---

## 👨‍💻 Author

**Nicholas Modi**
📧 [modinicholas18@gmail.com](mailto:modinicholas18@gmail.com)

---

## 📄 License

Currently not licensed.
