import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CredentialList } from "@/modules/credentials/components/CredentialList";
import { useWallet } from "@/modules/wallet/hooks";
import { formatBytes } from "@/lib/utils";
import {
  Activity,
  Archive,
  CheckCircle,
  ClipboardList,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";

export const CredentialsScreen = () => {
  const { credentials } = useWallet();

  const stats = useMemo(() => {
    const total = credentials.length;
    const active = credentials.filter((credential) => credential.status === "active").length;
    const expiring = credentials.filter((credential) => credential.status === "expiring").length;
    const revoked = credentials.filter((credential) => credential.status === "revoked").length;
    const payloadSize = credentials.reduce(
      (acc, credential) => acc + JSON.stringify(credential).length,
      0
    );
    return { total, active, expiring, revoked, payloadSize };
  }, [credentials]);

  return (
    <div className="space-y-8">
      <Card className="bg-card/70">
        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Pandora&apos;s Vault credentials mesh
            </Badge>
            <CardTitle className="text-2xl">Verifiable credential vault</CardTitle>
            <CardDescription>
              This index tracks every credential staged locally. Use it to rehearse disclosure sets
              before broadcasting proofs to verifiers.
            </CardDescription>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
                <ClipboardList className="h-3.5 w-3.5 text-primary" />
                Total
              </p>
              <p className="text-lg font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
                Active
              </p>
              <p className="text-lg font-semibold text-foreground">{stats.active}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                Expiring
              </p>
              <p className="text-lg font-semibold text-foreground">{stats.expiring}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide">
                <Archive className="h-3.5 w-3.5 text-primary" />
                Revoked
              </p>
              <p className="text-lg font-semibold text-foreground">{stats.revoked}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Vault footprint
            </p>
            <p className="mt-1 text-sm text-foreground">
              {formatBytes(stats.payloadSize)} encoded across {stats.total} records.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Fingerprint className="h-3.5 w-3.5 text-primary" />
              Selective disclosure
            </p>
            <p className="mt-1">
              Hidden attributes stay redacted until you explicitly reveal them in the Share module.
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Archive className="h-3.5 w-3.5 text-primary" />
              Rotation hygiene
            </p>
            <p className="mt-1">
              Archive revoked credentials once proofs are invalidated to reduce negotiation friction.
            </p>
          </div>
        </CardContent>
      </Card>

      <CredentialList />

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">Pre-disclosure checklist</CardTitle>
          <CardDescription>
            Before generating a QR payload, review these notes to keep Pandora&apos;s Vault secure.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Confirm credential freshness — reissue those older than six months.</p>
          <p>2. Trim attributes to the bare minimum required by the verifier schema.</p>
          <p>
            3. Keep revoked credentials off your share payloads to prevent correlation with older
            sessions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CredentialsScreen;

