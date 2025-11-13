import { useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useHasDid } from "@/modules/wallet/hooks";

export const WelcomeScreen = () => {
  const hasDid = useHasDid();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasDid) {
      navigate("/", { replace: true });
    }
  }, [hasDid, navigate]);

  return (
    <Card className="border-border/60 bg-card/80 shadow-lg backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome to Pandora&apos;s Vault
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Create your decentralized identity or import an existing DID.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 py-8">
        <p className="text-sm text-muted-foreground">
          Pandora&apos;s Vault operates entirely on-device. Begin by establishing a decentralized identifier (DID) so your vault can bind credentials, recovery guardians, and selective disclosure payloads to your identity.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button size="lg" className="flex-1" onClick={() => navigate("/create-did")}>
          Generate New DID
        </Button>
        <Button size="lg" variant="outline" className="flex-1" onClick={() => navigate("/import-did")}>
          Use Existing DID
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WelcomeScreen;


