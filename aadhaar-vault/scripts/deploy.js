// deploy.js
require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const adminAddress = process.env.DEPLOY_ADMIN || (await hre.ethers.getSigners())[0].address;
  console.log("Using admin:", adminAddress);

  const Aadhaar = await hre.ethers.getContractFactory("AadhaarApplications");
  const aad = await Aadhaar.deploy(adminAddress);
  await aad.deployed();
  console.log("AadhaarApplications deployed to:", aad.address);
}
main().catch((e) => { console.error(e); process.exit(1); });