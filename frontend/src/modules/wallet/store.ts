import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export type DocumentStatus = "pending" | "encrypted" | "uploaded" | "failed";

export type WalletDocument = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  encryptedPayload?: string;
  cid?: string;
  status: DocumentStatus;
  uploadedAt: string;
  notes?: string;
};

export type CredentialStatus = "active" | "revoked" | "expiring";

export type WalletCredential = {
  id: string;
  title: string;
  issuer: string;
  issuanceDate: string;
  type: string;
  status: CredentialStatus;
  description?: string;
  attributes?: Array<{
    label: string;
    value: string;
    disclosed?: boolean;
  }>;
  proofHash?: string;
  rawVc?: unknown;
};

export type RecoveryShare = {
  id: string;
  label: string;
  value: string;
  createdAt: string;
  distributedTo?: string;
  note?: string;
};

export interface VCObject {
  cid: string;
  tx: string;
  block: number;
  vcId: string;
  issuerDID: string;
  subjectDID: string;
  issuedAt: string;
}

export type ApplicationStatus = "Submitted" | "PendingVerification" | "Approved";

export type WalletApplication = {
  id: string;
  type: string;
  subjectDid: string | null;
  submittedAt: number;
  fields: Record<string, string>;
  cid?: string;
  tx?: string;
  block?: number;
  status: ApplicationStatus;
  photo?: string | null;
  privateKey?: string;
  publicKey?: string;
  did?: string;
  vc?: VCObject | null;
};

export type RequestStatus = "Pending" | "Approved" | "Denied";

export type CredentialRequestResult = {
  cid: string;
  tx: string;
  block: number;
  disclosedFields: Record<string, string>;
  proofHash: string;
};

export type CredentialRequest = {
  id: string;
  verifierDID: string;
  requestedFields: string[];
  purpose: string;
  orgName?: string;
  timestamp: number;
  status: RequestStatus;
  result?: CredentialRequestResult;
  credentialId?: string;
};

type WalletState = {
  did: string | null;
  didCreatedAt?: string;
  documents: WalletDocument[];
  credentials: WalletCredential[];
  shares: RecoveryShare[];
  applications: WalletApplication[];
  requests: CredentialRequest[];
  approvedRequests: CredentialRequest[];
};

type WalletActions = {
  generateDid: (force?: boolean) => string;
  setDid: (did: string | null) => void;
  logout: () => void;
  addDocument: (
    document: Omit<WalletDocument, "id" | "uploadedAt" | "status"> & {
      id?: string;
      status?: DocumentStatus;
    }
  ) => WalletDocument;
  updateDocumentStatus: (id: string, status: DocumentStatus, patch?: Partial<WalletDocument>) => void;
  addCredential: (
    credential: Omit<WalletCredential, "id" | "issuanceDate"> & {
      id?: string;
      issuanceDate?: string;
    }
  ) => WalletCredential;
  removeCredential: (id: string) => void;
  generateShares: (count?: number) => RecoveryShare[];
  clearShares: () => void;
  validateShares: (shareInputs: string[]) => {
    valid: boolean;
    matchedShares: RecoveryShare[];
    missing: number;
  };
  addApplication: (input: Omit<WalletApplication, "id" | "status"> & {
    id?: string;
    status?: ApplicationStatus;
  }) => WalletApplication;
  updateApplication: (id: string, patch: Partial<WalletApplication>) => void;
  addRequest: (input: Omit<CredentialRequest, "status" | "timestamp"> & {
    id?: string;
    status?: RequestStatus;
    timestamp?: number;
  }) => CredentialRequest;
  approveRequest: (
    id: string,
    payload: {
      credentialId: string;
      disclosedFields: Record<string, string>;
      result: CredentialRequestResult;
    }
  ) => void;
  denyRequest: (id: string) => void;
};

type WalletStore = {
  wallet: WalletState;
  actions: WalletActions;
};

