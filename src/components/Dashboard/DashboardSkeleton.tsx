export const DashboardSkeleton = () => (
  <div className="p-4 lg:p-8 space-y-6 min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-24 bg-bw-900 rounded-xl animate-pulse backdrop-blur-sm"
        ></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-72 bg-bw-900 rounded-xl animate-pulse backdrop-blur-sm"
        ></div>
      ))}
    </div>
  </div>
);
