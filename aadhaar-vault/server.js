// server.js — server-side anchor, no Web3.Storage, no MetaMask required
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const RPC = process.env.RPC_URL || "http://127.0.0.1:8545";
const RELAYER_PRIVATE_KEY = (process.env.RELAYER_PRIVATE_KEY || "").trim();
const ADMIN_PRIVATE_KEY = (process.env.ADMIN_PRIVATE_KEY || "").trim();
const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || "").trim();
const PORT = process.env.PORT || 3000;

if (!CONTRACT_ADDRESS) {
  console.error("Set CONTRACT_ADDRESS in .env (deployed contract address)");
  process.exit(1);
}
if (!RELAYER_PRIVATE_KEY) {
  console.error("Set RELAYER_PRIVATE_KEY in .env");
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const adminWallet = ADMIN_PRIVATE_KEY ? new ethers.Wallet(ADMIN_PRIVATE_KEY, provider) : null;

const ABI = [
  "function submitApplication(bytes32, bytes32, string)",
  "function getApplication(bytes32) view returns (bytes32,bytes32,string,address,address,uint8,uint256)",
  "function verifyApplication(bytes32)",
  "function rejectApplication(bytes32)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, relayerWallet);
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // allow large encrypted blobs
app.use(express.static("public"));

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// POST /api/submit
// payload: { identifier: string, encryptedHex: "0x..." }
app.post("/api/submit", async (req, res) => {
  try {
    const { identifier, encryptedHex } = req.body;
    if (!identifier || !encryptedHex) return res.status(400).json({ error: "identifier and encryptedHex required" });

    // normalize encrypted hex
    let hex = encryptedHex;
    if (hex.startsWith("0x")) hex = hex.slice(2);
    const bytes = Buffer.from(hex, "hex");

    // compute hash and recordId
    const hash = ethers.utils.keccak256("0x" + bytes.toString("hex")); // 0x...
    const recordId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(identifier)); // 0x...

    // save encrypted blob to uploads directory using hash as filename
    const filename = path.join(UPLOADS_DIR, hash.replace(/^0x/, "") + ".enc");
    fs.writeFileSync(filename, bytes);

    // Optionally: use a "cid" string to represent storage location. Since we're not using IPFS, use file path or the hash as our 'cid' value for on-chain reference.
    // For privacy, storing full server file path on-chain is not necessary; we use the hash itself as "cid" or a short path.
    const cidLike = "local:" + path.basename(filename); // e.g., "local:af3b...enc"

    // Submit on-chain via relayer wallet
    const tx = await contract.submitApplication(recordId, hash, cidLike, { gasLimit: 300000 });
    const receipt = await tx.wait();

    return res.json({
      ok: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      recordId,
      hash,
      cid: cidLike
    });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// GET application by recordId (same as before)
app.get("/api/application/:recordId", async (req, res) => {
  try {
    const rid = req.params.recordId;
    const data = await contract.getApplication(rid);
    return res.json({
      recordId: data[0],
      hash: data[1],
      cid: data[2],
      applicant: data[3],
      verifier: data[4],
      status: data[5],
      timestamp: data[6] && data[6].toNumber ? data[6].toNumber() : data[6]
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

// admin endpoints (unchanged)
app.post("/api/admin/verify", async (req, res) => {
  if (!adminWallet) return res.status(403).json({ error: "admin key not configured" });
  try {
    const { recordId } = req.body;
    if (!recordId) return res.status(400).json({ error: "recordId required" });
    const adminContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);
    const tx = await adminContract.verifyApplication(recordId);
    const receipt = await tx.wait();
    res.json({ ok: true, txHash: tx.hash, blockNumber: receipt.blockNumber });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message || String(e) }); }
});

app.post("/api/admin/reject", async (req, res) => {
  if (!adminWallet) return res.status(403).json({ error: "admin key not configured" });
  try {
    const { recordId } = req.body;
    if (!recordId) return res.status(400).json({ error: "recordId required" });
    const adminContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, adminWallet);
    const tx = await adminContract.rejectApplication(recordId);
    const receipt = await tx.wait();
    res.json({ ok: true, txHash: tx.hash, blockNumber: receipt.blockNumber });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message || String(e) }); }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  console.log("Relayer wallet:", relayerWallet.address);
  if (adminWallet) console.log("Admin wallet:", adminWallet.address);
});