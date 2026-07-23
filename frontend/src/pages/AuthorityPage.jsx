import useUserRole from "../hooks/useUserRole";
import CriticalReportsPanel from "../components/CriticalReportsPanel";
import AuthorityActionCenter from "../components/AuthorityActionCenter";
import AdminReportManagement from "../components/AdminReportManagement";

export default function AuthorityPage() {
  const {
    isAuthority,
    isAdmin,
    loadingRole,
  } = useUserRole();

  if (loadingRole) {
    return (
      <p className="text-slate-400">
        Checking access...
      </p>
    );
  }

  if (!isAuthority) {
    return (
      <section className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <h2 className="text-xl font-bold text-red-300">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-slate-300">
          Ee page Authority and Admin users kosam matrame.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
          Protected Management Area
        </p>

        <h2 className="mt-2 text-3xl font-bold text-white">
          Authority Control Panel
        </h2>
      </div>

      <CriticalReportsPanel />

      <AuthorityActionCenter />

      {isAdmin && <AdminReportManagement />}
    </div>
  );
}