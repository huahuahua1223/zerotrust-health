import { Outlet } from "react-router-dom";
import { useAppKitAccount } from "@reown/appkit/react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useContractEvents } from "@/hooks/useContractEvents";

export function MainLayout() {
  const { address } = useAppKitAccount();
  
  // Enable contract event listeners for real-time updates
  useContractEvents(address as `0x${string}` | undefined);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
