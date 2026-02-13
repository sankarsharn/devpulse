import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBarClient from "./components/NavBarClient";
import { ThemeProvider } from "@/context/ThemeContext"; // 1. Import the Provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevPulse",
  description: "Showcase your projects with a pulse.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning> 
      {/* 2. suppressHydrationWarning prevents mismatched server/client warning for themes */}
      <head>
        {/* 3. The "Flash Guard" Script: This checks the theme before the page even paints */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const settings = JSON.parse(localStorage.getItem('devpulse_settings_v1'));
                const isDark = settings?.preferences?.darkMode;
                if (isDark === true || (isDark === undefined)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <ClerkProvider
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/dashboard"
          >
            <NavBarClient />
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}