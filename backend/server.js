const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const { createHash, createHmac, randomBytes, randomUUID, scrypt, timingSafeEqual } = require("node:crypto");
const { promisify } = require("node:util");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, "data");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const PRODUCTS_FILE = process.env.PRODUCT_DATA_FILE || path.join(DATA_DIR, "products.json");
const ORDERS_FILE = process.env.ORDER_DATA_FILE || path.join(DATA_DIR, "orders.json");
const ADMIN_COOKIE = "shopfront_admin_session";
const CUSTOMER_COOKIE = "shopfront_customer_session";
const ADMIN_SESSION_SECONDS = 8 * 60 * 60;
const CUSTOMER_SESSION_SECONDS = 30 * 24 * 60 * 60;
const SHOPFRONT_ORIGIN = process.env.SHOPFRONT_ORIGIN || "http://localhost:3000";
const LOGIN_FAILURE_LIMIT = 5;
const LOGIN_LOCK_SECONDS = 15 * 60;
const USERS_FILE = process.env.CUSTOMER_DATA_FILE || path.join(DATA_DIR, "users.json");
const ORDER_SHIPPING_FEE = 79;
const EMAIL_VERIFICATION_SECONDS = 24 * 60 * 60;
const PASSWORD_RESET_SECONDS = 60 * 60;
const scryptAsync = promisify(scrypt);
const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    name: "Premium Cotton T-Shirt",
    sku: "TSH-001",
    shortDescription: "Comfortable premium cotton t-shirt for everyday wear",
    fullDescription:
      "Made from 100% premium cotton, this t-shirt offers superior comfort and durability. Perfect for casual outings and everyday wear.",
    category: "Clothing",
    subCategory: "T-Shirts",
    brand: "ShopFront",
    sellingPrice: 599,
    mrp: 999,
    discount: 40,
    taxGst: 5,
    stockQuantity: 150,
    stockStatus: "in_stock",
    minimumOrderQuantity: 1,
    images: [
      {
        id: "img1",
        url: "https://img.rocket.new/generatedImages/rocket_gen_img_136745af3-1772293160467.png",
        alt: "White premium cotton t-shirt front view",
        isMain: true,
      },
    ],
    color: "White",
    size: "S, M, L, XL",
    material: "Cotton",
    weight: "200g",
    dimensions: "30x25x2 cm",
    tags: ["cotton", "t-shirt", "casual"],
    metaTitle: "Premium Cotton T-Shirt | ShopFront",
    metaDescription: "Buy premium cotton t-shirt at best price",
    urlSlug: "premium-cotton-t-shirt",
    status: "published",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Slim Fit Denim Jeans",
    sku: "JNS-002",
    shortDescription: "Classic slim fit denim jeans with stretch comfort",
    fullDescription:
      "These slim fit denim jeans combine style with comfort. Made with stretch denim fabric for ease of movement.",
    category: "Clothing",
    subCategory: "Jeans",
    brand: "DenimCo",
    sellingPrice: 1299,
    mrp: 2499,
    discount: 48,
    taxGst: 12,
    stockQuantity: 75,
    stockStatus: "in_stock",
    minimumOrderQuantity: 1,
    images: [
      {
        id: "img2",
        url: "https://images.unsplash.com/photo-1581778322231-7c89a7e4bb87",
        alt: "Blue slim fit denim jeans",
        isMain: true,
      },
    ],
    color: "Blue",
    size: "28, 30, 32, 34, 36",
    material: "Denim",
    weight: "600g",
    dimensions: "40x30x3 cm",
    tags: ["denim", "jeans", "slim-fit"],
    metaTitle: "Slim Fit Denim Jeans | ShopFront",
    metaDescription: "Shop slim fit denim jeans at great prices",
    urlSlug: "slim-fit-denim-jeans",
    status: "published",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Running Sports Shoes",
    sku: "SHO-003",
    shortDescription: "Lightweight running shoes with cushioned sole",
    fullDescription:
      "Engineered for performance, these running shoes feature advanced cushioning technology and breathable mesh upper.",
    category: "Footwear",
    subCategory: "Sports Shoes",
    brand: "SpeedRun",
    sellingPrice: 2499,
    mrp: 4999,
    discount: 50,
    taxGst: 18,
    stockQuantity: 8,
    stockStatus: "low_stock",
    minimumOrderQuantity: 1,
    images: [
      {
        id: "img3",
        url: "https://images.unsplash.com/photo-1709292274028-4a59346f2d5a",
        alt: "Red and white running sports shoes",
        isMain: true,
      },
    ],
    color: "Red/White",
    size: "6, 7, 8, 9, 10, 11",
    material: "Mesh/Rubber",
    weight: "350g",
    dimensions: "30x12x10 cm",
    tags: ["shoes", "running", "sports"],
    metaTitle: "Running Sports Shoes | ShopFront",
    metaDescription: "Best running shoes for performance",
    urlSlug: "running-sports-shoes",
    status: "published",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function readProducts() {
  try {
    const savedProducts = JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
    return Array.isArray(savedProducts) ? savedProducts : [...SAMPLE_PRODUCTS];
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Could not read saved products:", error.message);
    }
    return [...SAMPLE_PRODUCTS];
  }
}

