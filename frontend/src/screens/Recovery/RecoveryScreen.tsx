import { useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useWallet, useWalletActions } from "@/modules/wallet/hooks";
import { formatBytes, delay } from "@/lib/utils";
import {
  CheckCircle,
  Download,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";

const guardianTemplates = [
  {
    name: "Alicia · Hardware token",
    status: "Green",
    responseWindow: "12m avg",
  },
  {
    name: "Nova DAO · Multisig",
    status: "Amber",
    responseWindow: "Awaiting",
  },
  {
    name: "Emergency storage vault",
    status: "Red",
    responseWindow: "3d since heartbeat",
  },
];

export const RecoveryScreen = () => {
  const { shares, did } = useWallet();
  const { generateShares, clearShares, validateShares } = useWalletActions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareInputs, setShareInputs] = useState<string[]>(["", "", ""]);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    matched: number;
    missing: number;
  } | null>(null);

  const handleGenerateShares = async () => {
    setIsGenerating(true);
    await delay(500);
    generateShares();
    setShareInputs(["", "", ""]);
    setSimulationResult(null);
    setIsGenerating(false);
    toast({
      title: "Recovery shares generated",
      description: "Distribute each shard to a unique guardian.",
      variant: "success",
    });
  };

  const handleDownloadShares = () => {
    if (shares.length === 0) return;
    const content = [
      `Pandora's Vault · Shamir shares (${shares.length})`,
      `Generated: ${new Date().toISOString()}`,
      `Primary DID: ${did ?? "unnamed"}`,
      "",
      ...shares.map((share) => `${share.label}: ${share.value}`),
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "pandoras-vault-recovery-shares.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Shares exported",
      description: "Secure the text file in offline storage immediately.",
      variant: "info",
    });
  };

  const handleSimulate = () => {
    const result = validateShares(shareInputs);
    setSimulationResult({
      success: result.valid,
      matched: result.matchedShares.length,
      missing: result.missing,
    });
    toast({
      title: result.valid ? "Quorum satisfied" : "Quorum incomplete",
      description: result.valid
        ? "Three out of five shares verified. Vault keys can be reconstructed."
        : `Only ${result.matchedShares.length} share(s) matched. Provide ${result.missing} more to continue.`,
      variant: result.valid ? "success" : "destructive",
    });
  };

  const shareEntropy = useMemo(() => {
    if (shares.length === 0) return 0;
    return shares.reduce((acc, share) => acc + share.value.length, 0);
  }, [shares]);

  return (
    <div className="space-y-8">
      <Card className="bg-card/70">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="uppercase tracking-wide">
              Pandora&apos;s Vault recovery mesh
            </Badge>
            <CardTitle className="text-2xl">Guardian-controlled restoration</CardTitle>
            <CardDescription>
              Generate Shamir-style shards, brief your guardians, and rehearse the unlock ceremony in a
              zero-risk environment.
            </CardDescription>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Best practices
            </p>
            <ul className="mt-2 space-y-1 leading-relaxed">
              <li>• Never store all shares together. Each guardian keeps just one.</li>
              <li>• Rotate shares whenever guardians join or leave the quorum.</li>
              <li>• Practice reconstruction quarterly to retain muscle memory.</li>
            </ul>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Share inventory
                </CardTitle>
                <CardDescription>
                  {shares.length > 0
                    ? `${shares.length} shards ready for distribution.`
                    : "No shares issued yet."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Entropy footprint · <span className="text-foreground">{formatBytes(shareEntropy)}</span>
                </p>
                <p>Threshold policy · 3 of 5 guardians required.</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Guardian health
                </CardTitle>
                <CardDescription>Monitor availability before requesting shares.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {guardianTemplates.map((guardian) => (
                  <div key={guardian.name} className="flex items-center justify-between">
                    <span>{guardian.name}</span>
                    <Badge variant="outline">{guardian.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Ceremony steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-3 rounded-lg border bg-background/60 p-3">
                  <Users2 className="mt-1 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mobilize guardians</p>
                    <p>Ping each guardian for video verification and availability.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border bg-background/60 p-3">
                  <KeyRound className="mt-1 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Collect shards</p>
                    <p>Ensure each share arrives via an encrypted channel you control.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border bg-background/60 p-3">
                  <ShieldCheck className="mt-1 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Rehydrate vault keys</p>
                    <p>Once quorum is met, Pandora&apos;s Vault will unlock and rebind devices.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
            <Card className="bg-card/70">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-lg">Generate guardian shares</CardTitle>
                  <CardDescription>
                    Issue five shards and distribute them across your guardian roster.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2"
                    onClick={handleGenerateShares}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {shares.length ? "Regenerate shares" : "Generate shares"}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleDownloadShares}
                    disabled={shares.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Download text bundle
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2 text-destructive"
                    onClick={() => {
                      clearShares();
                      setSimulationResult(null);
                      toast({
                        title: "Shares cleared",
                        description: "All recovery shards removed from local store.",
                        variant: "destructive",
                      });
                    }}
                    disabled={shares.length === 0}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {shares.length === 0 && (
                  <div className="col-span-full rounded-lg border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                    Press <strong>Generate shares</strong> to mint five guardian shards bound to your vault DID.
                  </div>
                )}
                {shares.map((share, index) => (
                  <div key={share.id} className="flex flex-col gap-2 rounded-lg border bg-background/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {share.label}
                      </span>
                      <Badge variant="outline">Guardian {index + 1}</Badge>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(share.value);
                        toast({
                          title: `${share.label} copied`,
                          description: "Send securely to its guardian.",
                          variant: "info",
                        });
                      }}
                      className="truncate rounded-md border bg-muted/40 px-3 py-2 text-left font-mono text-xs hover:bg-muted"
                    >
                      {share.value}
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                      Issued {new Date(share.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Pandora&apos;s Vault generates deterministic-looking shards for demo purposes. In production this
                would wrap real Shamir calculations and secure enclave binding.
              </CardFooter>
            </Card>

            <Card className="bg-card/70">
              <CardHeader>
                <CardTitle className="text-lg">Simulate recovery</CardTitle>
                <CardDescription>Provide any three shares to unlock the vault locally.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shareInputs.map((value, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Share {index + 1}
                    </label>
                    <Input
                      placeholder="PASTE-GUARDIAN-SHARE"
                      value={value}
                      onChange={(event) => {
                        const next = [...shareInputs];
                        next[index] = event.target.value.toUpperCase();
                        setShareInputs(next);
                      }}
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                ))}
                <Button
                  className="w-full gap-2"
                  onClick={handleSimulate}
                  disabled={shares.length === 0}
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify threshold
                </Button>
                {simulationResult && (
                  <div
                    className={`rounded-lg border p-4 text-sm ${
                      simulationResult.success
                        ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-900 dark:text-emerald-100"
                        : "border-destructive/40 bg-destructive/10 text-destructive-foreground"
                    }`}
                  >
                    {simulationResult.success ? (
                      <div className="space-y-1">
                        <p className="font-semibold">Threshold satisfied</p>
                        <p>
                          {simulationResult.matched} valid shares entered. Vault keys reconstructed for device
                          rebinding.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-semibold">Additional shares required</p>
                        <p>
                          Provide {simulationResult.missing} more valid share
                          {simulationResult.missing === 1 ? "" : "s"} to reach quorum.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Simulation never transmits shares. Use it to rehearse with your guardians before actual incidents.
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecoveryScreen;

