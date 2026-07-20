import type { Metadata } from "next";
import { Fredoka, Nunito, JetBrains_Mono, Kanit } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

// Display: rounded and playful (DESIGN.md)
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
});

// Body and UI
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

// Room codes, scores, timers, card counts
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono-jb",
});

// Carries the Thai glyphs that Fredoka and Nunito do not cover.
const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Cockroach Table — โกหกให้เนียน จับพิรุธให้ทัน",
  description: "เกมบลัฟบนโต๊ะไม้ ส่งการ์ดให้เพื่อน อ้างว่าเป็นตัวอะไรก็ได้ แล้วลุ้นว่าจะโดนจับได้ไหม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${fredoka.variable} ${nunito.variable} ${jetbrains.variable} ${kanit.variable}`}
      >
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
