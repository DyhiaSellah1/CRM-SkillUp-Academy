# SkillUp CRM – Plateforme de gestion de la relation client

## 1. Présentation du projet

SkillUp CRM est une application web développée dans le cadre d’un projet de formation en communication digitale et développement web.

Le projet consiste à concevoir et développer un **CRM (Customer Relationship Management)** permettant à une entreprise de :

- centraliser les données clients
- suivre les opportunités commerciales
- analyser les performances marketing
- automatiser certaines communications

L’application adopte une **architecture SaaS moderne**, utilisant des technologies cloud et des APIs externes.

---

# 2. Contexte métier

Les entreprises utilisent des CRM pour améliorer leur relation client et optimiser leurs ventes.

Un CRM permet notamment de :

- suivre les prospects
- organiser les actions commerciales
- analyser les performances
- centraliser les données clients

Dans ce projet, l’entreprise fictive **SkillUp Academy** souhaite mettre en place un CRM pour améliorer :

- le suivi des prospects
- la gestion des contacts
- le pilotage des campagnes marketing
- la visualisation des performances commerciales

---

# 3. Objectifs du projet

Les objectifs du projet sont :

- concevoir une application web full-stack
- mettre en place une base de données relationnelle
- développer une interface utilisateur moderne
- implémenter une API REST
- intégrer un service d’emailing
- visualiser les données via des dashboards

---

# 4. Technologies utilisées

## Frontend

- React
- Next.js
- Tailwind CSS
- TypeScript

Le frontend gère :

- l’interface utilisateur
- la navigation entre les pages
- la communication avec l’API backend

---

## Backend

- Node.js
- Express.js

Le backend fournit :

- les APIs REST
- la logique métier
- la gestion des utilisateurs
- la connexion à la base de données

---

## Base de données

- PostgreSQL

La base stocke :

- utilisateurs
- entreprises
- contacts
- leads
- pipeline
- tâches

---

## Services externes

- **Brevo** : envoi d’emails automatiques
- **GitHub** : gestion du code
- **Vercel** : déploiement
- **Supabase / Neon** : base de données cloud

---

# 5. Architecture du système

Architecture générale :
Frontend (Next.js)
↓
API REST
↓
Backend (Node.js / Express)
↓
Base de données PostgreSQL

Communication :


Frontend → API REST → Backend → PostgreSQL


Services externes :


Backend → Brevo → Email utilisateur

---

# 6. Structure du projet
SkillUp CRM
│
├── backend
│ ├── server.js
│ ├── src
│ │ └── mail
│ │ └── mailservice.js
│ └── package.json
│
├── frontend
│ ├── app
│ │ ├── dashboard
│ │ ├── contacts
│ │ ├── companies
│ │ ├── leads
│ │ ├── tasks
│ │ ├── pipeline
│ │ ├── stats
│ │ ├── login
│ │ └── register
│ │
│ └── components
│ └── Sidebar.tsx
│
├── diagrams
│ ├── usecase-crm.puml
│ ├── class-crm.puml
│ ├── er-crm.mmd
│ └── workflow-crm.mmd
│
└── README.md


---

# 7. Gestion des utilisateurs

Le système comporte trois rôles :

### User
Accès limité :

- consulter certaines informations
- accéder à son espace utilisateur

### Commercial

Le commercial gère la relation client :

- création de contacts
- gestion des entreprises
- suivi des leads
- création de tâches

### Admin

L’administrateur supervise la plateforme :

- gestion des utilisateurs
- attribution des rôles
- accès au dashboard global
- gestion du pipeline

---

# 8. Gestion des contacts

Un contact représente une personne associée à une entreprise.

Informations stockées :

- prénom
- nom
- email
- entreprise

Fonctionnalités :

- création
- consultation
- association à une entreprise

---

# 9. Gestion des entreprises

Une entreprise peut contenir plusieurs contacts.

Exemples d’informations :

