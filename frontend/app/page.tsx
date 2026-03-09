"use client";

import { useEffect, useState } from "react";
import { Users, Target, TrendingUp, CheckSquare } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    contacts: 0,
    leads: 0,
    revenue: 0,
    tasks: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [contactsRes, leadsRes, tasksRes] = await Promise.all([
          fetch("http://localhost:3001/api/contacts"),
          fetch("http://localhost:3001/api/leads"),
          fetch("http://localhost:3001/api/tasks"),
        ]);

        const contacts = contactsRes.ok ? await contactsRes.json() : [];
        const leads = leadsRes.ok ? await leadsRes.json() : [];
        const tasks = tasksRes.ok ? await tasksRes.json() : [];

        const revenue = Array.isArray(leads)
          ? leads.reduce((sum: number, lead: any) => sum + Number(lead.amount || 0), 0)
          : 0;

        setStats({
          contacts: Array.isArray(contacts) ? contacts.length : 0,
          leads: Array.isArray(leads) ? leads.length : 0,
          revenue,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
        });
      } catch (error) {
        console.error("Erreur chargement dashboard :", error);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-slate-500">Vue d’ensemble du CRM</p>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-blue-50 p-3">
              <Users className="text-blue-600" size={22} />
            </div>
            <span className="text-xs font-medium text-slate-500">Contacts</span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-bold">{stats.contacts}</p>
            <p className="text-sm text-slate-500 mt-1">Base contacts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-orange-50 p-3">
              <Target className="text-orange-500" size={22} />
            </div>
            <span className="text-xs font-medium text-slate-500">Leads</span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-bold">{stats.leads}</p>
            <p className="text-sm text-slate-500 mt-1">Opportunités</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-green-50 p-3">
              <TrendingUp className="text-green-600" size={22} />
            </div>
            <span className="text-xs font-medium text-slate-500">CA estimé</span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-bold">{stats.revenue} €</p>
            <p className="text-sm text-slate-500 mt-1">Montant cumulé</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-purple-50 p-3">
              <CheckSquare className="text-purple-600" size={22} />
            </div>
            <span className="text-xs font-medium text-slate-500">Tâches</span>
          </div>
          <div className="mt-5">
            <p className="text-3xl font-bold">{stats.tasks}</p>
            <p className="text-sm text-slate-500 mt-1">Actions à suivre</p>
          </div>
        </div>
      </div>
    </div>
  );
}