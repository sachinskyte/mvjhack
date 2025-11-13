import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

export const OnboardingLayout = () => {
  return (
    <div className={cn("flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground")}>
      <div className="w-full max-w-3xl">
        <Outlet />
      </div>
    </div>
  );
};

export default OnboardingLayout;


