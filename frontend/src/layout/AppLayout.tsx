import {
  type ComponentType,
  type SVGProps,
  useMemo,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Badge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useWalletActions } from "@/modules/wallet/hooks";
import {
  Home,
  IdCard,
  Menu,
  Settings,
  Share2,
  ShieldCheck,
  Sun,
  Moon,
  Wallet2,
  QrCode,
  FileSignature,
  Inbox,
} from "lucide-react";

type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
};

const navItems: NavItem[] = [
  {
    label: "Home",
    to: "/",
    icon: Home,
    description: "Overview of your Pandora's Vault command center.",
  },
  {
    label: "Apply",
    to: "/apply",
    icon: FileSignature,
    description: "Request high-trust identity credentials via simulated issuer nodes.",
  },
  {
    label: "Requests",
    to: "/requests",
    icon: Inbox,
    description: "Review incoming disclosures and manage verifier access.",
  },
  {
    label: "Credentials",
    to: "/credentials",
    icon: IdCard,
    description: "Review and manage verifiable credentials.",
  },
  {
    label: "Share",
    to: "/share",
    icon: Share2,
    description: "Generate sharable QR codes and connection invites.",
  },
  {
    label: "Recovery",
    to: "/recovery",
    icon: ShieldCheck,
    description: "Coordinate key recovery flows and guardians.",
  },
  {
    label: "Settings",
    to: "/settings",
    icon: Settings,
    description: "Vault preferences, environment, and developer tools.",
  },
];

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { logout } = useWalletActions();

  const activeDescription = useMemo(() => {
    const active = navItems.find((item) => item.to === location.pathname);
    return active?.description ?? "Navigate through the wallet toolkit.";
  }, [location.pathname]);

  const breadcrumbSegments = useMemo(() => {
    const segments = location.pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return [{ label: "Home", to: "/" }];
    }

    return [
      { label: "Home", to: "/" },
      ...segments.map((segment, index) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        to: `/${segments.slice(0, index + 1).join("/")}`,
      })),
    ];
  }, [location.pathname]);

  const renderNavLink = (item: NavItem, isSidebar = false) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            isSidebar && "w-full justify-start"
          )
        }
        end={item.to === "/"}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 transition-colors sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Wallet2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight text-foreground">
                Pandora&apos;s Vault
              </span>
              <span className="text-xs text-muted-foreground">
                DID Toolkit & Credential Vault
              </span>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              Alpha
            </Badge>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => renderNavLink(item))}
          </nav>
          <div className="flex items-center gap-2">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-full max-w-xs flex-col gap-6 bg-background px-0 text-foreground">
                <SheetHeader className="px-6">
                  <SheetTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="h-5 w-5 text-primary" />
                    Pandora&apos;s Vault
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Quick access to every part of your decentralized identity vault.
                  </p>
                </SheetHeader>
                <Separator />
                <nav className="flex flex-1 flex-col gap-1 px-4">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.to}>
                      {renderNavLink(item, true)}
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 pb-10 pt-6 sm:px-6">
        <main className="flex-1 space-y-6">
          <div className="rounded-xl border bg-card/60 px-4 py-3 text-sm text-muted-foreground sm:px-6">
            {activeDescription}
          </div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            {breadcrumbSegments.map((segment, index) => {
              const isLast = index === breadcrumbSegments.length - 1;
              if (isLast) {
                return (
                  <span key={segment.to} className="font-medium text-foreground">
                    {segment.label}
                  </span>
                );
              }

              return (
                <div key={segment.to} className="flex items-center gap-2">
                  <Link
                    to={segment.to}
                    className="transition-colors hover:text-foreground"
                  >
                    {segment.label}
                  </Link>
                  <span>/</span>
                </div>
              );
            })}
          </nav>
          <section className="flex flex-1 flex-col">
            <Outlet />
          </section>
        </main>
      </div>
      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col-reverse gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} Pandora&apos;s Vault. Prototype interface for decentralized identity management.</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">DID Core Ready</Badge>
            <Badge variant="secondary">Credential vNext</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;

