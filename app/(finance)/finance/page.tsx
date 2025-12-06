import {
  getTithesData,
  getOfferingsData,
  getPledgesData,
} from "@/lib/supabase-server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartFinanceLine } from "@/components/chart-finance-line";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  // Fetch recent tithes, offerings, and pledges for dashboard
  const { tithes: recentTithes } = await getTithesData(1, 5);
  const { offerings: recentOfferings } = await getOfferingsData(1, 5);
  const { pledges: recentPledges } = await getPledgesData(1, 5);

  // Calculate totals
  const tithesTotal = recentTithes.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const offeringsTotal = recentOfferings.reduce(
    (sum, o) => sum + Number(o.amount),
    0
  );
  const pledgesTotal = recentPledges.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
          Financial Dashboard
        </h1>
        <p className="text-xs md:text-base text-muted-foreground mt-1">
          Overview of tithes, offerings, and pledges
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-lg">Total Tithes</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Recent tithes summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-3xl font-bold">
              {formatCurrency(tithesTotal)}
            </div>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-2">
              {recentTithes.length} recent records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-lg">
              Total Offerings
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Recent offerings summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-3xl font-bold">
              {formatCurrency(offeringsTotal)}
            </div>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-2">
              {recentOfferings.length} recent records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-lg">Total Pledges</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Recent pledges summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-3xl font-bold">
              {formatCurrency(pledgesTotal)}
            </div>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 md:mt-2">
              {recentPledges.length} recent records
            </p>
          </CardContent>
        </Card>
      </div>

      <ChartFinanceLine />
    </div>
  );
}