const initialCredentials: WalletCredential[] = [
  {
    id: uuidv4(),
    title: "Government ID",
    issuer: "Pandora Civic Authority",
    issuanceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
    type: "W3C Verifiable Credential",
    status: "active",
    description: "Primary decentralized identifier attested by the Pandora's Vault root registry.",
    attributes: [
      { label: "Full Name", value: "Avery Quinn", disclosed: true },
      { label: "Citizen ID", value: "PQ-7281-4421", disclosed: false },
      { label: "Expires", value: "2030-04-12", disclosed: true },
    ],
    proofHash: uuidv4().replace(/-/g, "").slice(0, 24),
  },
  {
    id: uuidv4(),
    title: "Employment Verification",
    issuer: "Nebula Labs Collective",
    issuanceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    type: "AnonCreds 1.0 Credential",
    status: "expiring",
    description: "Role assignment and clearance levels issued by Nebula Labs HR node.",
    attributes: [
      { label: "Role", value: "Identity Systems Engineer", disclosed: true },
      { label: "Clearance", value: "Vault-Core", disclosed: false },
      { label: "Location", value: "Orbital Ring 3", disclosed: true },
    ],
    proofHash: uuidv4().replace(/-/g, "").slice(0, 24),
  },
  {
    id: uuidv4(),
    title: "Guild Membership",
    issuer: "Guild of Guardians",
    issuanceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
    type: "DIDComm Trust Badge",
    status: "active",
    description: "Guardian quorum membership credential for recovery network participation.",
    attributes: [
      { label: "Tier", value: "Sentinel", disclosed: true },
      { label: "Join Date", value: "2023-11-04", disclosed: true },
      { label: "Revocation Code", value: "9F2C-ALPHA", disclosed: false },
    ],
    proofHash: uuidv4().replace(/-/g, "").slice(0, 24),
  },
];

