import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useWallet, useWalletActions } from "@/modules/wallet/hooks";
import { fakeCid, fakeTxHash, fakeBlockNumber, fakeHex } from "@/lib/fakeChain";
import { delay } from "@/lib/utils";
import type { CredentialRequest, CredentialRequestResult } from "@/modules/wallet/store";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Denied: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20",
};

const toastSequence = [
  "Decrypting credential…",
  "Preparing selective disclosure…",
  "Encrypting response…",
  "Uploading encrypted fragment (mock)…",
  "Sending approved disclosure to verifier DID…",
];

const matchesRequestedFields = (requested: string[], credentialAttributes?: { label: string; value: string }[]) => {
  if (!credentialAttributes) return false;
  const attributeMap = new Map(
    credentialAttributes.map((attr) => [attr.label.trim().toLowerCase(), attr.value])
  );
  return requested.every((field) => attributeMap.has(field.trim().toLowerCase()));
};

const buildDisclosedFields = (
  requested: string[],
  credentialAttributes: { label: string; value: string }[],
  enabledFields: Record<string, boolean>
) => {
  const attributeMap = new Map(
    credentialAttributes.map((attr) => [attr.label.trim().toLowerCase(), attr.value])
  );
  const disclosed: Record<string, string> = {};
  requested.forEach((field) => {
    if (!enabledFields[field]) {
      return;
    }
    const value = attributeMap.get(field.toLowerCase());
    if (value !== undefined) {
      disclosed[field] = value;
    }
  });
  return disclosed;
};

const randomString = (length: number) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

