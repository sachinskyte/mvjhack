import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import QRScanner from "@/components/qr/QRScanner";
import { useWallet } from "@/modules/wallet/hooks";
import {
  Activity,
  Check,
  Copy,
  Link2,
  Lock,
  QrCode,
  Share2,
  Shield,
  Timer,
} from "lucide-react";

type SharePayload = {
  id: string;
  issuedAt: string;
  expiresAt: string;
  holderDid: string | null;
  audience?: string;
  channel: "didcomm_v2" | "secure_link";
  credential: {
    id: string;
    title: string;
    issuer: string;
    type: string;
    status: string;
    disclosedAttributes: Array<{
      label: string;
      value: string;
      revealed: boolean;
    }>;
  };
};

const expiryOptions = [
  { label: "5 minutes", value: "5" },
  { label: "15 minutes", value: "15" },
  { label: "1 hour", value: "60" },
];

const channelOptions: Array<{ label: string; value: SharePayload["channel"]; description: string }> = [
  { label: "DIDComm v2", value: "didcomm_v2", description: "Mutual authentication over DIDComm." },
  { label: "Secure deep link", value: "secure_link", description: "One-time link for verified devices." },
];

const buildPayload = (
  credential: SharePayload["credential"],
  holderDid: string | null,
  audience: string,
  channel: SharePayload["channel"],
  expiresInMinutes: number
): SharePayload => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  return {
    id: `pv-share-${uuidv4()}`,
    issuedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    holderDid,
    audience: audience || undefined,
    channel,
    credential,
  };
};

