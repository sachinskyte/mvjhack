// src/lib/fakeChain.ts
// Fake blockchain / DID / IPFS utilities for demo purposes

export function fakeHex(length = 40) {
  const chars = "abcdef0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function fakeCid(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz234567";
  let cid = "bafy";
  for (let i = 0; i < 54; i++) cid += chars[Math.floor(Math.random() * chars.length)];
  return cid;
}

export function fakeDid() {
  return `did:ethr:matic:${fakeHex(40)}`;
}

export function fakeTxHash(): string {
  return `0x${fakeHex(64)}`;
}

export function fakeBlockNumber(): number {
  return Math.floor(1_000_000 + Math.random() * 9_000_000);
}

export function fakeSignature() {
  return `0x${fakeHex(130)}`;
}

export function fakeVc(issuerDid: string, subjectDid: string, fields: Record<string, unknown>) {
  return {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential"],
    issuer: issuerDid,
    issuanceDate: new Date().toISOString(),
    credentialSubject: { id: subjectDid, ...fields },
    evidence: { cid: fakeCid(), chainTx: fakeTxHash(), block: fakeBlockNumber() },
    proof: {
      type: "EcdsaSecp256k1Signature2019",
      created: new Date().toISOString(),
      verificationMethod: `${issuerDid}#keys-1`,
      jws: fakeSignature(),
    },
  };
}

export function fakeVerifyVc(vc: any) {
  return {
    verified: true,
    issuer: vc.issuer,
    block: vc.evidence?.block,
    cid: vc.evidence?.cid,
    message: "Signature valid (simulated)",
    tx: vc.evidence?.chainTx,
  };
}

export function fakeIpfsUpload(fileName: string, size: number) {
  return { cid: fakeCid(), size, pinned: true, tx: fakeTxHash(), block: fakeBlockNumber(), fileName };
}

export function fakeGrantAccess(ownerDid: string, targetDid: string) {
  return { ok: true, owner: ownerDid, grantee: targetDid, tx: fakeTxHash(), block: fakeBlockNumber(), status: "approved" };
}

