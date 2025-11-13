import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/layout/AppLayout";
import OnboardingLayout from "@/layout/OnboardingLayout";
import { HomeScreen } from "@/screens/Home/HomeScreen";
import { ApplyScreen } from "@/screens/apply/ApplyScreen";
import { RequestsScreen } from "@/screens/requests/RequestsScreen";
import { CredentialsScreen } from "@/screens/Credentials/CredentialsScreen";
import { ShareScreen } from "@/screens/Share/ShareScreen";
import { RecoveryScreen } from "@/screens/Recovery/RecoveryScreen";
import { SettingsScreen } from "@/screens/Settings/SettingsScreen";
import { WelcomeScreen } from "@/screens/onboarding/WelcomeScreen";
import { CreateDidScreen } from "@/screens/onboarding/CreateDidScreen";
import { ImportDidScreen } from "@/screens/onboarding/ImportDidScreen";
import { InitScreen } from "@/screens/onboarding/InitScreen";
import IssuerSimulator from "@/screens/apply/IssuerSimulator";
import RequireDid from "@/routes/RequireDid";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<OnboardingLayout />}>
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/create-did" element={<CreateDidScreen />} />
          <Route path="/import-did" element={<ImportDidScreen />} />
          <Route path="/init" element={<InitScreen />} />
        </Route>
        <Route element={<RequireDid />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomeScreen />} />
            <Route path="home" element={<HomeScreen />} />
            <Route path="apply" element={<ApplyScreen />} />
          <Route path="credentials" element={<CredentialsScreen />} />
            <Route path="requests" element={<RequestsScreen />} />
          <Route path="share" element={<ShareScreen />} />
          <Route path="recovery" element={<RecoveryScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
            <Route path="issuer-simulator" element={<IssuerSimulator />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
