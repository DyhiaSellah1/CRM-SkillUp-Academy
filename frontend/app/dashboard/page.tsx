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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`);
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
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-lg text-slate-600">Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] p-6">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 shadow-sm">
                    <p className="text-lg font-semibold text-red-700">Erreur : {error}</p>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="min-h-screen bg-[#f5f7fb] p-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-lg text-slate-600">Aucune donnée disponible.</p>
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

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                            €
                        </div>
                        <span className="text-sm font-semibold text-emerald-600">+ CA</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Chiffre d’affaires</p>
                    <h2 className="mt-1 text-3xl font-bold text-slate-900">
                        {formatCurrency(summary.totalRevenue)}
                    </h2>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                            👥
                        </div>
                        <span className="text-sm font-semibold text-blue-600">Leads</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Nouveaux prospects</p>
                    <h2 className="mt-1 text-3xl font-bold text-slate-900">
                        {summary.totalLeads}
                    </h2>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
                            %
                        </div>
                        <span className="text-sm font-semibold text-violet-600">
              Conversion
            </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Taux de conversion</p>
                    <h2 className="mt-1 text-3xl font-bold text-slate-900">
                        {summary.conversionRate}%
                    </h2>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                            ⏰
                        </div>
                        <span className="text-sm font-semibold text-rose-600">Urgent</span>
                    </div>
                    <p className="mt-4 text-sm text-slate-500">Tâches en retard</p>
                    <h2 className="mt-1 text-3xl font-bold text-slate-900">
                        {summary.overdueTasks}
                    </h2>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-slate-900">
                            Évolution du CA
                        </h3>
                        <span className="text-sm font-medium text-emerald-600">
              Données réelles
            </span>
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

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">
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

                    <div className="mt-4 space-y-3">
                        {pipeline.map((stage, index) => (
                            <div key={stage.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                  <span
                      className="h-3 w-3 rounded-full"
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

            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">
                        Activités récentes
                    </h3>

                    <div className="space-y-4">
                        {recentActivity.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                                        {item.type === "lead" ? " " : " "}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{item.label}</p>
                                        <p className="text-sm text-slate-500">{item.meta || "—"}</p>
                                    </div>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getActivityBadgeClass(
                                        item.type
                                    )}`}
                                >
                  {getActivityLabel(item.type)}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">
                        Performance par commercial
                    </h3>

                    <div className="mb-4 h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={topCommercialsChart}
                                layout="vertical"
                                margin={{ left: 20 }}
                            >
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
                                <Bar
                                    dataKey="revenue"
                                    fill="#10B981"
                                    radius={[0, 10, 10, 0]}
                                />
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
                                    <p className="text-sm text-slate-500">
                                        {user.total_leads} leads
                                    </p>
                                </div>
                                <span className="font-semibold text-emerald-600">
                  {formatCurrency(user.revenue)}
                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">
                        Leads par source
                    </h3>

                    <div className="space-y-4">
                        {leadsBySource.map((item, index) => {
                            const max = Math.max(...leadsBySource.map((s) => s.total), 1);
                            const width = `${(item.total / max) * 100}%`;

                            return (
                                <div key={`${item.source}-${index}`}>
                                    <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {item.source}
                    </span>
                                        <span className="text-sm font-semibold text-slate-900">
                      {item.total}
                    </span>
                                    </div>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
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

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-xl font-semibold text-slate-900">
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

                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
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