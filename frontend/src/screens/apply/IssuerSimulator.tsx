import { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useWallet, useWalletActions } from "@/modules/wallet/hooks";
import { fakeDid, fakeVc, fakeCid, fakeTxHash, fakeBlockNumber, fakeHex } from "@/lib/fakeChain";

const statusVariant: Record<string, "outline" | "secondary" | "default" | "destructive"> = {
  Submitted: "outline",
  PendingVerification: "default",
  Approved: "secondary",
};

const statusLabels: Record<string, string> = {
  Submitted: "Submitted to issuer",
  PendingVerification: "Offline verification pending…",
  Approved: "VC Issued",
};

const IssuerSimulator = () => {
  const { did, applications } = useWallet();
  const { addCredential, updateApplication } = useWalletActions();

  const sortedApplications = useMemo(
    () => [...applications].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    [applications]
  );

  const handleApprove = (applicationId: string) => {
    const application = applications.find((a) => a.id === applicationId);
    if (!application) return;

    const issuerDid = fakeDid();
    const subjectDid = application.subjectDid ?? did ?? fakeDid();
    const vc = fakeVc(issuerDid, subjectDid, application.fields);
    const vcCid = vc.evidence?.cid ?? fakeCid();
    const vcTx = vc.evidence?.chainTx ?? fakeTxHash();
    const vcBlock = vc.evidence?.block ?? fakeBlockNumber();
    const vcObject = {
      cid: vcCid,
      tx: vcTx,
      block: vcBlock,
      vcId: vc.proof?.jws ?? fakeHex(64),
      issuerDID: issuerDid,
      subjectDID: subjectDid,
      issuedAt: vc.issuanceDate ?? new Date().toISOString(),
    };

    addCredential({
      title: application.type,
      issuer: issuerDid,
      type: "Simulated Verifiable Credential",
      status: "active",
      description: `Issued for ${application.type} via issuer simulator.`,
      attributes: Object.entries(application.fields).map(([label, value]) => ({
        label,
        value,
        disclosed: true,
      })),
      rawVc: vc,
      proofHash: vc.proof?.jws?.slice(2, 26) ?? undefined,
    });

    updateApplication(application.id, {
      status: "Approved",
      cid: application.cid ?? vcCid,
      tx: application.tx ?? vcTx,
      block: application.block ?? vcBlock,
      vc: vcObject,
    });

    toast({
      title: "Credential issued",
      description: `VC anchored with tx ${vcTx.slice(0, 10)}…`,
    });
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Issuer simulator</CardTitle>
          <CardDescription>
            Internal tooling for demo purposes. Review submitted applications and mint verifiable credentials without leaving the device.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-card/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Queued applications</CardTitle>
            <CardDescription>Approve or hold submissions. All approvals mint simulated verifiable credentials.</CardDescription>
          </div>
          <Badge variant="outline">{sortedApplications.length} total</Badge>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4">
          {sortedApplications.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No applications have been submitted yet. Visit the Apply screen to create one.
            </div>
          ) : (
            sortedApplications.map((application) => (
              <div key={application.id} className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{application.type}</h3>
                  <Badge variant={statusVariant[application.status]}>
                    {statusLabels[application.status] ?? application.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(application.submittedAt).toLocaleString()} · Block #{application.block}
                </p>
                <div className="grid gap-2 rounded-md border bg-background/70 p-3 text-sm text-muted-foreground">
                  {Object.entries(application.fields).map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="font-mono text-xs text-muted-foreground/90 max-w-[60%] truncate">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground/80 font-mono">
                  <span>CID {application.cid}</span>
                  <span>Tx {application.tx}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleApprove(application.id)} disabled={application.status === "Approved"}>
                    Approve &amp; issue VC
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IssuerSimulator;