export const ShareScreen = () => {
  const { credentials, did } = useWallet();
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | undefined>(
    credentials[0]?.id
  );
  const [audienceDid, setAudienceDid] = useState("");
  const [channel, setChannel] = useState<SharePayload["channel"]>("didcomm_v2");
  const [expiry, setExpiry] = useState(expiryOptions[1].value);
  const [disclosureMap, setDisclosureMap] = useState<Record<string, boolean>>({});
  const [showRawPayload, setShowRawPayload] = useState(false);
  const [scannedPayload, setScannedPayload] = useState<SharePayload | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedCredential = useMemo(
    () => credentials.find((credential) => credential.id === selectedCredentialId),
    [credentials, selectedCredentialId]
  );

  useEffect(() => {
    if (!selectedCredential) return;
    const initialMap: Record<string, boolean> = {};
    (selectedCredential.attributes ?? []).forEach((attr) => {
      initialMap[attr.label] = attr.disclosed ?? false;
    });
    setDisclosureMap(initialMap);
  }, [selectedCredential]);

  useEffect(() => {
    if (credentials.length > 0 && !selectedCredentialId) {
      setSelectedCredentialId(credentials[0].id);
    }
  }, [credentials, selectedCredentialId]);

  const sharePayload = useMemo(() => {
    if (!selectedCredential) return null;
    const disclosedAttributes = (selectedCredential.attributes ?? []).map((attribute) => ({
      label: attribute.label,
      value: attribute.value,
      revealed: disclosureMap[attribute.label] ?? false,
    }));

    return buildPayload(
      {
        id: selectedCredential.id,
        title: selectedCredential.title,
        issuer: selectedCredential.issuer,
        type: selectedCredential.type,
        status: selectedCredential.status,
        disclosedAttributes,
      },
      did,
      audienceDid,
      channel,
      Number(expiry)
    );
  }, [selectedCredential, disclosureMap, did, audienceDid, channel, expiry]);

  const handleCopyPayload = async () => {
    if (!sharePayload) return;
    await navigator.clipboard.writeText(JSON.stringify(sharePayload, null, 2));
    toast({
      title: "Payload copied",
      description: "Share JSON copied to your clipboard.",
      variant: "info",
    });
  };

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;
    const url = qrCanvasRef.current.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pandoras-vault-share.png";
    anchor.click();
  };

  const handleCopyLink = () => {
    if (!sharePayload) return;
    const mockLink = `https://pandoras-vault.link/invite/${sharePayload.id}`;
    navigator.clipboard.writeText(mockLink);
    toast({
      title: "Deep link copied",
      description: mockLink,
      variant: "info",
    });
  };

  const handleScannerResult = useCallback((result: string) => {
    try {
      const parsed = JSON.parse(result) as SharePayload;
      setScannedPayload(parsed);
      setScanError(null);
      toast({
        title: "Payload scanned",
        description: `Credential ${parsed.credential.title} validated.`,
        variant: "success",
      });
    } catch (error) {
      setScanError("Invalid QR payload. Ensure it contains serialized JSON from Pandora's Vault.");
    }
  }, []);

  const handleScan = useCallback(
    (data: string) => {
      handleScannerResult(data);
    },
    [handleScannerResult]
  );

  const handleScanError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      console.error("QR scan error:", error.message);
    }
  }, []);

  return (
    <div className="space-y-8">
      <Card className="bg-card/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Pandora&apos;s Vault share kit
            </Badge>
            <CardTitle className="text-2xl">Assemble a disclosure payload</CardTitle>
            <CardDescription>
              Pick a credential, choose which attributes to reveal, and stage a QR or secure deep link
              ready for verifiers.
            </CardDescription>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Session notes
            </p>
            <p>
              Share payloads stay local—Pandora&apos;s Vault only simulates DIDComm negotiations until
              backend rails are enabled.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <div className="flex flex-col items-center gap-5 rounded-2xl border bg-card/80 p-6">
            <div className="flex w-full flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Credential to share
              </label>
              <Select
                value={selectedCredentialId}
                onValueChange={(value) => setSelectedCredentialId(value)}
                disabled={credentials.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a credential" />
                </SelectTrigger>
                <SelectContent>
                  {credentials.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      {credential.title} · {credential.issuer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex h-52 w-52 items-center justify-center rounded-lg border border-dashed border-muted-foreground/60 bg-gradient-to-br from-primary/10 via-background to-primary/30">
              {sharePayload ? (
                <QRCodeCanvas
                  value={JSON.stringify(sharePayload)}
                  size={200}
                  bgColor="rgba(255,255,255,0.96)"
                  fgColor="#111111"
                  includeMargin
                  ref={(node) => {
                    if (node) {
                      qrCanvasRef.current = node;
                    }
                  }}
                />
              ) : (
                <QrCode className="h-20 w-20 text-muted-foreground" />
              )}
            </div>
            <div className="w-full space-y-2 text-center">
              <p className="text-sm font-medium text-foreground">Scan to verify in the sandbox</p>
              <p className="text-xs text-muted-foreground">
                {sharePayload
                  ? `Expires ${new Date(sharePayload.expiresAt).toLocaleString()}`
                  : "Select a credential to generate a payload."}
              </p>
            </div>
            <div className="grid w-full gap-2">
              <Button variant="outline" className="gap-2" disabled={!sharePayload} onClick={handleCopyLink}>
                <Link2 className="h-4 w-4" />
                Copy deep link
              </Button>
              <Button className="gap-2" disabled={!sharePayload} onClick={handleDownloadQr}>
                <Share2 className="h-4 w-4" />
                Download QR
              </Button>
              <Button variant="ghost" className="gap-2" disabled={!sharePayload} onClick={handleCopyPayload}>
                <Copy className="h-4 w-4" />
                Copy payload JSON
              </Button>
              <Button
                variant="ghost"
                className="gap-2 text-xs text-muted-foreground underline hover:text-foreground"
                disabled={!sharePayload}
                onClick={() => setShowRawPayload(true)}
              >
                Inspect raw JSON
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Audience restriction
                </p>
                <Input
                  placeholder="did:pandora:trusted-verifier"
                  value={audienceDid}
                  onChange={(event) => setAudienceDid(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Limit handshake to a specific verifier DID. Leave empty for open invites.
                </p>
              </div>
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Channel security
                </p>
                <Select value={channel} onValueChange={(value: SharePayload["channel"]) => setChannel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {channelOptions.find((option) => option.value === channel)?.description}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Expiration window
                </p>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expiryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Timer className="h-3.5 w-3.5 text-primary" />
                  TTL enforced by Pandora&apos;s Vault policy engine.
                </div>
              </div>
              <div className="space-y-2 rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Attributes to disclose
                </p>
                <div className="space-y-2">
                  {(selectedCredential?.attributes ?? []).map((attribute) => (
                    <label
                      key={attribute.label}
                      className="flex items-start gap-3 rounded-lg border bg-background/80 p-3"
                    >
                      <Checkbox
                        checked={disclosureMap[attribute.label] ?? false}
                        onCheckedChange={(checked) =>
                          setDisclosureMap((current) => ({
                            ...current,
                            [attribute.label]: Boolean(checked),
                          }))
                        }
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{attribute.label}</p>
                        <p className="font-mono text-xs text-muted-foreground">{attribute.value}</p>
                        <p className="text-[11px] text-muted-foreground/70">
                          {disclosureMap[attribute.label] ? "Revealed to verifier" : "Kept hidden"}
                        </p>
                      </div>
                    </label>
                  ))}
                  {selectedCredential?.attributes?.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Credential has no additional attributes. Entire payload will be shared.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                Share preview
              </p>
              {sharePayload ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-foreground">
                    {sharePayload.credential.title} → {sharePayload.audience ?? "Any verified peer"}
                  </p>
                  <p className="text-xs">
                    Attributes revealed:{" "}
                    {sharePayload.credential.disclosedAttributes
                      .filter((attr) => attr.revealed)
                      .map((attr) => attr.label)
                      .join(", ") || "none"}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs">Select a credential to stage your payload.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Pandora&apos;s Vault mocks full DIDComm handshake without sending data off-device.
          </div>
          <Button disabled={!sharePayload} className="gap-2">
            <Check className="h-4 w-4" />
            Mark payload ready
          </Button>
        </CardFooter>
      </Card>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-lg">Verifier sandbox</CardTitle>
          <CardDescription>
            Use your webcam to scan the QR above or paste a payload to simulate the verifier
            experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
            <div className="overflow-hidden rounded-xl border bg-background">
              <QRScanner onDecode={handleScan} onError={handleScanError} />
            </div>
            <p className="text-xs text-muted-foreground">
              Camera feed stays in-browser. Pandora&apos;s Vault parses the QR and validates the payload
              signature mock.
            </p>
          </div>
          <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Scan results
            </p>
            {scannedPayload ? (
              <div className="space-y-3">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">
                    {scannedPayload.credential.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issuer: {scannedPayload.credential.issuer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Holder: {scannedPayload.holderDid ?? "anonymous"}
                  </p>
                </div>
                <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">Disclosed attributes</p>
                  <ul className="mt-2 space-y-1">
                    {scannedPayload.credential.disclosedAttributes
                      .filter((attr) => attr.revealed)
                      .map((attr) => (
                        <li key={attr.label} className="flex items-center justify-between gap-2">
                          <span>{attr.label}</span>
                          <span className="font-mono text-foreground">{attr.value}</span>
                        </li>
                      ))}
                  </ul>
                </div>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => setScannedPayload(null)}>
                  Reset session
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/10 p-6 text-sm text-muted-foreground">
                {scanError ?? "No payload scanned yet. Present a QR code to populate this panel."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showRawPayload} onOpenChange={setShowRawPayload}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Raw share payload</DialogTitle>
          </DialogHeader>
          <pre className="max-h-[420px] overflow-auto rounded-lg border bg-muted/10 p-4 text-xs text-muted-foreground">
            {sharePayload ? JSON.stringify(sharePayload, null, 2) : "No payload available."}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareScreen;

