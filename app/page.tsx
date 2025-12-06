"use client";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const mainBgClass =
    "bg-gradient-to-b from-[#edf4ff] via-[#f5f7fb] to-[#f9fafb]";

  const cardBaseClass =
    "rounded-2xl p-4 md:p-8 shadow-xl transition-all cursor-pointer group h-full min-h-[140px] md:min-h-0 flex flex-col bg-white border border-slate-200 hover:border-emerald-300/80 hover:shadow-lg";

  const titleTextClass = "text-slate-900";
  const bodyTextClass = "text-slate-600";

  return (
    <main
      className={`min-h-screen ${mainBgClass} flex flex-col items-start md:items-center justify-center pt-4 md:pt-0 p-4 relative`}
    >
      <div className="w-full max-w-6xl flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex-1" />
          <div className="flex-1 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-2 md:mb-4">
              <div className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 via-sky-400 to-blue-500 p-[2px] shadow-lg shadow-emerald-500/30">
                <div className="rounded-full bg-slate-950 px-0.5 py-0.5">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={120}
                    height={120}
                    className="rounded-full w-16 h-16 md:w-[120px] md:h-[120px]"
                    priority
                  />
                </div>
              </div>
            </div>
            <h1 className="font-semibold mb-1 text-slate-900">
              <div className="text-2xl md:text-5xl whitespace-nowrap">
                Jesus is Lord
              </div>
              <div className="text-lg md:text-4xl font-light whitespace-nowrap">
                Luna La Union
              </div>
            </h1>
            {/* Subtitle intentionally omitted */}
          </div>
          <div className="flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-8 items-stretch mt-8 md:mt-0">
          {/* Scanner Card */}
          <Link href="/scanner/login" className="h-full">
            <div className={cardBaseClass}>
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-5 flex justify-center">
                  <Image
                    src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-1xM90oqSp9LaGF6Z63GPS7rnUycLEz.png&w=1000&q=75"
                    alt="Scanner"
                    width={96}
                    height={96}
                    className="w-24 h-24 md:w-20 md:h-20 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h2
                  className={`text-sm md:text-2xl font-semibold mb-1 md:mb-2 ${titleTextClass}`}
                >
                  Scanner
                </h2>
              </div>
            </div>
          </Link>

          {/* Admin Dashboard Card */}
          <Link href="/admin/login" className="h-full">
            <div className={cardBaseClass}>
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-5 flex justify-center">
                  <Image
                    src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-fSMgViPMUbS0kVcbqdCIHuTbarLfB5.png&w=1000&q=75"
                    alt="Admin Dashboard"
                    width={96}
                    height={96}
                    className="w-24 h-24 md:w-20 md:h-20 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h2
                  className={`text-sm md:text-2xl font-semibold mb-1 md:mb-2 ${titleTextClass}`}
                >
                  Admin Dashboard
                </h2>
              </div>
            </div>
          </Link>

          {/* Financials Card */}
          <Link href="/finance/login" className="h-full">
            <div className={cardBaseClass}>
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-5 flex justify-center">
                  <Image
                    src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-02CCXz1lNDkRWPm2eymmcNv5kHyepe.png&w=1000&q=75"
                    alt="Financials"
                    width={96}
                    height={96}
                    className="w-24 h-24 md:w-20 md:h-20 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h2
                  className={`text-sm md:text-2xl font-semibold mb-1 md:mb-2 ${titleTextClass}`}
                >
                  Financials
                </h2>
              </div>
            </div>
          </Link>

          {/* Help Card */}
          <Link href="/admin/help" className="h-full">
            <div className={cardBaseClass}>
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-5 flex justify-center">
                  <Image
                    src="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-GHLlVvoifSdvzv5ojMTLUf8GOVIeee.png&w=1000&q=75"
                    alt="Help"
                    width={96}
                    height={96}
                    className="w-24 h-24 md:w-20 md:h-20 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <h2
                  className={`text-sm md:text-2xl font-semibold mb-1 md:mb-2 ${titleTextClass}`}
                >
                  Help
                </h2>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <footer className="w-full text-center mt-auto py-4 md:py-6">
        <p className="text-xs md:text-sm text-slate-600">
          Developed and maintained by{" "}
          <span className="font-semibold text-slate-700">Paolo P. Espero</span>
        </p>
      </footer>
    </main>
  );
}
