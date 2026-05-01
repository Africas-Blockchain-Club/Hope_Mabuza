import { useContract } from "./hooks/useContract";
import { useAccess } from "./hooks/useAccess";
import ParticleField from "./components/ParticleField";
import GatePage from "./pages/GatePage";
import HomePage from "./pages/HomePage";

function App() {
  // Blockchain connection — called once, shared everywhere
  const { contract, account, isConnected, error, connectWallet } = useContract();

  // Server access check — called once, controls which page shows
  const { isAuthorized, isChecking, accessMessage, accessError, checkAccess } = useAccess();

  return (
    <>
      {/* Sparkles always visible — on both gate and garden */}
      <ParticleField />

      {/* THE GATE — if not authorized, show GatePage */}
      {!isAuthorized && (
        <GatePage
          account={account}
          isConnected={isConnected}
          error={error}
          connectWallet={connectWallet}
          isAuthorized={isAuthorized}
          isChecking={isChecking}
          accessMessage={accessMessage}
          accessError={accessError}
          checkAccess={checkAccess}
        />
      )}

      {/* THE GARDEN — only shown after server confirms Rose ownership */}
      {isAuthorized && (
        <HomePage
          contract={contract}
          account={account}
          isConnected={isConnected}
          error={error}
          connectWallet={connectWallet}
        />
      )}
    </>
  );
}

export default App;