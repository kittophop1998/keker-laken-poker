import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Kaker Laken Poker",
  description: "เกมโกหกสุดมันส์ที่ต้องใช้ทั้งไหวพริบและหน้านิ่ง!",
  icons: {
    icon: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={kanit.variable}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
