import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useHasDid } from "@/modules/wallet/hooks";

export const RequireDid = () => {
  const hasDid = useHasDid();
  const location = useLocation();

  if (!hasDid) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireDid;


