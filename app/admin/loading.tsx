export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>

        <div className="flex gap-3 flex-wrap mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
