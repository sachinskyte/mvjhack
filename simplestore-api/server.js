// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { ethers } = require("ethers");

// ========== CONFIG - EDIT AFTER DEPLOY ==========
const RPC = "http://127.0.0.1:8545"; // Hardhat node RPC
const PRIVATE_KEY = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"; // demo: paste one of the private keys shown when you run `npx hardhat node`
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// ===============================================

if (PRIVATE_KEY.includes("<PASTE") || CONTRACT_ADDRESS.includes("<PASTE")) {
  console.error("Edit server.js and set PRIVATE_KEY and CONTRACT_ADDRESS before running.");
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(RPC);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const ABI = [
  "function storeName(string _name) external",
  "function readName(address who) external view returns (string)",
  "event NameStored(address indexed who, string name)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve frontend

// POST /api/store  { name: "Alice" }  -> server sends transaction on behalf of wallet
app.post("/api/store", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const tx = await contract.storeName(name);
    const receipt = await tx.wait();
    return res.json({
      ok: true,
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// GET /api/read/:addr -> returns stored name for address
app.get("/api/read/:addr", async (req, res) => {
  try {
    const addr = req.params.addr;
    const name = await contract.readName(addr);
    return res.json({ address: addr, name });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// GET /api/events?fromBlock=0 -> fetch NameStored events (simple)
app.get("/api/events", async (req, res) => {
  try {
    const fromBlock = req.query.fromBlock ? parseInt(req.query.fromBlock) : 0;
    const filter = contract.filters.NameStored();
    const logs = await contract.provider.getLogs({
      ...filter,
      fromBlock,
      toBlock: "latest"
    });
    // decode logs
    const parsed = logs.map(log => contract.interface.parseLog(log));
    const out = parsed.map((p, i) => ({
      event: p.name,
      args: p.args,
      txHash: logs[i].transactionHash,
      blockNumber: logs[i].blockNumber
    }));
    res.json(out);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API server running at http://localhost:${PORT}`));
