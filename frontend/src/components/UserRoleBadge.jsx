export default function UserRoleBadge({
  role = "citizen",
  email = "",
}) {
  const normalizedRole = String(
    role
  ).toLowerCase();

  const roleDetails = getRoleDetails(
    normalizedRole
  );

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${roleDetails.background}`}
      >
        {roleDetails.icon}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-white">
            {roleDetails.label}
          </p>

          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${roleDetails.badge}`}
          >
            {roleDetails.label}
          </span>
        </div>

        {email && (
          <p className="mt-1 text-xs text-slate-400">
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

function getRoleDetails(role) {
  if (role === "admin") {
    return {
      label: "Administrator",
      icon: "🛡️",
      background: "bg-red-500/10",
      badge:
        "border-red-500/30 bg-red-500/10 text-red-300",
    };
  }

  if (role === "authority") {
    return {
      label: "Government Authority",
      icon: "🏛️",
      background: "bg-violet-500/10",
      badge:
        "border-violet-500/30 bg-violet-500/10 text-violet-300",
    };
  }

  return {
    label: "Citizen User",
    icon: "👤",
    background: "bg-cyan-500/10",
    badge:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  };
}