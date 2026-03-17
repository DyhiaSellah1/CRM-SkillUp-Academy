"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Search,
    CalendarDays,
    CheckCircle2,
    Circle,
    AlertCircle,
    MoreVertical,
    Plus,
    X,
    Pencil,
    Trash2,
} from "lucide-react";

interface Task {
    id: number;
    lead_id: number;
    title: string;
    due_date: string | null;
    is_completed: boolean;
    priority?: string;
    lead_title?: string;
}

interface Lead {
    id: number;
    title: string;
}

type FilterType =
    | "toutes"
    | "en_attente"
    | "en_cours"
    | "terminees"
    | "priorite_haute";

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("toutes");

    const [showModal, setShowModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

    const [title, setTitle] = useState("");
    const [leadId, setLeadId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("moyenne");

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            const [tasksRes, leadsRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`),
            ]);

            const tasksData = await tasksRes.json();
            const leadsData = await leadsRes.json();

            setTasks(tasksData);
            setLeads(leadsData);
        } catch (err) {
            console.error("Erreur récupération tâches :", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const closeMenu = () => setOpenMenuId(null);
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    const now = new Date();

    const getTaskCategory = (task: Task) => {
        if (task.is_completed) return "terminees";
        if (task.priority === "haute") return "priorite_haute";
        if (!task.due_date) return "en_attente";

        const due = new Date(task.due_date);
        const diffMs = due.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours <= 72) return "en_cours";
        return "en_attente";
    };

    const filteredTasks = useMemo(() => {
        const term = search.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesSearch =
                (task.title || "").toLowerCase().includes(term) ||
                (task.lead_title || "").toLowerCase().includes(term) ||
                (task.priority || "").toLowerCase().includes(term);

            const category = getTaskCategory(task);
            const matchesFilter =
                activeFilter === "toutes" ? true : category === activeFilter;

            return matchesSearch && matchesFilter;
        });
    }, [tasks, search, activeFilter]);

    const totalCount = tasks.length;
    const waitingCount = tasks.filter(
        (task) => getTaskCategory(task) === "en_attente"
    ).length;
    const inProgressCount = tasks.filter(
        (task) => getTaskCategory(task) === "en_cours"
    ).length;
    const highPriorityCount = tasks.filter(
        (task) => getTaskCategory(task) === "priorite_haute"
    ).length;

    const formatDate = (value: string | null) => {
        if (!value) return "Date non définie";

        const date = new Date(value);
        return date.toLocaleString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getBadge = (task: Task) => {
        if (task.is_completed) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 size={14} />
          Terminée
        </span>
            );
        }

        if (task.priority === "haute") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          <AlertCircle size={14} />
          Haute
        </span>
            );
        }

        if (getTaskCategory(task) === "en_cours") {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          <AlertCircle size={14} />
          En cours
        </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
        <Circle size={12} />
        En attente
      </span>
        );
    };

    const resetForm = () => {
        setTitle("");
        setLeadId("");
        setDueDate("");
        setPriority("moyenne");
        setEditingTaskId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTaskId(task.id);
        setTitle(task.title || "");
        setLeadId(String(task.lead_id));
        setDueDate(
            task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ""
        );
        setPriority(task.priority || "moyenne");
        setOpenMenuId(null);
        setShowModal(true);
    };

    const handleSubmitTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !leadId) {
            alert("Le titre et le lead sont obligatoires.");
            return;
        }

        const payload = {
            lead_id: Number(leadId),
            title: title.trim(),
            due_date: dueDate ? new Date(dueDate).toISOString() : null,
            priority,
        };

        try {
            const selectedLead = leads.find((lead) => lead.id === Number(leadId));

            if (editingTaskId !== null) {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editingTaskId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    alert(data.error || "Erreur lors de la modification de la tâche");
                    return;
                }

                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === editingTaskId
                            ? {
                                ...task,
                                ...data,
                                lead_title: selectedLead?.title || `#${leadId}`,
                            }
                            : task
                    )
                );
            } else {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    alert(data.error || "Erreur lors de la création de la tâche");
                    return;
                }

                setTasks((prev) => [
                    {
                        ...data,
                        priority,
                        lead_title: selectedLead?.title || `#${leadId}`,
                    },
                    ...prev,
                ]);
            }

            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    };

    const handleToggleTask = async (taskId: number) => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/toggle`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Erreur lors de la mise à jour de la tâche");
                return;
            }

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === taskId
                        ? {
                            ...task,
                            is_completed: data.is_completed,
                        }
                        : task
                )
            );
        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    };

    const handleDeleteTask = async (taskId: number) => {
        const ok = confirm("Voulez-vous vraiment supprimer cette tâche ?");
        if (!ok) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Erreur suppression");
                return;
            }

            setTasks((prev) => prev.filter((task) => task.id !== taskId));
            setOpenMenuId(null);
        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    };

    if (loading) {
        return <div className="p-8">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] p-4 py-6">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Tâches</h1>
                    <p className="mt-2 text-base text-slate-500">
                        Suivi des tâches depuis la base de données
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.30)] transition hover:bg-emerald-700"
                >
                    <Plus size={18} />
                    Nouvelle tâche
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                    <p className="text-slate-500">Total</p>
                    <p className="mt-2 text-4xl font-bold text-slate-900">{totalCount}</p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                    <p className="text-slate-500">En attente</p>
                    <p className="mt-2 text-4xl font-bold text-amber-600">
                        {waitingCount}
                    </p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                    <p className="text-slate-500">En cours</p>
                    <p className="mt-2 text-4xl font-bold text-blue-600">
                        {inProgressCount}
                    </p>
                </div>

                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                    <p className="text-slate-500">Priorité haute</p>
                    <p className="mt-2 text-4xl font-bold text-red-600">
                        {highPriorityCount}
                    </p>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    onClick={() => setActiveFilter("toutes")}
                    className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                        activeFilter === "toutes"
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    Toutes
                </button>

                <button
                    onClick={() => setActiveFilter("en_attente")}
                    className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                        activeFilter === "en_attente"
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    En attente
                </button>

                <button
                    onClick={() => setActiveFilter("en_cours")}
                    className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                        activeFilter === "en_cours"
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    En cours
                </button>

                <button
                    onClick={() => setActiveFilter("terminees")}
                    className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                        activeFilter === "terminees"
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    Terminées
                </button>

                <button
                    onClick={() => setActiveFilter("priorite_haute")}
                    className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
                        activeFilter === "priorite_haute"
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700"
                    }`}
                >
                    Priorité haute
                </button>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="relative w-full">
                        <Search
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Rechercher dans les tâches..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-100">
                    {filteredTasks.map((task) => (
                        <div
                            key={task.id}
                            className={`flex items-start justify-between gap-6 border-t border-slate-100 px-6 py-5 transition hover:bg-slate-50 ${
                                task.is_completed ? "opacity-70" : ""
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleToggleTask(task.id)}
                                    className="pt-1 transition hover:scale-105"
                                    title={
                                        task.is_completed
                                            ? "Marquer comme non terminée"
                                            : "Marquer comme terminée"
                                    }
                                >
                                    {task.is_completed ? (
                                        <CheckCircle2 className="text-emerald-500" size={24} />
                                    ) : (
                                        <Circle
                                            className="text-slate-300 hover:text-emerald-500"
                                            size={24}
                                        />
                                    )}
                                </button>

                                <div>
                                    <h3
                                        className={`text-sm font-semibold ${
                                            task.is_completed
                                                ? "text-slate-400 line-through"
                                                : "text-slate-900"
                                        }`}
                                    >
                                        {task.title}
                                    </h3>

                                    <p className="text-xs text-slate-500">
                                        Lié au lead : {task.lead_title || `#${task.lead_id}`}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={15} />
                        {formatDate(task.due_date)}
                    </span>

                                        {getBadge(task)}

                                        {task.priority && (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        Priorité : {task.priority}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(openMenuId === task.id ? null : task.id);
                                    }}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {openMenuId === task.id && (
                                    <div
                                        className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleEditTask(task)}
                                            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                        >
                                            <Pencil size={15} />
                                            Modifier
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={15} />
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredTasks.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            Aucune tâche trouvée.
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <h2 className="text-lg font-semibold text-slate-900">
                                {editingTaskId !== null ? "Modifier la tâche" : "Nouvelle tâche"}
                            </h2>

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmitTask}
                            className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
                        >
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Titre de la tâche <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Appeler le prospect pour qualification"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Lead lié <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={leadId}
                                    onChange={(e) => setLeadId(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                    required
                                >
                                    <option value="">Sélectionner un lead</option>
                                    {leads.map((lead) => (
                                        <option key={lead.id} value={lead.id}>
                                            {lead.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Date et heure d&apos;échéance
                                </label>
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-600">
                                    Priorité
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="mineure">Mineure</option>
                                    <option value="moyenne">Moyenne</option>
                                    <option value="haute">Haute</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                                >
                                    {editingTaskId !== null ? "Enregistrer" : "Créer la tâche"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}