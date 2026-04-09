"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import ZempotisChat from "./ZempotisChat";

export default function SiteShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith("/portal");

  return (
    <>
      {!isPortal && <Header />}
      <main>{children}</main>
      {!isPortal && footer}
      {!isPortal && <ZempotisChat />}
    </>
  );
}