export const RequestsScreen = () => {
  const { requests, credentials } = useWallet();
  const { addRequest, approveRequest, denyRequest } = useWalletActions();
  const [activeRequest, setActiveRequest] = useState<CredentialRequest | null>(null);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [disclosureMap, setDisclosureMap] = useState<Record<string, boolean>>({});

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "Pending"),
    [requests]
  );

  const approvedRequests = useMemo(
    () => requests.filter((request) => request.status !== "Pending"),
    [requests]
  );

  const handleSimulateRequest = () => {
    const sample = addRequest({
      verifierDID: `did:corp:${randomString(6)}`,
      requestedFields: ["Full Name", "Date of birth", "Address"],
      purpose: "Employment verification",
      orgName: "Nebula HR Node",
    });

    toast({
      title: "Incoming credential request",
      description: `Verifier ${sample.verifierDID} is requesting selective disclosure.`,
    });
  };

  const handleOpenReview = (request: CredentialRequest) => {
    setActiveRequest(request);
    setSelectedCredentialId(null);
    const initialMap: Record<string, boolean> = {};
    request.requestedFields.forEach((field) => {
      initialMap[field] = true;
    });
    setDisclosureMap(initialMap);
  };

  const handleApprove = async () => {
    if (!activeRequest || !selectedCredentialId) {
      return;
    }

    const credential = credentials.find((cred) => cred.id === selectedCredentialId);
    if (!credential) {
      return;
    }

    const enabledFields = Object.entries(disclosureMap)
      .filter(([, enabled]) => enabled)
      .map(([field]) => field);

    if (enabledFields.length === 0) {
      toast({
        title: "Select fields to disclose",
        description: "Choose at least one field before approving the request.",
        variant: "destructive",
      });
      return;
    }

    const disclosedFields = buildDisclosedFields(
      activeRequest.requestedFields,
      credential.attributes ?? [],
      disclosureMap
    );

    if (Object.keys(disclosedFields).length === 0) {
      toast({
        title: "Attributes missing",
        description: "The selected credential does not contain values for the chosen fields.",
        variant: "destructive",
      });
      return;
    }

    for (const message of toastSequence) {
      toast({ title: message });
      await delay(500);
    }

    const result: CredentialRequestResult = {
      cid: `cid-${randomString(32)}`,
      tx: fakeTxHash(),
      block: fakeBlockNumber(),
      disclosedFields,
      proofHash: `hash-${fakeHex(32)}`,
    };

    approveRequest(activeRequest.id, {
      credentialId: credential.id,
      disclosedFields,
      result,
    });

    toast({
      title: "Disclosure sent",
      description: `Selective disclosure anchored with ${result.tx.slice(0, 10)}…`,
    });

    setActiveRequest(null);
    setSelectedCredentialId(null);
  };

  const handleDeny = (id: string) => {
    denyRequest(id);
    toast({
      title: "Request denied",
      description: "Verifier will be notified that disclosure has been rejected.",
      variant: "destructive",
    });
  };

  const matchingCredentials = useMemo(() => {
    if (!activeRequest) {
      return [];
    }
    return credentials.filter((credential) =>
      matchesRequestedFields(activeRequest.requestedFields, credential.attributes)
    );
  }, [activeRequest, credentials]);

  const disableApprove =
    !activeRequest ||
    !selectedCredentialId ||
    Object.keys(disclosureMap).every((field) => !disclosureMap[field]);

  return (
    <div className="space-y-8">
      <Card className="bg-card/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">Incoming credential requests</CardTitle>
            <CardDescription>
              Manage selective disclosure for verifiers requesting access to your credentials. Everything executes locally.
            </CardDescription>
          </div>
          <Button onClick={handleSimulateRequest} variant="outline">
            Simulate new request
          </Button>
        </CardHeader>
      </Card>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">Pending requests</CardTitle>
          <CardDescription>Approve or deny selective disclosure for incoming verifiers.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              <p className="text-base font-medium text-foreground">No pending requests</p>
              <p className="text-xs text-muted-foreground">
                Verifiers will appear here when they request access to your credentials.
              </p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="border-border/70 bg-background/70">
                <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {request.orgName ?? "Unknown verifier"}
                      </CardTitle>
                      <Badge className={cn("border", statusStyles[request.status])}>
                        {request.status}
                      </Badge>
                    </div>
                    <CardDescription className="font-mono text-xs">
                      {request.verifierDID}
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.timestamp).toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requested fields
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {request.requestedFields.map((field) => (
                        <Badge key={field} variant="outline">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Purpose: <span className="text-foreground">{request.purpose}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleOpenReview(request)}>
                    Review
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenReview(request)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeny(request.id)}>
                    Deny
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl">History</CardTitle>
          <CardDescription>Review previously approved or denied disclosure requests.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3">
          {approvedRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed requests yet.</p>
          ) : (
            approvedRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{request.orgName ?? "Verifier"}</span>
                  <Badge className={cn("border", statusStyles[request.status])}>{request.status}</Badge>
                </div>
                <p className="font-mono text-xs">{request.verifierDID}</p>
                <div className="mt-2 grid gap-1 text-xs">
                  {request.result?.cid && (
                    <span>
                      CID: <span className="font-mono">{request.result.cid.substring(0, 8)}…</span>
                    </span>
                  )}
                  {request.result?.tx && (
                    <span>
                      Tx: <span className="font-mono">{request.result.tx.substring(0, 10)}…</span>
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs">
                  Timestamp: {new Date(request.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(activeRequest)} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col touch-pan-y">
          {activeRequest && (
            <div className="flex flex-1 flex-col">
              <div className="max-h-[80vh] overflow-y-auto p-4 space-y-4 touch-pan-y">
                <DialogHeader>
                  <DialogTitle>Review credential request</DialogTitle>
                  <DialogDescription>
                    Decide how much information you want to disclose to the verifier.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border bg-muted/20 p-4 space-y-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Verifier identity
                  </p>
                  <div className="grid gap-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Verifier DID</span>
                      <span className="font-mono text-foreground">{activeRequest.verifierDID}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Organization</span>
                      <span className="font-semibold text-foreground">
                        {activeRequest.orgName ?? "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Purpose</span>
                      <span className="text-foreground">{activeRequest.purpose}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Requested fields
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeRequest.requestedFields.map((field) => (
                      <Badge key={field} variant="outline">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Your matching credentials</p>
                    <span className="text-xs text-muted-foreground">
                      Only credentials containing all requested attributes are shown.
                    </span>
                  </div>
                  {matchingCredentials.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                      You do not hold a credential with these attributes.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {matchingCredentials.map((credential) => {
                        const isActive = credential.id === selectedCredentialId;
                        return (
                          <Card
                            key={credential.id}
                            className={cn(
                              "cursor-pointer border-border/60 bg-background/70 transition hover:border-primary/40",
                              isActive && "border-primary shadow-sm"
                            )}
                            onClick={() => setSelectedCredentialId(credential.id)}
                          >
                            <CardHeader className="space-y-1">
                              <CardTitle className="text-base">{credential.title}</CardTitle>
                              <CardDescription>{credential.issuer}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground space-y-1">
                              <p>Issued {new Date(credential.issuanceDate).toLocaleDateString()}</p>
                              <p className="font-mono text-[11px] uppercase">
                                {credential.proofHash}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedCredentialId && (
                  <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                    <p className="text-sm font-semibold text-foreground">Select which fields to disclose</p>
                    <div className="grid gap-2">
                      {activeRequest.requestedFields.map((field) => (
                        <label
                          key={field}
                          className="flex items-center justify-between gap-3 rounded-md border bg-background/80 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-foreground">{field}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-primary"
                            checked={disclosureMap[field]}
                            onChange={(event) =>
                              setDisclosureMap((prev) => ({
                                ...prev,
                                [field]: event.target.checked,
                              }))
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-background p-3 border-t flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveRequest(null);
                    setSelectedCredentialId(null);
                  }}
                >
                  Close
                </Button>
                <Button className="flex-1" disabled={disableApprove} onClick={handleApprove}>
                  Approve disclosure
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestsScreen;

