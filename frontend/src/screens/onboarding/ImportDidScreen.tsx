import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useHasDid, useWalletActions } from "@/modules/wallet/hooks";

const didPattern = /^did:[a-z0-9]+:[a-zA-Z0-9.\-_:]+$/i;

type Status = "idle" | "validating" | "invalid" | "valid";

export const ImportDidScreen = () => {
  const navigate = useNavigate();
  const hasDid = useHasDid();
  const { setDid } = useWalletActions();
  const [didInput, setDidInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (hasDid) {
      navigate("/init", { replace: true });
    }
  }, [hasDid, navigate]);

  const handleValidate = () => {
    const value = didInput.trim();
    if (!value) {
      setStatus("invalid");
      setMessage("Enter a DID before validating.");
      return;
    }

    setStatus("validating");
    setMessage("Validating...");

    window.setTimeout(() => {
      if (didPattern.test(value)) {
        setStatus("valid");
        setMessage("Valid DID detected.");
      } else {
        setStatus("invalid");
        setMessage("Invalid DID format. Expected shape: did:method:uniqueIdentifier");
      }
    }, 700);
  };

  const handleContinue = () => {
    if (status !== "valid") {
      return;
    }

    const value = didInput.trim();
    setDid(value);
    navigate("/init", { replace: true });
  };

  const alertVariant = status === "invalid" ? "destructive" : status === "valid" ? "default" : "default";

  return (
    <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-foreground">Import Existing DID</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Paste an existing decentralized identifier to bind Pandora&apos;s Vault to your identity.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 py-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Decentralized identifier
          </label>
          <Input
            placeholder="did:example:123abc..."
            value={didInput}
            onChange={(event) => {
              setDidInput(event.target.value);
              if (status !== "idle") {
                setStatus("idle");
                setMessage(null);
              }
            }}
            spellCheck={false}
          />
        </div>
        {message && (
          <Alert variant={alertVariant === "destructive" ? "destructive" : "default"}>
            <AlertTitle>
              {status === "validating"
                ? "Validating DID"
                : status === "invalid"
                ? "Validation error"
                : status === "valid"
                ? "Ready to continue"
                : "Status"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={() => navigate("/welcome")}>
          Back
        </Button>
        <div className="flex flex-1 gap-3 sm:justify-end">
          <Button variant="outline" onClick={handleValidate} disabled={status === "validating"}>
            {status === "validating" ? "Validating..." : "Validate DID"}
          </Button>
          <Button onClick={handleContinue} disabled={status !== "valid"}>
            Continue
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ImportDidScreen;


