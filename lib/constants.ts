export interface NavigationCard {
  href: string;
  title: string;
  imageUrl: string;
  alt: string;
}

export const navigationCards: NavigationCard[] = [
  {
    href: "/scanner/login",
    title: "Scanner",
    imageUrl:
      "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-1xM90oqSp9LaGF6Z63GPS7rnUycLEz.png&w=1000&q=75",
    alt: "Scanner",
  },
  {
    href: "/admin/login",
    title: "Admin Dashboard",
    imageUrl:
      "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-fSMgViPMUbS0kVcbqdCIHuTbarLfB5.png&w=1000&q=75",
    alt: "Admin Dashboard",
  },
  {
    href: "/finance/login",
    title: "Financials",
    imageUrl:
      "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-02CCXz1lNDkRWPm2eymmcNv5kHyepe.png&w=1000&q=75",
    alt: "Financials",
  },
  {
    href: "/admin/help",
    title: "Help",
    imageUrl:
      "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-GHLlVvoifSdvzv5ojMTLUf8GOVIeee.png&w=1000&q=75",
    alt: "Help",
  },
];
