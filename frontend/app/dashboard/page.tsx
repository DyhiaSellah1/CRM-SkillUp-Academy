"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

type DashboardData = {
  summary: {
    totalRevenue: number;
    totalLeads: number;
    convertedLeads: number;
    activeLeads: number;
    conversionRate: number;
    totalContacts: number;
    totalCompanies: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  pipeline: {
    id: number;
    label: string;
    order_index: number;
    total: number;
    amount: number;
  }[];
  monthlyRevenue: {
    monthKey: string;
    monthLabel: string;
    revenue: number;
  }[];
  leadsBySource: {
    source: string;
    total: number;
  }[];
  recentActivity: {
    type: string;
    id: number;
    label: string;
    created_at: string;
    meta: string;
  }[];
  topCommercials: {
    id: number;
    full_name: string;
    role: string;
    total_leads: number;
    revenue: number;
  }[];
};

const PIPELINE_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#F97316",
  "#22C55E",
  "#EF4444",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getActivityLabel(type: string) {
  if (type === "lead") return "Lead";
  if (type === "task") return "Tâche";
  return "Activité";
}

function getActivityBadgeClass(type: string) {
  if (type === "lead") return "bg-blue-100 text-blue-700";
  if (type === "task") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/dashboard");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Erreur dashboard");
        }

        setDashboard(data.data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const pipelineChartData = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.pipeline.map((stage, index) => ({
      ...stage,
      fill: PIPELINE_COLORS[index % PIPELINE_COLORS.length],
    }));
  }, [dashboard]);

  const topCommercialsChart = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.topCommercials.map((user) => ({
      name: user.full_name,
      revenue: user.revenue,
    }));
  }, [dashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <p className="text-slate-600 text-lg">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-6">
        <div className="rounded-3xl bg-red-50 p-8 shadow-sm border border-red-200">
          <p className="text-red-700 text-lg font-semibold">Erreur : {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <p className="text-slate-600 text-lg">Aucune donnée disponible.</p>
        </div>
      </div>
    );
  }

  const {
    summary,
    monthlyRevenue,
    pipeline,
    recentActivity,
    topCommercials,
    leadsBySource,
  } = dashboard;

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="mt-2 text-slate-500">
          Vue d’ensemble de votre activité commerciale
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 mb-6">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl">
              €
            </div>
            <span className="text-emerald-600 text-sm font-semibold">+ CA</span>
          </div>
          <p className="text-slate-500 text-sm mt-4">Chiffre d’affaires</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            {formatCurrency(summary.totalRevenue)}
          </h2>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
              👥
            </div>
            <span className="text-blue-600 text-sm font-semibold">Leads</span>
          </div>
          <p className="text-slate-500 text-sm mt-4">Nouveaux prospects</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            {summary.totalLeads}
          </h2>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl">
              %
            </div>
            <span className="text-violet-600 text-sm font-semibold">Conversion</span>
          </div>
          <p className="text-slate-500 text-sm mt-4">Taux de conversion</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            {summary.conversionRate}%
          </h2>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-2xl">
              ⏰
            </div>
            <span className="text-rose-600 text-sm font-semibold">Urgent</span>
          </div>
          <p className="text-slate-500 text-sm mt-4">Tâches en retard</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">
            {summary.overdueTasks}
          </h2>
        </div>
      </div>

      {/* Graph + Donut */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900">Évolution du CA</h3>
            <span className="text-sm text-emerald-600 font-medium">Données réelles</span>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="monthLabel" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "CA"]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={4}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Pipeline commercial
          </h3>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pipelineChartData}
                  dataKey="total"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {pipelineChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-4">
            {pipeline.map((stage, index) => (
              <div key={stage.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        PIPELINE_COLORS[index % PIPELINE_COLORS.length],
                    }}
                  />
                  <span className="text-sm text-slate-700">{stage.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {stage.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity + Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Activités récentes
          </h3>

          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-lg">
                    {item.type === "lead" ? "📌" : "✅"}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.meta || "—"}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getActivityBadgeClass(
                    item.type
                  )}`}
                >
                  {getActivityLabel(item.type)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Performance par commercial
          </h3>

          <div className="h-[260px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCommercialsChart} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  width={100}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "CA"]}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {topCommercials.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b border-slate-100 pb-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{user.full_name}</p>
                  <p className="text-sm text-slate-500">{user.total_leads} leads</p>
                </div>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(user.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sources + mini stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Leads par source
          </h3>

          <div className="space-y-4">
            {leadsBySource.map((item, index) => {
              const max = Math.max(...leadsBySource.map((s) => s.total), 1);
              const width = `${(item.total / max) * 100}%`;

              return (
                <div key={`${item.source}-${index}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {item.source}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.total}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-5">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Résumé rapide
          </h3>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Contacts</p>
              <p className="text-2xl font-bold text-slate-900">
                {summary.totalContacts}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Entreprises</p>
              <p className="text-2xl font-bold text-slate-900">
                {summary.totalCompanies}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Tâches totales</p>
              <p className="text-2xl font-bold text-slate-900">
                {summary.totalTasks}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
              <p className="text-sm text-emerald-700">Tâches terminées</p>
              <p className="text-2xl font-bold text-emerald-700">
                {summary.completedTasks}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}