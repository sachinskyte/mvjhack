import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, CloudUpload, QrCode, Shield, ShieldCheck } from "lucide-react";
import { DIDCard } from "@/modules/did/components/DIDCard";
import { useWallet } from "@/modules/wallet/hooks";

const formatRelative = (iso: string) => {
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.round((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    "day"
  );
};

export const HomeScreen = () => {
  const { documents, credentials, shares } = useWallet();

  const recentDocuments = useMemo(() => documents.slice(0, 3), [documents]);
  const activeCredentials = useMemo(
    () => credentials.filter((credential) => credential.status === "active"),
    [credentials]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-muted/40 p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Pandora&apos;s Vault · prototype channel
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Sovereign identity orchestration for sensitive vault operations.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Pandora&apos;s Vault keeps your decentralized identifiers, credential proofs, and
              recovery attestations fused into a single zero-trust workspace. Everything here runs
              locally until you choose to broadcast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                Launch credential flow
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2" asChild>
                <a href="#documents">Manage documents</a>
              </Button>
            </div>
          </div>
          <Card className="w-full max-w-sm border-primary/30 bg-primary/5 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Vault posture</CardTitle>
              <CardDescription>
                Real-time gauge of your protection layers before live exchanges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active credentials</span>
                <Badge>{activeCredentials.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Encrypted documents</span>
                <Badge variant="outline">{documents.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recovery quorum shares</span>
                <Badge variant="outline">{shares.length}/5</Badge>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Hardening tip: rotate your DID every quarter and refresh guardian shares whenever
                you admit or remove a trusted contact.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <DIDCard />
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Vault briefings
            </CardTitle>
            <CardDescription>Key modules that deserve periodic attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Credential watchlist</p>
                <p className="text-xs text-muted-foreground">
                  {credentials.length} credentials loaded · {activeCredentials.length} ready for
                  disclosure.
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3 w-3" />
                Synced
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Document encryption</p>
                <p className="text-xs text-muted-foreground">
                  {documents.length ? "All uploads sealed and hashed." : "No assets prepared yet."}
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <CloudUpload className="h-3 w-3" />
                {documents.length ? "Ready" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Recovery quorum</p>
                <p className="text-xs text-muted-foreground">
                  {shares.length
                    ? "Shares distributed. Simulate to ensure quorum health."
                    : "Generate shares before onboarding guardians."}
                </p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                {shares.length ? `${shares.length} issued` : "Uninitialized"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="documents" className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="bg-card/60">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Recent encrypted payloads</CardTitle>
              <CardDescription>
                Each upload is bundled with a vault CID for replication preview.
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <a href="/apply">
                <CloudUpload className="h-4 w-4" />
                Start new application
              </a>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {recentDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                <CloudUpload className="h-8 w-8 text-muted-foreground/70" />
                <p>No documents sealed yet. Drop your first credential bundle to rehearse.</p>
              </div>
            ) : (
              recentDocuments.map((document) => (
                <div key={document.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{document.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {document.mimeType} · {(document.size / 1024).toFixed(1)} KB ·{" "}
                      {formatRelative(document.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={document.status === "uploaded" ? "outline" : "secondary"}>
                      {document.status}
                    </Badge>
                    {document.cid && (
                      <Badge variant="secondary" className="font-mono text-[10px] uppercase">
                        {document.cid.slice(0, 6)}…{document.cid.slice(-4)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Guardian activity</CardTitle>
            <CardDescription>
              Keep an eye on recovery partners before initiating vault reset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shares.slice(0, 3).map((share, index) => (
              <div key={share.id} className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback>{index + 1}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{share.label}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {share.value.slice(0, 6)}…{share.value.slice(-4)}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Issued {formatRelative(share.createdAt)}
                  </p>
                </div>
                <Badge variant="outline">Ready</Badge>
              </div>
            ))}
            {shares.length === 0 && (
              <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
                Generate shares to build a guardian quorum. Pandora&apos;s Vault recommends at least
                five guardians with a threshold of three for activation.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Credential spotlight</CardTitle>
            <CardDescription>
              Highlighted proofs you&apos;ll likely need during the next handshake.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {credentials.slice(0, 2).map((credential) => (
              <div key={credential.id} className="rounded-lg border bg-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{credential.title}</p>
                  <Badge variant={credential.status === "active" ? "secondary" : "outline"}>
                    {credential.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {credential.issuer} · {new Date(credential.issuanceDate).toLocaleDateString()}
                </p>
                <Separator className="my-3" />
                <div className="grid gap-2 text-xs text-muted-foreground">
                  {(credential.attributes ?? []).slice(0, 3).map((attr) => (
                    <div key={attr.label} className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{attr.label}</span>
                      <span className="font-mono">
                        {attr.disclosed ? attr.value : "••••"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-card/60">
          <CardHeader>
            <CardTitle className="text-lg">Next steps</CardTitle>
            <CardDescription>
              Suggested actions to harden Pandora&apos;s Vault before mission-critical exchanges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
              <QrCode className="mt-1 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Assemble a shareable payload</p>
                <p className="text-xs text-muted-foreground">
                  Pre-build a connection QR with selective disclosure before heading to the Share
                  module.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" asChild>
                <a href="/share">Open</a>
              </Button>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
              <Shield className="mt-1 h-4 w-4 text-primary" />
              <div>
                <p className="font-medium text-foreground">Run a recovery drill</p>
                <p className="text-xs text-muted-foreground">
                  Simulate guardian input with three shares to verify unlock readiness.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto" asChild>
                <a href="/recovery">Start</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default HomeScreen;

