import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Jobbiton",
  description: "AI-powered job hunting assistant for finding, matching, and researching developer jobs.",
};

const themeInitScript = `
try {
  var storedTheme = window.localStorage.getItem("jobbiton-theme");
  var theme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "dark";
  document.documentElement.dataset.theme = theme;
} catch (error) {
  document.documentElement.dataset.theme = "dark";
}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
