async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const AadhaarVault = await ethers.getContractFactory("AadhaarVault");
  const vault = await AadhaarVault.deploy();
  await vault.deployed();
  console.log("AadhaarVault deployed to:", vault.address);
}
main().catch((e)=>{ console.error(e); process.exitCode=1; });
