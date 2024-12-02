import localFont from "next/font/local";
import "./globals.css";


import { ThemeProvider } from "@/components/theme-provider";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

import { ExpenseProvider } from "@/context/ExpenseContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "FinSaathi",
  description: "Finance Buddy",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoImageUrl: "/icon/logo.svg",
          socialButtonsVariant: "iconButton",
          unsafe_disableDevelopmentModeWarnings: true,
        },

      }}
    >
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <title>TrueSight</title>
          <meta name="description" content="TrueSight" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/icons/logo.svg" />
          <link rel="apple-touch-icon" href="/icons/logo.svg" />


        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
              <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <ExpenseProvider>
                    {children}
                  </ExpenseProvider>
                </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
