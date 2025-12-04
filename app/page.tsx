import Link from "next/link";
import Image from "next/image";
import { QrCode, BarChart3, DollarSign, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8 md:mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="rounded-full w-20 h-20 md:w-[120px] md:h-[120px]"
              priority
            />
          </div>
          <h1 className="text-lg md:text-4xl font-bold text-gray-900 mb-2">
            Jesus is Lord Luna
          </h1>
          <p className="text-gray-600 text-xs md:text-xl">
            An Automated QR Code-Based Attendance Management System for Jesus is
            Lord Luna
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-8 items-stretch">
          {/* Scanner Card */}
          <Link href="/scanner/login" className="h-full">
            <div className="bg-white rounded-xl p-4 md:p-12 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col">
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-6 flex justify-center">
                  <div className="bg-blue-50 p-3 md:p-6 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <QrCode className="w-8 h-8 md:w-16 md:h-16 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-sm md:text-3xl font-bold text-gray-900 mb-1 md:mb-3">
                  Scanner
                </h2>
                <p className="text-gray-600 text-[10px] md:text-base leading-tight">
                  Scan QR codes to record attendance
                </p>
              </div>
            </div>
          </Link>

          {/* Admin Dashboard Card */}
          <Link href="/admin/login" className="h-full">
            <div className="bg-white rounded-xl p-4 md:p-12 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col">
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-6 flex justify-center">
                  <div className="bg-blue-50 p-3 md:p-6 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <BarChart3 className="w-8 h-8 md:w-16 md:h-16 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-sm md:text-3xl font-bold text-gray-900 mb-1 md:mb-3">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 text-[10px] md:text-base leading-tight">
                  View and manage attendance records
                </p>
              </div>
            </div>
          </Link>

          {/* Financials Card */}
          <Link href="/admin/login" className="h-full">
            <div className="bg-white rounded-xl p-4 md:p-12 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col">
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-6 flex justify-center">
                  <div className="bg-blue-50 p-3 md:p-6 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <DollarSign className="w-8 h-8 md:w-16 md:h-16 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-sm md:text-3xl font-bold text-gray-900 mb-1 md:mb-3">
                  Financials
                </h2>
                <p className="text-gray-600 text-[10px] md:text-base leading-tight">
                  Manage financial records and transactions
                </p>
              </div>
            </div>
          </Link>

          {/* Help Card */}
          <Link href="/admin/help" className="h-full">
            <div className="bg-white rounded-xl p-4 md:p-12 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group h-full flex flex-col">
              <div className="text-center flex-1 flex flex-col justify-center">
                <div className="mb-3 md:mb-6 flex justify-center">
                  <div className="bg-blue-50 p-3 md:p-6 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <HelpCircle className="w-8 h-8 md:w-16 md:h-16 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-sm md:text-3xl font-bold text-gray-900 mb-1 md:mb-3">
                  Help
                </h2>
                <p className="text-gray-600 text-[10px] md:text-base leading-tight">
                  Get support and documentation
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
