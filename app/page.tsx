"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { navigationCards } from "@/lib/constants";

export default function Home() {
  return (
    <main
      className={cn(
        "min-h-screen",
        "bg-gradient-to-b from-[#edf4ff] via-[#f5f7fb] to-[#f9fafb]",
        "flex flex-col",
        "items-start md:items-center",
        "justify-center",
        "pt-[53px] md:pt-0",
        "pb-[53px]",
        "px-4",
        "relative"
      )}
    >
      <div className={cn("w-full", "max-w-6xl", "flex-1", "flex flex-col")}>
        <div
          className={cn("flex", "items-center justify-between", "mb-4 md:mb-6")}
        >
          <div className="flex-1" />
          <div className={cn("flex-1", "text-center")}>
            {/* Logo */}
            <div className={cn("flex justify-center", "mb-2 md:mb-4")}>
              <div
                className={cn(
                  "relative",
                  "inline-flex",
                  "items-center justify-center",
                  "rounded-full",
                  "bg-gradient-to-tr from-emerald-400 via-sky-400 to-blue-500",
                  "p-[2px]",
                  "shadow-lg shadow-emerald-500/30"
                )}
              >
                <div
                  className={cn(
                    "rounded-full",
                    "bg-slate-950",
                    "px-0.5 py-0.5"
                  )}
                >
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={120}
                    height={120}
                    className={cn(
                      "rounded-full",
                      "w-16 h-16 md:w-[120px] md:h-[120px]"
                    )}
                    priority
                  />
                </div>
              </div>
            </div>
            <h1 className={cn("font-semibold", "mb-1", "text-slate-900")}>
              <div
                className={cn("text-4xl md:text-5xl", "whitespace-nowrap")}
                style={{
                  fontFamily: "-apple-system",
                  backgroundImage:
                    "linear-gradient(180deg, rgba(15, 23, 42, 1) 67%, rgba(255, 255, 255, 0.38) 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Jesus is Lord
              </div>
              <div
                className={cn(
                  "text-lg md:text-4xl",
                  "font-light",
                  "whitespace-nowrap"
                )}
                style={{
                  fontFamily:
                    '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: "25px",
                }}
              >
                Luna La Union
              </div>
            </h1>
            {/* Subtitle intentionally omitted */}
          </div>
          <div className="flex-1" />
        </div>

        <div
          className={cn(
            "grid grid-cols-2",
            "gap-4 md:gap-8",
            "items-stretch",
            "mt-8 md:mt-0"
          )}
        >
          {navigationCards.map((card) => (
            <Link key={card.href} href={card.href} className="h-full">
              <div
                className={cn(
                  "rounded-2xl",
                  "p-4 md:p-8",
                  "shadow-xl",
                  "transition-all",
                  "cursor-pointer",
                  "group",
                  "h-full",
                  "min-h-[140px] md:min-h-0",
                  "flex flex-col",
                  "bg-white",
                  "border border-slate-200",
                  "hover:border-emerald-300/80",
                  "hover:shadow-lg"
                )}
              >
                <div
                  className={cn(
                    "text-center",
                    "flex-1",
                    "flex flex-col",
                    "justify-center"
                  )}
                >
                  <div className={cn("mb-3 md:mb-5", "flex justify-center")}>
                    <Image
                      src={card.imageUrl}
                      alt={card.alt}
                      width={96}
                      height={96}
                      className={cn(
                        "w-24 h-24 md:w-20 md:h-20",
                        "object-contain",
                        "opacity-70",
                        "group-hover:opacity-100",
                        "transition-opacity"
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-sm md:text-2xl",
                      "font-semibold",
                      "mb-1 md:mb-2",
                      "text-slate-900"
                    )}
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {card.title}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <footer
        className={cn("w-full", "text-center", "mt-auto", "py-4 md:py-6")}
      >
        <p className={cn("text-xs md:text-sm", "text-slate-600")}>
          Developed and maintained by{" "}
          <span className={cn("font-semibold", "text-slate-700")}>
            Paolo P. Espero
          </span>
        </p>
      </footer>
    </main>
  );
}
