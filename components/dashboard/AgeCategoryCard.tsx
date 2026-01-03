import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AgeCategoryCardProps {
  ageCategoryBreakdown: Record<string, number>;
  selectedAgeCategory: string;
  onAgeCategoryChange: (category: string) => void;
}

/**
 * Age Category Card Component
 * Single responsibility: Display and manage age category selection
 */
export function AgeCategoryCard({
  ageCategoryBreakdown,
  selectedAgeCategory,
  onAgeCategoryChange,
}: AgeCategoryCardProps) {
  return (
    <div className="px-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardDescription className="text-xs md:text-sm">
                Age Category
              </CardDescription>
              <CardTitle className="text-lg md:text-3xl font-semibold tabular-nums">
                {ageCategoryBreakdown[
                  selectedAgeCategory as keyof typeof ageCategoryBreakdown
                ] ?? 0}
              </CardTitle>
            </div>
            <Select
              value={selectedAgeCategory}
              onValueChange={onAgeCategoryChange}
            >
              <SelectTrigger className="w-[120px] md:w-[140px] text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
                <SelectItem value="YAN">YAN</SelectItem>
                <SelectItem value="KKB">KKB</SelectItem>
                <SelectItem value="Children">Kids</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
