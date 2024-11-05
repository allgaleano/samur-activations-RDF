import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Samur Activations",
  description: "App to track samur activations with RDF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full">
        {children}
      </body>
    </html>
  );
}
