export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>

      <div className="flex gap-3 flex-wrap">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg" />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="h-10 w-full bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}


