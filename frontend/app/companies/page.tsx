"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Building2,
  MapPin,
  Globe,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

interface Company {
  id: number;
  name: string;
  industry: string;
  city: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employees, setEmployees] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [revenue, setRevenue] = useState("");

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const loadCompanies = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/companies");
      const data = await res.json();
      setCompanies(data);
    } catch (err) {
      console.error("Erreur récupération entreprises :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return companies.filter((company) => {
      return (
        company.name.toLowerCase().includes(term) ||
        company.industry.toLowerCase().includes(term) ||
        company.city.toLowerCase().includes(term)
      );
    });
  }, [companies, search]);

  const getInitials = (companyName: string) => {
    return companyName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getWebsite = (companyName: string) => {
    return `${companyName.toLowerCase().replace(/\s+/g, "")}.com`;
  };

  const getEmployeesCount = (id: number) => {
    return 20 + id * 15;
  };

  const getAnnualRevenue = (id: number) => {
    return 5 + id * 3;
  };

  const getContactsCount = (id: number) => {
    return 2 + id * 2;
  };

  const resetForm = () => {
    setName("");
    setIndustry("");
    setEmployees("");
    setCity("");
    setWebsite("");
    setRevenue("");
    setEditingCompanyId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompanyId(company.id);
    setName(company.name);
    setIndustry(company.industry);
    setCity(company.city);
    setEmployees("");
    setWebsite("");
    setRevenue("");
    setOpenMenuId(null);
    setShowModal(true);
  };

  const handleDeleteCompany = async (companyId: number) => {
    const ok = confirm("Voulez-vous vraiment supprimer cette entreprise ?");
    if (!ok) return;

    try {
      const res = await fetch(`http://localhost:3001/api/companies/${companyId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la suppression de l'entreprise");
        return;
      }

      setCompanies((prev) => prev.filter((company) => company.id !== companyId));
      setOpenMenuId(null);
    } catch (error) {
      console.error(error);
      alert("Erreur serveur");
    }
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !industry.trim() || !city.trim()) {
      alert("Les champs nom, secteur d'activité et localisation sont obligatoires.");
      return;
    }

    const payload = {
      name: name.trim(),
      industry: industry.trim(),
      city: city.trim(),
    };

    try {
      if (editingCompanyId !== null) {
        const res = await fetch(
          `http://localhost:3001/api/companies/${editingCompanyId}`,
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
          alert(data.error || "Erreur lors de la modification de l'entreprise");
          return;
        }

        setCompanies((prev) =>
          prev.map((company) =>
            company.id === editingCompanyId ? { ...company, ...data } : company
          )
        );
      } else {
        const res = await fetch("http://localhost:3001/api/companies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Erreur lors de la création de l'entreprise");
          return;
        }

        setCompanies((prev) => [data, ...prev]);
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
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Entreprises</h1>
          <p className="mt-2 text-base text-slate-500">
            Gérez vos partenaires et clients entreprise
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.30)] transition hover:bg-emerald-700"
        >
          + Nouvelle entreprise
        </button>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition hover:bg-emerald-200"
          >
            <Building2 size={18} />
          </button>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 font-bold text-white">
                  {getInitials(company.name)}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {company.name}
                  </h3>
                  <p className="text-sm text-slate-500">{company.industry}</p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === company.id ? null : company.id);
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === company.id && (
                  <div
                    className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleEditCompany(company)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil size={15} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCompany(company.id)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span>{company.city}</span>
              </div>

              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-400" />
                <span>{getWebsite(company.name)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={16} className="text-slate-400" />
                <span>{getEmployeesCount(company.id)} employés</span>
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-sm">
              <div>
                <p className="text-slate-400">CA Annuel</p>
                <p className="font-semibold text-slate-900">
                  €{getAnnualRevenue(company.id)}M
                </p>
              </div>

              <div className="text-right">
                <p className="text-slate-400">Contacts</p>
                <p className="font-semibold text-emerald-600">
                  {getContactsCount(company.id)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
          Aucune entreprise trouvée.
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCompanyId !== null
                  ? "Modifier l'entreprise"
                  : "Nouvelle entreprise"}
              </h2>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmitCompany}
              className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2"
            >
              <div>
                <label className="text-sm font-medium">
                  Nom de l&apos;entreprise *
                </label>
                <input
                  type="text"
                  placeholder="TechCorp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Secteur d&apos;activité *
                </label>
                <input
                  type="text"
                  placeholder="Technologie"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Nombre d&apos;employés
                </label>
                <input
                  type="number"
                  placeholder="250"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Localisation *</label>
                <input
                  type="text"
                  placeholder="Paris, France"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Site web</label>
                <input
                  type="text"
                  placeholder="techcorp.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Chiffre d&apos;affaires annuel
                </label>
                <input
                  type="text"
                  placeholder="€50M"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 text-sm"
                />
              </div>

              <div className="col-span-2 mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="rounded-xl border px-6 py-3 text-sm"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingCompanyId !== null
                    ? "Enregistrer"
                    : "Créer l'entreprise"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}