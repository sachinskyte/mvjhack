import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/hooks/useTheme";
import { useWalletActions } from "@/modules/wallet/hooks";
import { useState } from "react";

export const SettingsScreen = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useWalletActions();
  const [developerMode, setDeveloperMode] = useState(false);
  const [secureStorage, setSecureStorage] = useState(true);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Environment preferences</CardTitle>
          <CardDescription>
            Tailor the wallet experience, connectivity, and developer tooling.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">
                  Toggle the interface theme. Stored locally on this device.
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => toggleTheme()}
              />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Logout</p>
                <p className="text-xs text-muted-foreground">
                  Sign out and clear local session keys and pending applications.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Secure storage</p>
                <p className="text-xs text-muted-foreground">
                  Encrypt cached credential material before persisting.
                </p>
              </div>
              <Switch
                checked={secureStorage}
                onCheckedChange={(value) => setSecureStorage(value)}
              />
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Developer mode</p>
                <p className="text-xs text-muted-foreground">
                  Expose DID document inspector and protocol traces.
                </p>
              </div>
              <Switch
                checked={developerMode}
                onCheckedChange={(value) => setDeveloperMode(value)}
              />
            </div>
          </section>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Preferred DID method</p>
                <p className="text-xs text-muted-foreground">
                  Define the default DID method for new identities.
                </p>
              </div>
              <Badge variant="outline">did:key</Badge>
            </div>
            <Input placeholder="e.g. did:ion, did:web, did:peer" />
          </section>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Integration endpoints</CardTitle>
          <CardDescription>
            Configure network relays, credential registries, or analytics sinks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-muted-foreground">
                DID Registry URL
              </label>
              <Input placeholder="https://registry.identity.network" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-muted-foreground">
                Webhook callback
              </label>
              <Input placeholder="https://example.com/webhooks/wallet" />
            </div>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground">
            Endpoint changes apply instantly and are stored in local
            configuration. Syncing with collaborators requires export.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsScreen;

