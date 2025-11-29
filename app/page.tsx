import Link from "next/link";
import Image from "next/image";
import { QrCode, BarChart3, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="rounded-full"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Jesus is Lord Luna
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            QR Code Attendance
          </h2>
          <p className="text-gray-600 text-lg md:text-xl">
            Choose your access type
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Scanner Card */}
          <Link href="/scanner/login">
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="bg-blue-50 p-6 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <QrCode className="w-16 h-16 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Scanner
                </h2>
                <p className="text-gray-600 text-sm md:text-base mb-4">
                  Scan QR codes to record attendance
                </p>
                <div className="inline-flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                  Access Scanner
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Admin Dashboard Card */}
          <Link href="/admin/login">
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="bg-purple-50 p-6 rounded-xl group-hover:bg-purple-100 transition-colors">
                    <BarChart3 className="w-16 h-16 text-purple-600" />
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 text-sm md:text-base mb-4">
                  View and manage attendance records
                </p>
                <div className="inline-flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors">
                  Access Dashboard
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
