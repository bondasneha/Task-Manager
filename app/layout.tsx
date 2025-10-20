import React from "react";

export const metadata = {
  title: "Next.js Dashboard",
  description: "A task management dashboard built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
