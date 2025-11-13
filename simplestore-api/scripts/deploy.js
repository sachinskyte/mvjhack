const hre = require("hardhat");

async function main() {
  const SimpleStore = await hre.ethers.getContractFactory("SimpleStore");
  const ss = await SimpleStore.deploy();
  await ss.deployed();
  console.log("SimpleStore deployed to:", ss.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
