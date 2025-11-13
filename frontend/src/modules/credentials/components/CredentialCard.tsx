import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import type { WalletCredential } from "@/modules/wallet/store";
import { formatBytes } from "@/lib/utils";
import { ArrowUpRightSquare, FileDown, Trash2 } from "lucide-react";

type CredentialCardProps = {
  credential: WalletCredential;
  onRemove: (id: string) => void;
};

const statusVariants: Record<WalletCredential["status"], "secondary" | "destructive" | "outline"> = {
  active: "secondary",
  revoked: "destructive",
  expiring: "outline",
};

const statusCopy: Record<WalletCredential["status"], string> = {
  active: "Ready for disclosure",
  revoked: "Revoked · archive only",
  expiring: "Expiring soon · reissue recommended",
};

export const CredentialCard = ({ credential, onRemove }: CredentialCardProps) => {
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const payload = {
      ...credential,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${credential.title.replace(/\s+/g, "-").toLowerCase()}-credential.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Credential exported",
      description: `${credential.title} saved as JSON.`,
      variant: "success",
    });
  };

  const handleRemove = () => {
    onRemove(credential.id);
    toast({
      title: "Credential removed",
      description: `${credential.title} moved to local trash.`,
      variant: "info",
    });
    setOpen(false);
  };

  return (
    <>
      <Card className="border-muted bg-card/70">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{credential.title}</CardTitle>
              <CardDescription>{credential.issuer}</CardDescription>
            </div>
            <Badge variant={statusVariants[credential.status]} className="capitalize">
              {credential.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(credential.issuanceDate).toLocaleDateString()}</span>
            <span>•</span>
            <span>{credential.type}</span>
            {credential.proofHash && (
              <>
                <span>•</span>
                <span className="font-mono uppercase">
                  {credential.proofHash.slice(0, 6)}…{credential.proofHash.slice(-4)}
                </span>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{credential.description}</p>
          <div className="grid gap-2 text-xs text-muted-foreground">
            {(credential.attributes ?? []).slice(0, 4).map((attribute) => (
              <div
                key={`${credential.id}-${attribute.label}`}
                className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
              >
                <span className="text-foreground">{attribute.label}</span>
                <span className="font-mono text-xs">
                  {attribute.disclosed ? attribute.value : "••••"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{statusCopy[credential.status]}</Badge>
            <Badge variant="outline">
              Footprint ~{formatBytes(JSON.stringify(credential).length)}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
              <ArrowUpRightSquare className="h-4 w-4" />
              View details
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={handleExport}>
              <FileDown className="h-4 w-4" />
              Export JSON
            </Button>
            <Button size="sm" variant="ghost" className="gap-2 text-destructive" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{credential.title}</DialogTitle>
            <DialogDescription>{credential.issuer}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Credential overview
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-semibold capitalize">{credential.status}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Issued</p>
                  <p className="text-sm font-semibold">
                    {new Date(credential.issuanceDate).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-semibold">{credential.type}</p>
                </div>
                {credential.proofHash && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Proof hash</p>
                    <p className="font-mono text-sm uppercase">{credential.proofHash}</p>
                  </div>
                )}
              </div>
            </section>
            <Separator />
            <section className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Attributes
              </h3>
              <div className="grid gap-2 md:grid-cols-2">
                {(credential.attributes ?? []).map((attribute) => (
                  <div key={attribute.label} className="rounded-md border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">{attribute.label}</p>
                    <p className="font-mono text-sm">
                      {attribute.disclosed ? attribute.value : "Hidden"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <FileDown className="h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
              Remove credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

