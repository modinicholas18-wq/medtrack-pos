import db from "./db";

// Insert test product
const insert = db.prepare(
  "INSERT INTO products (name, brand, price) VALUES (?, ?, ?)"
);

insert.run("Paracetamol", "Panadol", 50);

// Fetch all products
const products = db.prepare("SELECT * FROM products").all();

console.log("Products:", products);