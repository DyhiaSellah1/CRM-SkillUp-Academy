"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  MoreVertical,
  CalendarDays,
  User,
  Building2,
  X,
} from "lucide-react";

interface PipelineLead {
  id: number;
  title: string;
  amount: number;
  status: string;
  source: string;
  stage_id: number;
  created_at: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface PipelineStage {
  id: number;
  label: string;
  order_index: number;
  leads: PipelineLead[];
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_name?: string;
}

export default function PipelinePage() {
  const [board, setBoard] = useState<PipelineStage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLeadId, setDraggedLeadId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [contactId, setContactId] = useState("");
  const [stageId, setStageId] = useState("");
  const [source, setSource] = useState("Site Web");

  const loadPipeline = async () => {
    try {
      const [boardRes, contactsRes, stagesRes] = await Promise.all([
        fetch("http://localhost:3001/api/pipeline-board"),
        fetch("http://localhost:3001/api/contacts"),
        fetch("http://localhost:3001/api/pipeline-stages"),
      ]);

      const boardData = await boardRes.json();
      const contactsData = await contactsRes.json();
      const stagesData = await stagesRes.json();

      setBoard(boardData);
      setContacts(contactsData);
      setStages(stagesData);
    } catch (err) {
      console.error("Erreur récupération pipeline :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const totalPipeline = useMemo(() => {
    return board.reduce((sum, stage) => {
      return (
        sum +
        stage.leads.reduce((stageSum, lead) => stageSum + Number(lead.amount || 0), 0)
      );
    }, 0);
  }, [board]);

  const wonThisMonth = useMemo(() => {
    const now = new Date();
    return board
      .filter((stage) => stage.label.toLowerCase() === "gagné")
      .flatMap((stage) => stage.leads)
      .filter((lead) => {
        const d = new Date(lead.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, lead) => sum + Number(lead.amount || 0), 0);
  }, [board]);

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return `${f}${l}`.toUpperCase() || "DL";
  };

  const getStageColor = (label: string) => {
    const value = label.toLowerCase();

    if (value.includes("nouveau")) return "bg-blue-500";
    if (value.includes("qualification")) return "bg-amber-500";
    if (value.includes("rendez")) return "bg-violet-500";
    if (value.includes("proposition")) return "bg-purple-500";
    if (value.includes("négociation") || value.includes("negociation")) return "bg-orange-500";
    if (value.includes("gagné") || value.includes("gagne")) return "bg-emerald-500";
    if (value.includes("perdu")) return "bg-red-500";

    return "bg-slate-400";
  };

  const getProbability = (orderIndex: number, totalStages: number) => {
    return Math.min(
      100,
      Math.max(10, Math.round((orderIndex / totalStages) * 100))
    );
  };

  const formatShortDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  };

  const handleDropLead = async (leadId: number, newStageId: number) => {
    const oldBoard = [...board];

    const movedLead = oldBoard
      .flatMap((stage) => stage.leads)
      .find((lead) => lead.id === leadId);

    if (!movedLead) return;

    const updatedBoard = board.map((stage) => ({
      ...stage,
      leads: stage.leads.filter((lead) => lead.id !== leadId),
    }));

    const targetStage = updatedBoard.find((stage) => stage.id === newStageId);
    if (targetStage) {
      targetStage.leads = [{ ...movedLead, stage_id: newStageId }, ...targetStage.leads];
    }

    setBoard(updatedBoard);

    try {
      const res = await fetch(`http://localhost:3001/api/leads/${leadId}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stage_id: newStageId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBoard(oldBoard);
        alert(data.error || "Erreur lors du déplacement du deal");
      }
    } catch (error) {
      console.error(error);
      setBoard(oldBoard);
      alert("Erreur serveur");
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setContactId("");
    setStageId("");
    setSource("Site Web");
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !contactId || !stageId) {
      alert("Titre, contact et étape sont obligatoires.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: amount ? Number(amount) : 0,
          contact_id: Number(contactId),
          stage_id: Number(stageId),
          status: "en cours",
          source,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la création du deal");
        return;
      }

      await loadPipeline();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Pipeline commercial</h1>
          <p className="mt-2 text-base text-slate-500">
            Visualisez et gérez votre funnel de vente
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm text-slate-500">Pipeline total</p>
            <p className="text-3xl font-bold text-slate-900">
              €{totalPipeline.toLocaleString("fr-FR")}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">Gagné ce mois</p>
            <p className="text-3xl font-bold text-emerald-600">
              €{wonThisMonth.toLocaleString("fr-FR")}
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.30)] transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Nouveau deal
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-6">
          {board.map((stage) => {
            const stageAmount = stage.leads.reduce(
              (sum, lead) => sum + Number(lead.amount || 0),
              0
            );

            return (
              <div
                key={stage.id}
                className="w-[320px] shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedLeadId !== null) {
                    handleDropLead(draggedLeadId, stage.id);
                    setDraggedLeadId(null);
                  }
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${getStageColor(stage.label)}`} />
                    <h2 className="text-xl font-semibold text-slate-800">
                      {stage.label}
                    </h2>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                      {stage.leads.length}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-500">
                    €{stageAmount.toLocaleString("fr-FR")}
                  </p>
                </div>

                <div className="space-y-4">
                  {stage.leads.map((lead) => {
                    const probability = getProbability(stage.order_index, board.length);

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggedLeadId(lead.id)}
                        className="cursor-grab rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {lead.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {lead.company_name || "Entreprise non renseignée"}
                            </p>
                          </div>

                          <button className="text-slate-400 hover:text-slate-600">
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-2xl font-bold text-emerald-600">
                            € {Number(lead.amount || 0).toLocaleString("fr-FR")}
                          </p>
                          <p className="text-sm text-slate-500">{probability}%</p>
                        </div>

                        <div className="mb-4 h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${probability}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {formatShortDate(lead.created_at)}
                          </span>

                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {getInitials(lead.first_name, lead.last_name)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => {
                      setStageId(String(stage.id));
                      setShowModal(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-white"
                  >
                    <Plus size={16} />
                    Ajouter un deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <h2 className="text-xl font-semibold text-slate-900">
                Créer un nouveau deal
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
              onSubmit={handleCreateLead}
              className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Titre du deal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Contrat Premium TechCorp"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Contact <span className="text-red-500">*</span>
                </label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Sélectionner un contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Valeur (€)
                </label>
                <input
                  type="number"
                  placeholder="45000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Étape du pipeline <span className="text-red-500">*</span>
                </label>
                <select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  required
                >
                  <option value="">Sélectionner une étape</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="Site Web">Site Web</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Salon">Salon</option>
                  <option value="Email">Email</option>
                  <option value="Google">Google</option>
                  <option value="Partenaire">Partenaire</option>
                  <option value="Conférence">Conférence</option>
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
                  Créer le deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}