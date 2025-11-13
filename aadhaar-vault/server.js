// server.js
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const { ethers } = require("ethers");

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const RELAYER_PRIVATE_KEY = (process.env.RELAYER_PRIVATE_KEY || "").trim();
const ADMIN_PRIVATE_KEY = (process.env.ADMIN_PRIVATE_KEY || "").trim();
const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || "").trim();
const PORT = process.env.PORT || 3000;

console.log("CONFIG:", { RPC, CONTRACT_ADDRESS, PORT });

const provider = new ethers.providers.JsonRpcProvider(RPC);
let relayerWallet = null;
let adminWallet = null;
try {
  if (RELAYER_PRIVATE_KEY) relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
  if (ADMIN_PRIVATE_KEY) adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
} catch (e) {
  console.error("Wallet creation error:", e);
}

const ABI = [
  "function submitApplication(bytes32, bytes32, string)",
  "function getApplication(bytes32) view returns (bytes32,bytes32,string,address,address,uint8,uint256)",
  "function verifyApplication(bytes32)",
  "function rejectApplication(bytes32)",
  "event ApplicationSubmitted(bytes32 indexed recordId, bytes32 hash, string cid, address indexed applicant)"
];

const contract = (relayerWallet && CONTRACT_ADDRESS) ? new ethers.Contract(CONTRACT_ADDRESS, ABI, relayerWallet) : null;

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(express.static("public"));
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_session_secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const UPLOADS_DIR = path.join(__dirname, "uploads");
const STORE_DIR = path.join(__dirname, "store");
const SUBMISSIONS_FILE = path.join(STORE_DIR, "submissions.json");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR);
if (!fs.existsSync(SUBMISSIONS_FILE)) fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify({}), "utf8");

function readSubmissions() {
  try { return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf8") || "{}"); }
  catch (e) { console.error("readSubmissions error", e); return {}; }
}
function writeSubmissions(obj) {
  try { fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(obj, null, 2), "utf8"); }
  catch (e) { console.error("writeSubmissions error", e); }
}

// Demo credentials (set via .env to override)
const USER_PASS = process.env.USER_PASS || "userpass";
const GOVT_PASS = process.env.GOVT_PASS || "govtpass";
const ADMIN_PASS = process.env.ADMIN_PASS || "adminpass";

app.post("/login", (req, res) => {
  const { role, password } = req.body || {};
  if (!role || !password) return res.status(400).json({ error: "role & password required" });
  let ok = false;
  if (role === "user" && password === USER_PASS) ok = true;
  if (role === "govt" && password === GOVT_PASS) ok = true;
  if (role === "admin" && password === ADMIN_PASS) ok = true;
  if (!ok) return res.status(403).json({ error: "invalid credentials" });
  req.session.role = role;
  console.log("login success for role:", role);
  res.json({ ok: true, role });
});

app.get("/logout", (req, res) => {
  console.log("logout", req.session && req.session.role);
  req.session.destroy(()=>res.json({ ok: true }));
});

