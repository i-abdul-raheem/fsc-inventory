import { Noto_Nastaliq_Urdu } from "next/font/google";

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-nastaliq-urdu",
});

export default function HowToUseUrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      lang="ur"
      className={`${notoNastaliqUrdu.className} ${notoNastaliqUrdu.variable} text-[1.0625rem] leading-[1.85] antialiased sm:text-[1.075rem]`}
    >
      {children}
    </div>
  );
}
