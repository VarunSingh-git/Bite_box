import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bite Box - Hyperlocal Home Food",
  description: "Order fresh home-cooked food from local kitchens near you.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-background text-foreground`}>
      {/* <Suspense fallback={< />}> */}
                {/* <RestaurantList searchParams={searchParams} /> */}
                <Navbar />
            {/* </Suspense> */}
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          <p>© 2026 Bite Box.</p>
        </footer>
      </body>
    </html>
  );
}
