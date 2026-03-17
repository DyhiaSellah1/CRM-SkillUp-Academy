"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    MoreVertical,
    Pencil,
    Trash2,
} from "lucide-react";

interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    company_id?: number | null;
    company_name?: string;
}

interface Company {
    id: number;
    name: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingContactId, setEditingContactId] = useState<number | null>(null);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [companyId, setCompanyId] = useState("");

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const loadData = async () => {
        try {
            const [contactsRes, companiesRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`),
            ]);

            const contactsData = await contactsRes.json();
            const companiesData = await companiesRes.json();

            setContacts(contactsData);
            setCompanies(companiesData);
        } catch (err) {
            console.error("Erreur récupération données :", err);
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

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setCompanyId("");
        setEditingContactId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEditContact = (contact: Contact) => {
        setEditingContactId(contact.id);
        setFirstName(contact.first_name);
        setLastName(contact.last_name);
        setEmail(contact.email || "");
        setCompanyId(contact.company_id ? String(contact.company_id) : "");
        setOpenMenuId(null);
        setShowModal(true);
    };

    const handleDeleteContact = async (contactId: number) => {
        const ok = confirm("Voulez-vous vraiment supprimer ce contact ?");
        if (!ok) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${contactId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Erreur lors de la suppression du contact");
                return;
            }

            setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
            setOpenMenuId(null);
        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    };

    const handleSubmitContact = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            alert("Prénom, nom et email sont obligatoires.");
            return;
        }

        const selectedCompany = companies.find(
            (company) => company.id === Number(companyId)
        );

        const payload = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            company_id: companyId ? Number(companyId) : null,
        };

        try {
            if (editingContactId !== null) {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${editingContactId}`,
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
                    alert(data.error || "Erreur lors de la modification du contact");
                    return;
                }

                const updatedContact = data.contact || data;

                setContacts((prev) =>
                    prev.map((contact) =>
                        contact.id === editingContactId
                            ? {
                                ...contact,
                                ...updatedContact,
                                company_name: selectedCompany?.name || "—",
                            }
                            : contact
                    )
                );
            } else {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/contacts`,
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
                    alert(data.error || "Erreur lors de la création du contact");
                    return;
                }

                const newContact = data.contact || data;

                setContacts((prev) => [
                    {
                        ...newContact,
                        company_name: selectedCompany?.name || "—",
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

    const filteredContacts = useMemo(() => {
        const term = search.trim().toLowerCase();

        return contacts.filter((contact) => {
            const fullName =
                `${contact.first_name || ""} ${contact.last_name || ""}`.toLowerCase();
            const emailValue = (contact.email || "").toLowerCase();
            const companyValue = (contact.company_name || "").toLowerCase();

            return (
                !term ||
                fullName.includes(term) ||
                emailValue.includes(term) ||
                companyValue.includes(term)
            );
        });
    }, [contacts, search]);

    if (loading) {
        return <div className="p-8">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900">Contacts</h1>
                    <p className="mt-2 text-base text-slate-500">
                        Gérez vos contacts et prospects
                    </p>
                </div>

                <button
                    onClick={openCreateModal}
                    className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.30)] transition hover:bg-emerald-700"
                >
                    + Nouveau contact
                </button>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row">
                    <div className="relative flex-1">
                        <Search
                            size={20}
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Rechercher un contact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                        >
                            <SlidersHorizontal size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Entreprise</th>
                            <th className="p-4">Email</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {filteredContacts.map((contact, index) => (
                            <tr
                                key={contact.id || index}
                                className="border-t border-slate-100 transition hover:bg-slate-50"
                            >
                                <td className="p-4 text-sm font-semibold text-slate-800">
                                    {contact.first_name} {contact.last_name}
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {contact.company_name || "—"}
                                </td>
                                <td className="p-4 text-sm text-slate-600">
                                    {contact.email || "—"}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end">
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(
                                                        openMenuId === contact.id ? null : contact.id
                                                    );
                                                }}
                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenuId === contact.id && (
                                                <div
                                                    className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditContact(contact)}
                                                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                                                    >
                                                        <Pencil size={15} />
                                                        Modifier
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteContact(contact.id)}
                                                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={15} />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {filteredContacts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-8 text-center text-sm text-slate-500"
                                >
                                    Aucun contact trouvé.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <h2 className="text-xl font-bold text-slate-900">
                                {editingContactId !== null
                                    ? "Modifier le contact"
                                    : "Nouveau contact"}
                            </h2>

                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-2xl text-slate-400 hover:text-slate-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmitContact} className="p-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Prénom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Jean"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Nom <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Dupont"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="jean.dupont@exemple.fr"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">
                                        Entreprise
                                    </label>
                                    <select
                                        value={companyId}
                                        onChange={(e) => setCompanyId(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Sélectionner une entreprise</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
                                >
                                    {editingContactId !== null
                                        ? "Enregistrer"
                                        : "Créer le contact"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}