let products = readProducts();
const loginFailures = new Map();
const customerLoginFailures = new Map();

function readUsers() {
  try {
    const savedUsers = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    return Array.isArray(savedUsers) ? savedUsers : [];
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Could not read customer accounts:", error.message);
    return [];
  }
}

function readOrders() {
  try {
    const savedOrders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
    return Array.isArray(savedOrders) ? savedOrders : [];
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Could not read saved orders:", error.message);
    return [];
  }
}

function saveOrders() {
  const temporaryFile = `${ORDERS_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(orders, null, 2));
  fs.renameSync(temporaryFile, ORDERS_FILE);
}

function createActionToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: createHash("sha256").update(token).digest("hex") };
}

function hasValidActionToken(token, tokenHash) {
  if (!token || !tokenHash) return false;
  return safeEqual(createHash("sha256").update(token).digest("hex"), tokenHash);
}

function getPublicSiteUrl() {
  return (process.env.PUBLIC_SITE_URL || SHOPFRONT_ORIGIN).replace(/\/$/, "");
}

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.EMAIL_FROM);
}

async function sendCustomerActionEmail({ user, subject, text, url }) {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") {
      const error = new Error("Email delivery is not configured. Set the SMTP settings on the backend.");
      error.status = 503;
      throw error;
    }
    console.log(`Development-only ${subject} link for ${user.email}: ${url}`);
    return false;
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject,
    text: `${text}\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
  });
  return true;
}

let users = readUsers();
let orders = readOrders();

function saveUsers() {
  const temporaryFile = `${USERS_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(users, null, 2));
  fs.renameSync(temporaryFile, USERS_FILE);
}

function toPublicCustomer(user) {
  return { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified === true, createdAt: user.createdAt };
}

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const derivedKey = await scryptAsync(password, salt, 64);
  return { salt, hash: derivedKey.toString("hex") };
}

async function verifyPassword(password, user) {
  const { hash } = await hashPassword(password, user.passwordSalt);
  return safeEqual(hash, user.passwordHash);
}

function saveProducts() {
  const temporaryFile = `${PRODUCTS_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(products, null, 2));
  fs.renameSync(temporaryFile, PRODUCTS_FILE);
}

function storeProductImages(images, request) {
  if (!Array.isArray(images)) return [];

  return images.map((image) => {
    if (!image || typeof image.url !== "string" || !image.url.startsWith("data:")) {
      return image;
    }

    const match = image.url.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/);
    if (!match || !ALLOWED_IMAGE_TYPES[match[1]]) {
      const error = new Error("Upload JPG, PNG, WEBP, or GIF product images.");
      error.status = 400;
      throw error;
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > 3 * 1024 * 1024) {
      const error = new Error("Each product image must be 3 MB or smaller.");
      error.status = 413;
      throw error;
    }

    const fileName = `${randomUUID()}.${ALLOWED_IMAGE_TYPES[match[1]]}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), buffer, { flag: "wx" });

    return {
      ...image,
      url: `${request.protocol}://${request.get("host")}/uploads/${fileName}`,
    };
  });
}