function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.session && req.session.role;
    if (!role) return res.status(401).json({ error: "login required" });
    if (!allowed.includes(role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}

/**
 * Submit endpoint: saves encrypted blob always, optionally stores plaintext (insecure demo),
 * attempts on-chain anchor.
 *
 * Request body:
 *   { identifier: string, encryptedHex: "0x...", revealToGovt: boolean, plainData?: JSON (stringifiable) }
 */
app.post("/api/submit", requireRole("user","govt","admin"), async (req, res) => {
  console.log("POST /api/submit by", req.session.role);
  try {
    const { identifier, encryptedHex, revealToGovt, plainData } = req.body;
    if (!identifier || !encryptedHex) return res.status(400).json({ error: "identifier and encryptedHex required" });

    if (typeof encryptedHex !== 'string') return res.status(400).json({ error: "encryptedHex must be string" });
    let hex = encryptedHex.startsWith("0x") ? encryptedHex.slice(2) : encryptedHex;
    const bytes = Buffer.from(hex, "hex");

    const hash = ethers.utils.keccak256("0x" + bytes.toString("hex"));
    const recordId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(identifier));

    const filename = path.join(UPLOADS_DIR, hash.replace(/^0x/,"") + ".enc");
    fs.writeFileSync(filename, bytes);
    console.log("Saved encrypted file:", filename);

    const cidLike = "local:" + path.basename(filename);

    // write to store immediately
    const subs = readSubmissions();
    subs[recordId] = {
      recordId,
      identifier,
      hash,
      cid: cidLike,
      applicant: req.session.role || "unknown",
      submitTx: null,
      status: "Submitted",
      timestamp: Date.now(),
      file: filename,
      onchainError: null,
      // DEMO: optionally store plaintext (this is insecure and only for the demo)
      plainData: (revealToGovt && plainData) ? plainData : null
    };
    writeSubmissions(subs);
    console.log("Wrote to store:", recordId);

    // attempt on-chain anchor
    if (!contract) {
      console.warn("Contract not configured; skipping on-chain transaction.");
      return res.status(202).json({ ok: false, message: "stored locally; contract not configured", recordId, hash, cid: cidLike });
    }

    try {
      console.log("Calling contract.submitApplication", recordId, hash, cidLike);
      const tx = await contract.submitApplication(recordId, hash, cidLike, { gasLimit: 300000 });
      console.log("Tx sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Tx mined in block:", receipt.blockNumber);
      const updated = readSubmissions();
      if (updated[recordId]) { updated[recordId].submitTx = tx.hash; updated[recordId].submitBlock = receipt.blockNumber; writeSubmissions(updated); }
      return res.json({ ok: true, txHash: tx.hash, blockNumber: receipt.blockNumber, recordId, hash, cid: cidLike });
    } catch (chainErr) {
      console.error("On-chain submit failed:", chainErr && chainErr.message ? chainErr.message : chainErr);
      const updated = readSubmissions();
      if (updated[recordId]) { updated[recordId].onchainError = String(chainErr && chainErr.message ? chainErr.message : chainErr); writeSubmissions(updated); }
      return res.status(202).json({ ok: false, message: "saved locally but on-chain failed", onchainError: String(chainErr && chainErr.message ? chainErr.message : chainErr), recordId, hash, cid: cidLike });
    }

  } catch (e) {
    console.error("submit handler exception:", e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// local store listing (fast) - admin/govt
app.get("/api/all", requireRole("govt","admin"), (req, res) => {
  console.log("GET /api/all by", req.session.role);
  const arr = Object.values(readSubmissions() || {});
  res.json(arr);
});

// pending only
app.get("/api/pending", requireRole("govt","admin"), (req, res) => {
  console.log("GET /api/pending by", req.session.role);
  const arr = Object.values(readSubmissions() || {}).filter(s => s.status === "Submitted");
  res.json(arr);
});

// download encrypted blob
app.get("/api/download/:recordId", requireRole("user","govt","admin"), (req, res) => {
  const rid = req.params.recordId;
  console.log("GET /api/download", rid, "role", req.session.role);
  const subs = readSubmissions();
  const entry = subs[rid];
  if (!entry) return res.status(404).json({ error: "not found" });
  if (!fs.existsSync(entry.file)) return res.status(404).json({ error: "file missing", file: entry.file });
  const bytes = fs.readFileSync(entry.file);
  res.json({ encryptedHex: "0x" + Buffer.from(bytes).toString("hex"), cid: entry.cid, status: entry.status, submitTx: entry.submitTx, verifyTx: entry.verifyTx, onchainError: entry.onchainError, plainData: entry.plainData || null });
});

// single on-chain read
app.get("/api/application/:recordId", requireRole("user","govt","admin"), async (req, res) => {
  const rid = req.params.recordId;
  console.log("GET /api/application", rid);
  if (!contract) return res.status(500).json({ error: "contract not configured" });
  try {
    const data = await contract.getApplication(rid);
    res.json({ recordId: data[0], hash: data[1], cid: data[2], applicant: data[3], verifier: data[4], status: data[5], timestamp: data[6] });
  } catch (e) { console.error("getApplication error:", e); res.status(500).json({ error: e.message || String(e) }); }
});

// all on-chain data for locally-known recordIds (returns plainData if stored)
app.get("/api/all-onchain", requireRole("govt","admin"), async (req, res) => {
  console.log("GET /api/all-onchain by", req.session.role);
  const subs = readSubmissions();
  const recordIds = Object.keys(subs || {});
  const out = [];
  if (!contract) { console.warn("contract not configured; returning local store"); return res.json(Object.values(subs)); }
  for (const rid of recordIds) {
    try {
      const data = await contract.getApplication(rid);
      // include plainData from local store if present (demo)
      out.push({
        recordId: data[0],
        hash: data[1],
        cid: data[2],
        applicant: data[3],
        verifier: data[4],
        status: data[5],
        timestamp: data[6] && data[6].toNumber ? data[6].toNumber() : data[6],
        plainData: subs[rid] ? subs[rid].plainData : null,
        submitTx: subs[rid] ? subs[rid].submitTx : null,
        onchainError: subs[rid] ? subs[rid].onchainError : null
      });
    } catch (e) {
      console.warn("getApplication failed for", rid, e && e.message ? e.message : e);
      out.push(subs[rid]);
    }
  }
  res.json(out);
});

// verify/reject
app.post("/api/admin/verify", requireRole("govt","admin"), async (req, res) => {
  console.log("POST /api/admin/verify by", req.session.role);
  if (!adminWallet || !contract) return res.status(500).json({ error: "admin/contract not configured" });
  try {
    const { recordId } = req.body;
    if (!recordId) return res.status(400).json({ error: "recordId required" });
    const adminContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);
    const tx = await adminContract.verifyApplication(recordId);
    const receipt = await tx.wait();
    const subs = readSubmissions();
    if (subs[recordId]) { subs[recordId].status = "Verified"; subs[recordId].verifyTx = tx.hash; writeSubmissions(subs); }
    console.log("Verified", recordId, "tx", tx.hash);
    res.json({ ok: true, txHash: tx.hash, blockNumber: receipt.blockNumber });
  } catch (e) { console.error("admin verify error:", e); res.status(500).json({ error: e.message || String(e) }); }
});

app.post("/api/admin/reject", requireRole("govt","admin"), async (req, res) => {
  console.log("POST /api/admin/reject by", req.session.role);
  if (!adminWallet || !contract) return res.status(500).json({ error: "admin/contract not configured" });
  try {
    const { recordId } = req.body;
    if (!recordId) return res.status(400).json({ error: "recordId required" });
    const adminContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);
    const tx = await adminContract.rejectApplication(recordId);
    const receipt = await tx.wait();
    const subs = readSubmissions();
    if (subs[recordId]) { subs[recordId].status = "Rejected"; subs[recordId].rejectTx = tx.hash; writeSubmissions(subs); }
    console.log("Rejected", recordId, "tx", tx.hash);
    res.json({ ok: true, txHash: tx.hash, blockNumber: receipt.blockNumber });
  } catch (e) { console.error("admin reject error:", e); res.status(500).json({ error: e.message || String(e) }); }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  if (relayerWallet) console.log("Relayer wallet:", relayerWallet.address);
  if (adminWallet) console.log("Admin wallet:", adminWallet.address);
  if (!contract) console.warn("Contract not available. Set CONTRACT_ADDRESS and RELAYER_PRIVATE_KEY in .env");
});
