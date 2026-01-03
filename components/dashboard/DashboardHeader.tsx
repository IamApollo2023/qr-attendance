/**
 * Dashboard Header Component
 * Single responsibility: Display dashboard title and description
 */
export function DashboardHeader() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg md:text-3xl font-semibold tracking-tight">
          Attendance analytics
        </h1>
        <p className="text-xs md:text-base text-muted-foreground">
          High-level overview of QR attendance trends.
        </p>
      </div>
    </div>
  );
}
