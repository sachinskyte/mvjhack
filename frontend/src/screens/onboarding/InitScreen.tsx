import { useEffect, useMemo, useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/modules/wallet/hooks";

type Step = {
  label: string;
  helper: string;
  progress: number;
};

const steps: Step[] = [
  { label: "Loading DID Document...", helper: "Resolving cryptographic material for your identifier.", progress: 20 },
  { label: "Preparing secure vault...", helper: "Setting up encrypted storage and session keys.", progress: 45 },
  { label: "Restoring credentials...", helper: "Decrypting locally persisted credential inventory.", progress: 70 },
  { label: "Syncing local storage...", helper: "Ensuring offline cache is ready for zero-trust operations.", progress: 95 },
];

export const InitScreen = () => {
  const { did } = useWallet();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!did) {
      navigate("/welcome", { replace: true });
    }
  }, [did, navigate]);

  useEffect(() => {
    if (!did || isReady) {
      return;
    }

    if (stepIndex >= steps.length) {
      const timeout = window.setTimeout(() => {
        setIsReady(true);
      }, 600);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setStepIndex((current) => current + 1);
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [did, isReady, stepIndex]);

  const currentStep = useMemo(
    () => steps[Math.min(stepIndex, steps.length - 1)] ?? steps[steps.length - 1],
    [stepIndex]
  );

  return (
    <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-foreground">
          Initializing your vault workspace
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Pandora&apos;s Vault is staging local services and preparing your DID context for sandbox operations.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 py-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isReady ? "Vault ready." : currentStep.label}</span>
            <span>{isReady ? "100%" : `${currentStep.progress}%`}</span>
          </div>
          <Progress value={isReady ? 100 : currentStep.progress} />
        </div>
        <ul className="grid gap-3">
          {steps.map((step, index) => {
            const isComplete = index < stepIndex || isReady;
            const isActive = index === stepIndex && !isReady;
            return (
              <li
                key={step.label}
                className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
              >
                <div className="flex items-center justify-between text-sm font-medium text-foreground">
                  <span>{step.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {isComplete ? "Complete" : isActive ? "In progress" : "Queued"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{step.helper}</p>
              </li>
            );
          })}
        </ul>
        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Current DID</p>
          <div className="mt-2 rounded-md border bg-background/90 p-3 font-mono text-sm text-foreground">
            {did ?? <Skeleton className="h-5 w-full rounded-sm" />}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => navigate("/")} disabled={!isReady}>
          Enter Wallet
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InitScreen;


