import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useEnsureDid, useWallet, useWalletActions } from "@/modules/wallet/hooks";

const formatDate = (iso?: string) => {
  if (!iso) return "Unknown";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
};

export const DIDCard = () => {
  useEnsureDid();
  const { did, didCreatedAt } = useWallet();
  const { generateDid } = useWalletActions();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const obfuscatedDid = useMemo(() => {
    if (!did) return "Generating DID…";
    const head = did.slice(0, 14);
    const tail = did.slice(-6);
    return `${head}…${tail}`;
  }, [did]);

  const handleCopy = useCallback(async () => {
    if (!did) return;
    await navigator.clipboard.writeText(did);
    toast({
      title: "DID copied",
      description: "Your Pandora's Vault DID is ready to share.",
      variant: "info",
    });
  }, [did]);

  const handleRegenerate = useCallback(async () => {
    setIsRegenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    const newDid = generateDid(true);
    setIsRegenerating(false);
    toast({
      title: "Fresh identifier issued",
      description: `New DID: ${newDid.slice(0, 20)}…`,
      variant: "success",
    });
  }, [generateDid]);

  return (
    <Card className="relative overflow-hidden bg-card/70">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 bg-gradient-to-b from-primary/15 via-primary/5 to-primary/25 blur-2xl lg:block" />
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Pandora&apos;s Vault DID</CardTitle>
        </div>
        <CardDescription>
          Root decentralized identifier anchored to your vault presence. Rotate periodically to
          minimize correlation leaks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-background/60 p-4">
          <p className="font-mono text-xs sm:text-sm">{did}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            {obfuscatedDid}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Provisioned {didCreatedAt ? formatDate(didCreatedAt) : "moments ago"}
          </span>
        </div>
        <Separator />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="gap-2" onClick={handleCopy} disabled={!did}>
            <Copy className="h-4 w-4" />
            Copy DID
          </Button>
          <Button
            className="gap-2"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