function removeProductImages(images) {
  for (const image of images || []) {
    if (typeof image?.url !== "string") continue;
    let fileName;
    try {
      fileName = new URL(image.url).pathname.split("/").pop();
    } catch {
      continue;
    }
    if (fileName && /^[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(fileName)) {
      fs.rmSync(path.join(UPLOAD_DIR, fileName), { force: true });
    }
  }
}

function hasDuplicateSku(sku, ignoredId) {
  const normalizedSku = String(sku || "").trim().toLowerCase();
  return products.some(
    (product) =>
      product.id !== ignoredId && String(product.sku || "").trim().toLowerCase() === normalizedSku,
  );
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function signSession(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", process.env.ADMIN_JWT_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function readSession(token) {
  if (!token || !process.env.ADMIN_JWT_SECRET) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = createHmac("sha256", process.env.ADMIN_JWT_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  if (!safeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

function getCookie(request, name) {
  const cookieHeader = request.headers.cookie || "";
  const entry = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  if (!entry) return "";
  try {
    return decodeURIComponent(entry.slice(name.length + 1));
  } catch {
    return "";
  }
}

function requireFrontendOrigin(request, response, next) {
  const origin = request.get("origin");
  if (!origin || (!allowedOrigins.has(origin) && !isShopfrontVercelPreviewOrigin(origin))) {
    return response.status(403).json({ message: "Request origin is not allowed." });
  }
  return next();
}

function requireAdmin(request, response, next) {
  if (!isAdminConfigured()) {
    return response.status(503).json({ message: "Admin login is not configured on the server." });
  }

  const session = readSession(getCookie(request, ADMIN_COOKIE));
  if (!session || session.role !== "admin") {
    return response.status(401).json({ message: "Admin login required." });
  }

  request.admin = session;
  return next();
}

function isAdminConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      process.env.ADMIN_PASSWORD.length >= 12 &&
      process.env.ADMIN_JWT_SECRET &&
      process.env.ADMIN_JWT_SECRET.length >= 32,
  );
}

function setAdminCookie(response, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const sameSite = ["Strict", "Lax", "None"].includes(process.env.ADMIN_COOKIE_SAME_SITE)
    ? process.env.ADMIN_COOKIE_SAME_SITE
    : "Strict";
  response.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=${ADMIN_SESSION_SECONDS}${secure}`,
  );
}

function setCustomerCookie(response, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const sameSite = ["Strict", "Lax", "None"].includes(process.env.CUSTOMER_COOKIE_SAME_SITE)
    ? process.env.CUSTOMER_COOKIE_SAME_SITE
    : "Strict";
  response.setHeader(
    "Set-Cookie",
    `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=${CUSTOMER_SESSION_SECONDS}${secure}`,
  );
}

function clearCustomerCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const sameSite = ["Strict", "Lax", "None"].includes(process.env.CUSTOMER_COOKIE_SAME_SITE)
    ? process.env.CUSTOMER_COOKIE_SAME_SITE
    : "Strict";
  response.setHeader(
    "Set-Cookie",
    `${CUSTOMER_COOKIE}=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${secure}`,
  );
}

function requireCustomer(request, response, next) {
  const session = readSession(getCookie(request, CUSTOMER_COOKIE));
  if (!session || session.role !== "customer") {
    return response.status(401).json({ message: "Please sign in to continue." });
  }
  const customer = users.find((user) => user.id === session.sub);
  if (!customer) return response.status(401).json({ message: "Customer account no longer exists." });
  if (session.sessionVersion !== (customer.sessionVersion || 0)) {
    return response.status(401).json({ message: "This session has expired. Please sign in again." });
  }
  if (customer.emailVerified !== true) {
    return response.status(403).json({ message: "Please verify your email address before continuing." });
  }
  request.customer = customer;
  return next();
}

function isLocked(loginMap, key) {
  const state = loginMap.get(key);
  if (!state) return false;
  if (state.lockedUntil > Date.now()) return true;
  if (state.lockedUntil && state.lockedUntil <= Date.now()) loginMap.delete(key);
  return false;
}

function recordLoginFailure(loginMap, key) {
  const failures = (loginMap.get(key)?.failures || 0) + 1;
  loginMap.set(key, {
    failures,
    lockedUntil: failures >= LOGIN_FAILURE_LIMIT ? Date.now() + LOGIN_LOCK_SECONDS * 1000 : 0,
  });
}

function determineStockStatus(stockQuantity) {
  if (stockQuantity === 0) return "out_of_stock";
  if (stockQuantity <= 10) return "low_stock";
  return "in_stock";
}

function normalizeProduct(data) {
  const stockQuantity = Number(data.stockQuantity ?? 0);
  const product = {
    ...data,
    id: data.id || `${Date.now()}`,
    stockQuantity,
    stockStatus: data.stockStatus || determineStockStatus(stockQuantity),
    status: data.status || "draft",
    images: Array.isArray(data.images) ? data.images : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!product.stockStatus) {
    product.stockStatus = determineStockStatus(product.stockQuantity);
  }

  return product;
}

const allowedOrigins = new Set([SHOPFRONT_ORIGIN]);
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.add("http://localhost:3000");
  allowedOrigins.add("http://localhost:3001");
}

function isShopfrontVercelPreviewOrigin(origin) {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && /^shopfront-[a-z0-9]+-nawaz5\.vercel\.app$/i.test(url.hostname);
  } catch {
    return false;
  }
}

app.use(cors({
  origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin) || isShopfrontVercelPreviewOrigin(origin)),
  credentials: true,
}));
app.use(express.json({ limit: "40mb" }));
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "1y", immutable: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Shopfront Backend is running!",
  });
});

app.post("/api/admin/login", requireFrontendOrigin, (req, res) => {
  if (!isAdminConfigured()) {
    return res.status(503).json({ message: "Admin login is not configured. Set the backend admin email, password, and a 32-character session secret." });
  }

  const clientAddress = req.ip;
  const failureState = loginFailures.get(clientAddress);
  if (failureState && failureState.lockedUntil > Date.now()) {
    return res.status(429).json({ message: "Too many sign-in attempts. Try again in 15 minutes." });
  }
  if (failureState && failureState.lockedUntil <= Date.now()) loginFailures.delete(clientAddress);

  const { email, password } = req.body || {};
  if (!safeEqual(String(email || "").trim().toLowerCase(), process.env.ADMIN_EMAIL.trim().toLowerCase()) ||
      !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    const failures = (loginFailures.get(clientAddress)?.failures || 0) + 1;
    loginFailures.set(clientAddress, {
      failures,
      lockedUntil: failures >= LOGIN_FAILURE_LIMIT ? Date.now() + LOGIN_LOCK_SECONDS * 1000 : 0,
    });
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  loginFailures.delete(clientAddress);
  const now = Math.floor(Date.now() / 1000);
  const token = signSession({ role: "admin", email: process.env.ADMIN_EMAIL, iat: now, exp: now + ADMIN_SESSION_SECONDS });
  setAdminCookie(res, token);
  return res.json({ email: process.env.ADMIN_EMAIL, role: "admin" });
});

app.get("/api/admin/session", requireAdmin, (req, res) => {
  res.json({ email: req.admin.email, role: req.admin.role });
});

app.post("/api/admin/logout", requireFrontendOrigin, (req, res) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const sameSite = ["Strict", "Lax", "None"].includes(process.env.ADMIN_COOKIE_SAME_SITE)
    ? process.env.ADMIN_COOKIE_SAME_SITE
    : "Strict";
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE}=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${secure}`);
  return res.status(204).send();
});

app.post("/api/auth/register", requireFrontendOrigin, async (req, res) => {
  const signingSecret = process.env.ADMIN_JWT_SECRET;
  if (!signingSecret || signingSecret.length < 32) {
    return res.status(503).json({ message: "Customer sign-in is not configured on the server." });
  }
  if (process.env.NODE_ENV === "production" && !hasSmtpConfig()) {
    return res.status(503).json({ message: "Email delivery must be configured before customers can register." });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const ipAddress = req.ip;
  if (isLocked(customerLoginFailures, ipAddress)) {
    return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." });
  }
  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ message: "Name must be between 2 and 80 characters." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
  }
  if (users.some((user) => user.email === email)) {
    recordLoginFailure(customerLoginFailures, ipAddress);
    return res.status(409).json({ message: "An account with this email already exists. Sign in instead." });
  }

  const passwordCredentials = await hashPassword(password);
  if (users.some((user) => user.email === email)) {
    return res.status(409).json({ message: "An account with this email already exists. Sign in instead." });
  }
  const verification = createActionToken();
  const customer = {
    id: randomUUID(),
    name,
    email,
    passwordSalt: passwordCredentials.salt,
    passwordHash: passwordCredentials.hash,
    emailVerified: false,
    emailVerificationHash: verification.hash,
    emailVerificationExpiresAt: Date.now() + EMAIL_VERIFICATION_SECONDS * 1000,
    sessionVersion: 0,
    createdAt: new Date().toISOString(),
  };
  users = [customer, ...users];
  saveUsers();
  const verificationUrl = `${getPublicSiteUrl()}/verify-email?token=${encodeURIComponent(verification.token)}`;
  try {
    const emailSent = await sendCustomerActionEmail({
      user: customer,
      subject: "Verify your ShopFront email",
      text: `Hello ${customer.name}, verify your email within 24 hours to activate your ShopFront account.`,
      url: verificationUrl,
    });
    customerLoginFailures.delete(ipAddress);
    return res.status(201).json({
      message: "Account created. Verify your email to finish registration.",
      verificationRequired: true,
      developmentVerificationUrl: emailSent ? undefined : process.env.NODE_ENV === "production" ? undefined : verificationUrl,
    });
  } catch (error) {
    users = users.filter((user) => user.id !== customer.id);
    saveUsers();
    throw error;
  }
});

app.post("/api/auth/login", requireFrontendOrigin, async (req, res) => {
  if (!process.env.ADMIN_JWT_SECRET || process.env.ADMIN_JWT_SECRET.length < 32) {
    return res.status(503).json({ message: "Customer sign-in is not configured on the server." });
  }

  const ipAddress = req.ip;
  if (isLocked(customerLoginFailures, ipAddress)) {
    return res.status(429).json({ message: "Too many attempts. Try again in 15 minutes." });
  }
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const customer = users.find((user) => user.email === email);
  const passwordMatches = customer ? await verifyPassword(password, customer) : false;
  if (!customer || !passwordMatches) {
    recordLoginFailure(customerLoginFailures, ipAddress);
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  if (customer.emailVerified !== true) {
    return res.status(403).json({ message: "Please verify your email before signing in.", verificationRequired: true });
  }

  customerLoginFailures.delete(ipAddress);
  const now = Math.floor(Date.now() / 1000);
  const token = signSession({ role: "customer", sub: customer.id, sessionVersion: customer.sessionVersion || 0, iat: now, exp: now + CUSTOMER_SESSION_SECONDS });
  setCustomerCookie(res, token);
  return res.json({ customer: toPublicCustomer(customer) });
});

app.post("/api/auth/verify-email", requireFrontendOrigin, (req, res) => {
  const token = String(req.body?.token || "");
  const customer = users.find((user) => hasValidActionToken(token, user.emailVerificationHash));
  if (!customer || customer.emailVerificationExpiresAt < Date.now()) {
    return res.status(400).json({ message: "This verification link is invalid or expired. Request a new one." });
  }

  customer.emailVerified = true;
  delete customer.emailVerificationHash;
  delete customer.emailVerificationExpiresAt;
  saveUsers();
  const now = Math.floor(Date.now() / 1000);
  const session = signSession({ role: "customer", sub: customer.id, sessionVersion: customer.sessionVersion || 0, iat: now, exp: now + CUSTOMER_SESSION_SECONDS });
  setCustomerCookie(res, session);
  return res.json({ customer: toPublicCustomer(customer) });
});

app.post("/api/auth/verification/resend", requireFrontendOrigin, async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const customer = users.find((user) => user.email === email && user.emailVerified !== true);
  const result = { message: "If an unverified account exists for that email, a verification link has been sent." };
  if (!customer) return res.json(result);
  if (process.env.NODE_ENV === "production" && !hasSmtpConfig()) {
    return res.status(503).json({ message: "Email delivery is not configured on the server." });
  }

  const verification = createActionToken();
  customer.emailVerificationHash = verification.hash;
  customer.emailVerificationExpiresAt = Date.now() + EMAIL_VERIFICATION_SECONDS * 1000;
  saveUsers();
  const verificationUrl = `${getPublicSiteUrl()}/verify-email?token=${encodeURIComponent(verification.token)}`;
  const emailSent = await sendCustomerActionEmail({
    user: customer,
    subject: "Verify your ShopFront email",
    text: `Hello ${customer.name}, use this link to verify your ShopFront account within 24 hours.`,
    url: verificationUrl,
  });
  if (!emailSent && process.env.NODE_ENV !== "production") result.developmentVerificationUrl = verificationUrl;
  return res.json(result);
});

app.post("/api/auth/password/forgot", requireFrontendOrigin, async (req, res) => {
  if (process.env.NODE_ENV === "production" && !hasSmtpConfig()) {
    return res.status(503).json({ message: "Email delivery is not configured on the server." });
  }
  const email = String(req.body?.email || "").trim().toLowerCase();
  const customer = users.find((user) => user.email === email && user.emailVerified === true);
  const result = { message: "If a verified account exists for that email, a password reset link has been sent." };
  if (!customer) return res.json(result);

  const reset = createActionToken();
  customer.passwordResetHash = reset.hash;
  customer.passwordResetExpiresAt = Date.now() + PASSWORD_RESET_SECONDS * 1000;
  saveUsers();
  const resetUrl = `${getPublicSiteUrl()}/reset-password?token=${encodeURIComponent(reset.token)}`;
  const emailSent = await sendCustomerActionEmail({
    user: customer,
    subject: "Reset your ShopFront password",
    text: "A password reset was requested for your ShopFront account. This link expires in one hour.",
    url: resetUrl,
  });
  if (!emailSent && process.env.NODE_ENV !== "production") result.developmentResetUrl = resetUrl;
  return res.json(result);
});

app.post("/api/auth/password/reset", requireFrontendOrigin, async (req, res) => {
  const token = String(req.body?.token || "");
  const password = String(req.body?.password || "");
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
  }
  const customer = users.find((user) => hasValidActionToken(token, user.passwordResetHash));
  if (!customer || customer.passwordResetExpiresAt < Date.now()) {
    return res.status(400).json({ message: "This reset link is invalid or expired. Request another one." });
  }

  const credentials = await hashPassword(password);
  customer.passwordSalt = credentials.salt;
  customer.passwordHash = credentials.hash;
  customer.sessionVersion = (customer.sessionVersion || 0) + 1;
  delete customer.passwordResetHash;
  delete customer.passwordResetExpiresAt;
  saveUsers();
  const now = Math.floor(Date.now() / 1000);
  const session = signSession({ role: "customer", sub: customer.id, sessionVersion: customer.sessionVersion, iat: now, exp: now + CUSTOMER_SESSION_SECONDS });
  setCustomerCookie(res, session);
  return res.json({ customer: toPublicCustomer(customer) });
});