- nom
- secteur d’activité
- ville

Relation :
Entreprise → Contacts


---

# 10. Gestion des leads

Un **lead** représente une opportunité commerciale.

Informations stockées :

- titre
- montant potentiel
- contact associé
- source
- statut
- étape du pipeline

Statuts possibles :

- nouveau
- en cours
- converti
- perdu

---

# 11. Pipeline commercial

Le pipeline représente le cycle de vente.

Étapes configurées :

1. Nouveau lead
2. Qualification
3. Rendez-vous planifié
4. Proposition envoyée
5. Négociation
6. Gagné
7. Perdu

Chaque lead est affiché dans la colonne correspondant à son étape.

Le pipeline permet :

- visualisation des opportunités
- suivi du cycle de vente
- analyse du funnel commercial

---

# 12. Gestion des tâches

Les tâches permettent d’organiser les actions commerciales.

Exemples :

- appel prospect
- rendez-vous client
- relance email
- préparation de proposition

Chaque tâche est liée à un lead.

---

# 13. Dashboard et statistiques

Le dashboard permet de visualiser les indicateurs clés.

Indicateurs affichés :

- nombre de leads
- chiffre d’affaires potentiel
- nombre de contacts
- nombre de tâches

Statistiques détaillées :

- leads par statut
- leads par source
- leads par étape du pipeline

---

# 14. Modélisation des données

Tables principales :

---

# 10. Gestion des leads

Un **lead** représente une opportunité commerciale.

Informations stockées :

- titre
- montant potentiel
- contact associé
- source
- statut
- étape du pipeline

Statuts possibles :

- nouveau
- en cours
- converti
- perdu

---

# 11. Pipeline commercial

Le pipeline représente le cycle de vente.

Étapes configurées :

1. Nouveau lead
2. Qualification
3. Rendez-vous planifié
4. Proposition envoyée
5. Négociation
6. Gagné
7. Perdu

Chaque lead est affiché dans la colonne correspondant à son étape.

Le pipeline permet :

- visualisation des opportunités
- suivi du cycle de vente
- analyse du funnel commercial

---

# 12. Gestion des tâches

Les tâches permettent d’organiser les actions commerciales.

Exemples :

- appel prospect
- rendez-vous client
- relance email
- préparation de proposition

Chaque tâche est liée à un lead.

---

# 13. Dashboard et statistiques

Le dashboard permet de visualiser les indicateurs clés.

Indicateurs affichés :

- nombre de leads
- chiffre d’affaires potentiel
- nombre de contacts
- nombre de tâches

Statistiques détaillées :

- leads par statut
- leads par source
- leads par étape du pipeline

---

# 14. Modélisation des données

Tables principales :
users
companies
contacts
pipeline_stages
leads
tasks
Relations :

---

# 17. Envoi d’emails

Le CRM utilise **Brevo** pour envoyer des emails automatiques.

Exemples d’usage :

- notification de création de lead
- communication marketing
- suivi commercial

---

# 18. Déploiement

Le projet peut être déployé sur :

Frontend :


Vercel


Backend :


Railway
Render
Vercel serverless


Base de données :


Supabase
Neon


---


## Diagrammes du projet

### Diagramme de cas d'utilisation (Use Case)

Ce diagramme présente les interactions entre les différents types d’utilisateurs du CRM et les fonctionnalités principales de l’application.

![Use Case Diagram](diagram/usecase.png)

---

### Diagramme de la base de données (ER Diagram)

Ce diagramme représente la structure de la base de données du CRM ainsi que les relations entre les différentes entités.

![ER Diagram](diagram/class_crm.png)

---

# 20. Améliorations futures

Fonctionnalités possibles :

- drag & drop dans le pipeline
- segmentation marketing
- intégration CRM avec réseaux sociaux
- automatisation marketing avancée
- reporting avancé

---

# Auteur

Projet réalisé par :

Dyhia Sellah

Projet académique – CRM SaaS.