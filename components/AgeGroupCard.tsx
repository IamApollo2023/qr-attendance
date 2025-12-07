"use client";

interface AgeGroupCardProps {
  ageGroup: {
    key: string;
    name: string;
  };
}

export function AgeGroupCard({ ageGroup }: AgeGroupCardProps) {
  return (
    <div className="group relative flex items-center justify-center bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 w-full min-h-[120px] md:min-h-[150px]">
      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        {ageGroup.name}
      </h3>
    </div>
  );
}