app.get("/api/auth/session", requireCustomer, (req, res) => {
  res.json({ customer: toPublicCustomer(req.customer) });
});

app.post("/api/auth/logout", requireFrontendOrigin, (req, res) => {
  clearCustomerCookie(res);
  return res.status(204).send();
});

app.get("/api/orders", requireCustomer, (req, res) => {
  res.json(orders.filter((order) => order.customerId === req.customer.id));
});

app.post("/api/orders", requireFrontendOrigin, requireCustomer, (req, res) => {
  const paymentMethod = req.body?.paymentMethod;
  if (paymentMethod !== "cod") {
    return res.status(400).json({ message: "Online card payments are not available yet. Choose Cash on Delivery." });
  }

  const shippingAddress = req.body?.shippingAddress || {};
  const address = String(shippingAddress.address || "").trim();
  const city = String(shippingAddress.city || "").trim();
  const postalCode = String(shippingAddress.postalCode || "").trim();
  if (address.length < 5 || city.length < 2 || !/^[a-zA-Z0-9 -]{4,12}$/.test(postalCode)) {
    return res.status(400).json({ message: "Enter a valid delivery address, city, and postal code." });
  }
  if (!Array.isArray(req.body?.items) || req.body.items.length === 0 || req.body.items.length > 50) {
    return res.status(400).json({ message: "Your cart is empty or has too many items." });
  }

  const orderItems = [];
  for (const requestedItem of req.body.items) {
    const product = products.find((item) => item.id === String(requestedItem.productId) && item.status === "published");
    const quantity = Number(requestedItem.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "One or more products in the cart are invalid." });
    }
    if (product.stockStatus === "out_of_stock" || quantity > product.stockQuantity) {
      return res.status(409).json({ message: `${product.name} does not have enough stock for this order.` });
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity,
      unitPrice: product.sellingPrice,
      lineTotal: product.sellingPrice * quantity,
    });
  }

  const subtotal = orderItems.reduce((total, item) => total + item.lineTotal, 0);
  const order = {
    id: randomUUID(),
    orderNumber: `SF-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`,
    customerId: req.customer.id,
    customerName: req.customer.name,
    customerEmail: req.customer.email,
    items: orderItems,
    shippingAddress: { address, city, postalCode },
    subtotal,
    shipping: ORDER_SHIPPING_FEE,
    total: subtotal + ORDER_SHIPPING_FEE,
    paymentMethod: "cod",
    paymentStatus: "due_on_delivery",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  orders = [order, ...orders];
  for (const orderItem of orderItems) {
    const product = products.find((item) => item.id === orderItem.productId);
    product.stockQuantity -= orderItem.quantity;
    product.stockStatus = determineStockStatus(product.stockQuantity);
    product.updatedAt = new Date().toISOString();
  }
  saveProducts();
  saveOrders();
  return res.status(201).json({ order });
});

