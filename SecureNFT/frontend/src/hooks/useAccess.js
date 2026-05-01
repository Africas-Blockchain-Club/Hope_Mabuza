import { useState } from "react";

const SERVER_URL = "http://localhost:3000";

export function useAccess() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [accessMessage, setAccessMessage] = useState(null);
  const [accessError, setAccessError] = useState(null);

  async function checkAccess(walletAddress) {
    if (!walletAddress) {
      setAccessError("No wallet address found. Please connect your wallet first.");
      return;
    }

    try {
      setIsChecking(true);
      setAccessMessage(null);
      setAccessError(null);

      // Send the wallet address to your Express server
      // The server checks the blockchain and responds with authorized: true/false
      const response = await fetch(`${SERVER_URL}/verify-nft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (data.authorized) {
        setIsAuthorized(true);
        setAccessMessage(data.message); // "Access Granted"
      } else {
        setIsAuthorized(false);
        setAccessError(data.message); // "No NFT found"
      }
    } catch (err) {
      // This fires if the server is not running
      setAccessError("Could not reach the server. Make sure it is running on port 3000.");
      console.error("Access check error:", err);
    } finally {
      setIsChecking(false);
    }
  }

  return { isAuthorized, isChecking, accessMessage, accessError, checkAccess };
}