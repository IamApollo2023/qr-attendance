"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { navigationCards } from "@/lib/constants";
import { useEffect, useState } from "react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready before triggering animation
    const timer = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <main
      className={cn(
        "min-h-screen",
        "flex flex-col",
        "items-start md:items-center",
        "justify-center",
        "pt-[53px] md:pt-0",
        "pb-[53px]",
        "px-4",
        "relative",
        isMounted ? "page-enter" : "opacity-0"
      )}
      style={{
        background: `radial-gradient(circle at 20% 20%, rgba(0, 245, 160, 0.7) 0%, transparent 55%),
    radial-gradient(circle at 50% 40%, rgba(0, 217, 255, 0.8) 0%, transparent 60%),
    radial-gradient(circle at 80% 60%, rgba(185, 103, 255, 0.6) 0%, transparent 50%),
    radial-gradient(circle at 40% 70%, rgba(5, 255, 161, 0.5) 0%, transparent 45%),
    #0f0f23`,
      }}
    >
      <div className={cn("w-full", "max-w-6xl", "flex-1", "flex flex-col")}>
        <div
          className={cn("flex", "items-center justify-between", "mb-4 md:mb-6")}
        >
          <div className="flex-1" />
          <div
            className={cn("flex-1", "text-center", isMounted && "header-enter")}
          >
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
            <h1 className={cn("font-semibold", "mb-1", "text-white")}>
              <div
                className={cn(
                  "text-2xl md:text-5xl",
                  "whitespace-nowrap",
                  isMounted && "title-jesus-enter"
                )}
                style={{
                  fontFamily: '"RCLVeluxaSerif", serif',
                  backgroundImage:
                    "linear-gradient(180deg, rgba(255, 255, 255, 1) 67%, rgba(200, 200, 255, 0.8) 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  paddingTop: "9px",
                  paddingBottom: "9px",
                }}
              >
                Jesus is Lord
              </div>
              <div
                className={cn(
                  "text-base md:text-4xl",
                  "font-light",
                  "whitespace-nowrap",
                  "text-white",
                  isMounted && "title-luna-enter"
                )}
                style={{
                  fontFamily: '"RCLVeluxaSerif", serif',
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
          {navigationCards.map((card, index) => (
            <Link key={card.href} href={card.href} className="h-full">
              <div
                className={cn(
                  "neumorphism",
                  "p-4 md:p-8",
                  "cursor-pointer",
                  "h-full",
                  "min-h-[140px] md:min-h-0",
                  "flex flex-col",
                  isMounted && "card-enter"
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
                        "object-contain"
                      )}
                    />
                  </div>
                  <h2
                    className={cn(
                      "text-sm md:text-2xl",
                      "font-semibold",
                      "mb-1 md:mb-2",
                      "text-white"
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
        <p className={cn("text-xs md:text-sm", "text-gray-300")}>
          Developed and maintained by{" "}
          <span className={cn("font-semibold", "text-white")}>
            Paolo P. Espero
          </span>
        </p>
      </footer>
    </main>
  );
}