app.get("/api/products", (req, res) => {
  res.json(products.filter((product) => product.status === "published"));
});

app.get("/api/products/:id", (req, res) => {
  const product = products.find((item) => item.id === req.params.id && item.status === "published");
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

app.get("/api/admin/products", requireAdmin, (req, res) => {
  res.json(products);
});

app.post("/api/admin/products", requireFrontendOrigin, requireAdmin, (req, res) => {
  if (hasDuplicateSku(req.body.sku)) {
    return res.status(409).json({ message: "A product with this SKU already exists." });
  }

  const product = normalizeProduct({
    ...req.body,
    images: storeProductImages(req.body.images, req),
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  });

  products = [product, ...products];
  saveProducts();
  res.status(201).json(product);
});

app.put("/api/admin/products/:id", requireFrontendOrigin, requireAdmin, (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (hasDuplicateSku(req.body.sku, req.params.id)) {
    return res.status(409).json({ message: "A product with this SKU already exists." });
  }

  const updatedProduct = normalizeProduct({
    ...products[index],
    ...req.body,
    images: storeProductImages(req.body.images, req),
    id: req.params.id,
    updatedAt: new Date().toISOString(),
  });

  const removedImages = products[index].images.filter(
    (oldImage) => !updatedProduct.images.some((newImage) => newImage.url === oldImage.url),
  );
  products[index] = updatedProduct;
  saveProducts();
  removeProductImages(removedImages);
  return res.json(updatedProduct);
});

app.patch("/api/admin/products/:id/toggle-status", requireFrontendOrigin, requireAdmin, (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const product = products[index];
  const updatedProduct = {
    ...product,
    status: product.status === "published" ? "draft" : "published",
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  saveProducts();
  return res.json(updatedProduct);
});

app.delete("/api/admin/products/:id", requireFrontendOrigin, requireAdmin, (req, res) => {
  const deletedProduct = products.find((item) => item.id === req.params.id);
  const originalLength = products.length;
  products = products.filter((item) => item.id !== req.params.id);

  if (products.length === originalLength) {
    return res.status(404).json({ message: "Product not found" });
  }

  saveProducts();
  if (deletedProduct) removeProductImages(deletedProduct.images);
  return res.status(204).send();
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.type === "entity.too.large" ? 413 : 500);
  console.error("API request failed:", {
    method: req.method,
    path: req.path,
    status,
    code: error.code,
    command: error.command,
    message: error.message,
  });
  let message = error.message;
  if (status === 500 && req.path === "/api/auth/register") {
    message = "We couldn't send the verification email. Check the backend SMTP settings and try again.";
  } else if (status === 500 && req.path.startsWith("/api/admin/products")) {
    message = "The product could not be saved. Please try again.";
  } else if (status === 500) {
    message = "Something went wrong. Please try again.";
  }
  return res.status(status).json({
    message,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