const initialState: WalletState = {
  did: null,
  didCreatedAt: undefined,
  documents: [],
  credentials: initialCredentials,
  shares: [],
  applications: [],
  requests: [],
  approvedRequests: [],
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      wallet: initialState,
      actions: {
        generateDid: (force = false) => {
          const { wallet } = get();
          if (wallet.did && !force) {
            return wallet.did;
          }

          const newDid = `did:pvault:${uuidv4().replace(/-/g, "").slice(0, 32)}`;
          const timestamp = new Date().toISOString();

          set({
            wallet: {
              ...wallet,
              did: newDid,
              didCreatedAt: timestamp,
            },
          });

          return newDid;
        },
        setDid: (did) => {
          const { wallet } = get();
          set({
            wallet: {
              ...wallet,
              did,
              didCreatedAt: did ? new Date().toISOString() : undefined,
            },
          });
        },
        logout: () => {
          const { wallet } = get();
          set({
            wallet: {
              ...wallet,
              did: null,
              didCreatedAt: undefined,
              applications: [],
              requests: [],
              approvedRequests: [],
            },
          });
        },
        addDocument: (documentInput) => {
          const { wallet } = get();
          const record: WalletDocument = {
            id: documentInput.id ?? uuidv4(),
            name: documentInput.name,
            size: documentInput.size,
            mimeType: documentInput.mimeType,
            encryptedPayload: documentInput.encryptedPayload,
            cid: documentInput.cid,
            status: documentInput.status ?? "pending",
            uploadedAt: new Date().toISOString(),
            notes: documentInput.notes,
          };

          set({
            wallet: {
              ...wallet,
              documents: [record, ...wallet.documents],
            },
          });

          return record;
        },
        updateDocumentStatus: (id, status, patch) => {
          const { wallet } = get();
          set({
            wallet: {
              ...wallet,
              documents: wallet.documents.map((doc) =>
                doc.id === id
                  ? {
                      ...doc,
                      status,
                      ...patch,
                    }
                  : doc
              ),
            },
          });
        },
        addCredential: (credentialInput) => {
          const { wallet } = get();
          const record: WalletCredential = {
            id: credentialInput.id ?? uuidv4(),
            title: credentialInput.title,
            issuer: credentialInput.issuer,
            issuanceDate: credentialInput.issuanceDate ?? new Date().toISOString(),
            type: credentialInput.type,
            status: credentialInput.status,
            description: credentialInput.description,
            attributes: credentialInput.attributes,
            proofHash: credentialInput.proofHash ?? uuidv4().replace(/-/g, "").slice(0, 24),
            rawVc: credentialInput.rawVc,
          };

          set({
            wallet: {
              ...wallet,
              credentials: [record, ...wallet.credentials],
            },
          });

          return record;
        },
        removeCredential: (id) => {
          const { wallet } = get();
          set({
            wallet: {
              ...wallet,
              credentials: wallet.credentials.filter((credential) => credential.id !== id),
            },
          });
        },
        generateShares: (count = 5) => {
          const now = new Date().toISOString();
          const shares = Array.from({ length: count }, (_, index) => ({
            id: uuidv4(),
            label: `Share ${index + 1}`,
            value: uuidv4().replace(/-/g, "").slice(0, 24).toUpperCase(),
            createdAt: now,
          }));

          set((state) => ({
            wallet: {
              ...state.wallet,
              shares,
            },
          }));

          return shares;
        },
        clearShares: () => {
          set((state) => ({
            wallet: {
              ...state.wallet,
              shares: [],
            },
          }));
        },
        validateShares: (shareInputs) => {
          const { wallet } = get();
          const normalized = shareInputs
            .map((input) => input.trim().toUpperCase())
            .filter((value) => value.length > 0);

          const matchedShares = wallet.shares.filter((share) =>
            normalized.includes(share.value.toUpperCase())
          );

          const threshold = 3;
          return {
            valid: matchedShares.length >= threshold,
            matchedShares,
            missing: Math.max(0, threshold - matchedShares.length),
          };
        },
        addApplication: (input) => {
          const { wallet } = get();
          const record: WalletApplication = {
            id: input.id ?? uuidv4(),
            type: input.type,
            subjectDid: input.subjectDid,
            fields: input.fields,
            submittedAt: input.submittedAt ?? Date.now(),
            cid: input.cid,
            tx: input.tx,
            block: input.block,
            status: input.status ?? "Submitted",
            photo: input.photo ?? null,
            privateKey: input.privateKey,
            publicKey: input.publicKey,
            did: input.did,
            vc: input.vc ?? null,
          };

          set({
            wallet: {
              ...wallet,
              applications: [record, ...wallet.applications],
            },
          });

          return record;
        },
        updateApplication: (id, patch) => {
          const { wallet } = get();
          set({
            wallet: {
              ...wallet,
              applications: wallet.applications.map((application) =>
                application.id === id
                  ? {
                      ...application,
                      ...patch,
                      submittedAt: patch.submittedAt ?? application.submittedAt,
                      cid: patch.cid ?? application.cid,
                      tx: patch.tx ?? application.tx,
                      block: patch.block ?? application.block,
                      vc: patch.vc ?? application.vc,
                    }
                  : application
              ),
            },
          });
        },
        addRequest: (input) => {
          const { wallet } = get();
          const record: CredentialRequest = {
            id: input.id ?? uuidv4(),
            verifierDID: input.verifierDID,
            requestedFields: input.requestedFields,
            purpose: input.purpose,
            orgName: input.orgName,
            timestamp: input.timestamp ?? Date.now(),
            status: input.status ?? "Pending",
            result: input.result,
            credentialId: input.credentialId,
          };

          set({
            wallet: {
              ...wallet,
              requests: [record, ...wallet.requests],
            },
          });

          return record;
        },
        approveRequest: (id, payload) => {
          const { wallet } = get();
          const updatedRequests = wallet.requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status: "Approved" as RequestStatus,
                  result: payload.result,
                  credentialId: payload.credentialId,
                }
              : request
          );

          const approvedRequest = updatedRequests.find((request) => request.id === id);

          set({
            wallet: {
              ...wallet,
              requests: updatedRequests,
              approvedRequests: approvedRequest
                ? [approvedRequest, ...wallet.approvedRequests.filter((req) => req.id !== id)]
                : wallet.approvedRequests,
            },
          });
        },
        denyRequest: (id) => {
          const { wallet } = get();
          set({
            wallet: {
              ...wallet,
              requests: wallet.requests.map((request) =>
                request.id === id
                  ? {
                      ...request,
                      status: "Denied" as RequestStatus,
                    }
                  : request
              ),
            },
          });
        },
      },
    }),
    {
      name: "pandoras-vault-wallet",
      version: 1,
      partialize: (state) => ({
        wallet: state.wallet,
      }),
    }
  )
);

export const selectWallet = (state: WalletStore) => state.wallet;
export const selectWalletActions = (state: WalletStore) => state.actions;
export const selectHasDid = (state: WalletStore) => Boolean(state.wallet.did);

