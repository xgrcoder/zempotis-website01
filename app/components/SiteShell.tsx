"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function SiteShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPortal = pathname.startsWith("/portal");
  const isEmbed  = pathname.startsWith("/embed");

  if (isEmbed) return <>{children}</>;

  return (
    <>
      {!isPortal && <Header />}
      <main>{children}</main>
      {!isPortal && footer}
    </>
  );
}