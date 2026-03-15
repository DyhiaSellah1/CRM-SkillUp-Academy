"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MoreVertical,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

interface Lead {
  id: number;
  title: string;
  amount: number;
  contact_id: number;
  stage_id: number | null;
  status: string;
  source: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  stage_label?: string;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface PipelineStage {
  id: number;
  label: string;
  order_index: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [contactId, setContactId] = useState("");
  const [stageId, setStageId] = useState("");
  const [status, setStatus] = useState("en cours");
  const [source, setSource] = useState("Site Web");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [leadsRes, contactsRes, stagesRes] = await Promise.all([
        fetch("http://localhost:3001/api/leads"),
        fetch("http://localhost:3001/api/contacts"),
        fetch("http://localhost:3001/api/pipeline-stages"),
      ]);

      const leadsData = await leadsRes.json();
      const contactsData = await contactsRes.json();
      const stagesData = await stagesRes.json();

      setLeads(leadsData);
      setContacts(contactsData);
      setStages(stagesData);
    } catch (err) {
      console.error("Erreur récupération leads :", err);
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

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const contactName =
        `${lead.first_name || ""} ${lead.last_name || ""}`.toLowerCase();

      return (
        lead.title.toLowerCase().includes(term) ||
        contactName.includes(term) ||
        (lead.status || "").toLowerCase().includes(term) ||
        (lead.source || "").toLowerCase().includes(term) ||
        (lead.stage_label || "").toLowerCase().includes(term)
      );
    });
  }, [leads, search]);

  const totalEnCours = leads.filter((lead) => lead.status === "en cours").length;
  const totalConverti = leads.filter((lead) => lead.status === "converti").length;
  const totalPerdu = leads.filter((lead) => lead.status === "perdu").length;
  const totalNouveau = leads.filter((lead) => lead.status === "nouveau").length;

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return `${f}${l}`.toUpperCase() || "LD";
  };

  const getStatusBadge = (value: string) => {
    switch (value) {
      case "nouveau":
        return "bg-blue-100 text-blue-600";
      case "en cours":
        return "bg-orange-100 text-orange-600";
      case "converti":
        return "bg-emerald-100 text-emerald-600";
      case "perdu":
        return "bg-red-100 text-red-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setContactId("");
    setStageId("");
    setStatus("en cours");
    setSource("Site Web");
    setEditingLeadId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setTitle(lead.title);
    setAmount(String(lead.amount ?? ""));
    setContactId(String(lead.contact_id));
    setStageId(lead.stage_id ? String(lead.stage_id) : "");
    setStatus(lead.status);
    setSource(lead.source || "Site Web");
    setOpenMenuId(null);
    setShowModal(true);
  };

  const handleDeleteLead = async (leadId: number) => {
    const ok = confirm("Voulez-vous vraiment supprimer ce lead ?");
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:3001/api/leads/${leadId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la suppression du lead");
        return;
      }

      setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !contactId) {
      alert("Le titre et le contact sont obligatoires.");
      return;
    }

    const payload = {
      title: title.trim(),
      amount: amount ? Number(amount) : 0,
      contact_id: Number(contactId),
      stage_id: stageId ? Number(stageId) : null,
      status,
      source,
    };

    try {
      if (editingLeadId !== null) {
        const res = await fetch(`http://localhost:3001/api/leads/${editingLeadId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erreur lors de la modification du lead");
          return;
        }

        const selectedContact = contacts.find((c) => c.id === Number(contactId));
        const selectedStage = stages.find((s) => s.id === Number(stageId));

        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === editingLeadId
              ? {
                  ...lead,
                  ...data,
                  first_name: selectedContact?.first_name,
                  last_name: selectedContact?.last_name,
                  stage_label: selectedStage?.label,
                }
              : lead
          )
        );
      } else {
        const res = await fetch("http://localhost:3001/api/leads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erreur lors de la création du lead");
          return;
        }

        const selectedContact = contacts.find((c) => c.id === Number(contactId));
        const selectedStage = stages.find((s) => s.id === Number(stageId));

        setLeads((prev) => [
          {
            ...data,
            first_name: selectedContact?.first_name,
            last_name: selectedContact?.last_name,
            stage_label: selectedStage?.label,
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

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] px-6 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Leads</h1>
          <p className="mt-2 text-base text-slate-500">
            Suivi des prospects depuis la base de données
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.30)] transition hover:bg-emerald-700"
        >
          + Nouveau lead
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="text-slate-500">Nouveaux</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{totalNouveau}</p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="text-slate-500">En cours</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{totalEnCours}</p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="text-slate-500">Convertis</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{totalConverti}</p>
        </div>

        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <p className="text-slate-500">Perdus</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{totalPerdu}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Rechercher un lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-white">
                  {getInitials(lead.first_name, lead.last_name)}
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <p className="text-base font-semibold text-slate-900">
                      {lead.title}
                    </p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500">
                    {lead.first_name} {lead.last_name}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-6 text-sm text-slate-500">
                    <span>Étape : {lead.stage_label || "Non définie"}</span>
                    <span>Source : {lead.source}</span>
                    <span>
                      Créé le : {new Date(lead.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === lead.id ? null : lead.id);
                    }}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === lead.id && (
                    <div
                      className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleEditLead(lead)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil size={15} />
                        Modifier
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLead(lead.id)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 pl-14">
                <div>
                  <p className="text-xs text-slate-400">Montant</p>
                  <p className="font-semibold text-slate-800">
                    €{Number(lead.amount || 0).toLocaleString("fr-FR")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">ID Lead</p>
                  <p className="font-semibold text-slate-800">#{lead.id}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">ID Contact</p>
                  <p className="font-semibold text-slate-800">{lead.contact_id}</p>
                </div>
              </div>
            </div>
          ))}

          {filteredLeads.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Aucun lead trouvé.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
              <h2 className="text-xl font-bold text-slate-900">
                {editingLeadId !== null ? "Modifier le lead" : "Nouveau lead"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={28} />
              </button>
            </div>

            <form
              onSubmit={handleSubmitLead}
              className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Titre du lead
                </label>
                <input
                  type="text"
                  placeholder="Ex: Formation conformité AMF"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Montant estimé
                </label>
                <input
                  type="number"
                  placeholder="15000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Contact
                </label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-emerald-500"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Étape pipeline
                </label>
                <select
                  value={stageId}
                  onChange={(e) => setStageId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-emerald-500"
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
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-emerald-500"
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Statut
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-emerald-500"
                >
                  <option value="nouveau">Nouveau</option>
                  <option value="en cours">En cours</option>
                  <option value="converti">Converti</option>
                  <option value="perdu">Perdu</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-2xl border border-slate-200 px-6 py-3 text-slate-700"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
                >
                  {editingLeadId !== null ? "Enregistrer" : "Créer le lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}