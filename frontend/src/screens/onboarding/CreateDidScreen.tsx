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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useHasDid, useWalletActions } from "@/modules/wallet/hooks";

type Step = {
  label: string;
  progress: number;
};

const placeholderDid = "did:key:z6MkExamplePlaceholder";

const steps: Step[] = [
  { label: "Generating cryptographic keypair...", progress: 25 },
  { label: "Constructing DID...", progress: 55 },
  { label: "Finalizing your identity...", progress: 85 },
  { label: "Sealing DID to vault context...", progress: 100 },
];

export const CreateDidScreen = () => {
  const hasDid = useHasDid();
  const navigate = useNavigate();
  const { setDid } = useWalletActions();
  const [stepIndex, setStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (hasDid) {
      navigate("/init", { replace: true });
    }
  }, [hasDid, navigate]);

  useEffect(() => {
    if (hasDid || isComplete) {
      return;
    }

    const isLastStep = stepIndex >= steps.length - 1;
    const timeout = window.setTimeout(() => {
      if (isLastStep) {
        setIsComplete(true);
        setDid(placeholderDid);
        navigate("/init", { replace: true });
      } else {
        setStepIndex((current) => Math.min(current + 1, steps.length - 1));
      }
    }, isLastStep ? 900 : 1100);

    return () => window.clearTimeout(timeout);
  }, [hasDid, isComplete, stepIndex, setDid, navigate]);

  const currentStep = useMemo(() => steps[Math.min(stepIndex, steps.length - 1)], [stepIndex]);

  return (
    <Card className="border-border/60 bg-card/80 shadow-xl backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-semibold text-foreground">
          Generate a new decentralized identifier
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Pandora&apos;s Vault will simulate DID key material locally. No network calls are made during this demo flow.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 py-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentStep.label}</span>
            <span>{currentStep.progress}%</span>
          </div>
          <Progress value={currentStep.progress} />
        </div>
        <ul className="grid gap-3">
          {steps.map((step, index) => {
            const state =
              index < stepIndex ? "complete" : index === stepIndex ? "active" : "pending";
            return (
              <li
                key={step.label}
                className={cn(
                  "rounded-lg border bg-muted/30 px-4 py-3 text-sm transition-colors",
                  state === "complete" && "border-primary/40 bg-primary/10 text-foreground",
                  state === "active" && "border-primary/60 bg-primary/5",
                  state === "pending" && "opacity-70"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{step.label}</span>
                  <Badge variant={state === "complete" ? "secondary" : "outline"}>
                    {state === "complete" ? "Complete" : state === "active" ? "In progress" : "Queued"}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="rounded-lg border bg-muted/20 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Preview DID</p>
          <div className="mt-2 rounded-md border bg-background/90 p-3 font-mono text-sm text-muted-foreground">
            {isComplete ? (
              <span className="text-foreground">{placeholderDid}</span>
            ) : (
              <Skeleton className="h-5 w-full rounded-sm" />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" onClick={() => navigate("/welcome")} className="text-sm">
          Back
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateDidScreen;


