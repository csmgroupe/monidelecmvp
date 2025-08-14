# Move shared hooks in features if they are not used elsewhere? For now keep all hooks in shared ?

## Modules
Follow hexagonal architecture, DDD.
- Domain-Centric Names: Focus on business concepts rather than technical implementation
- Ubiquitous Language: Use terms that business stakeholders would understand
- Bounded Contexts: Each module represents a clear business boundary

- Use cases cannot call other use cases

## Features
Features map to actual user workflows
Features can grow independently
Clear boundaries prevent coupling
Easy to add new features without restructuring

----

## Structure Analysis for Modules
Looking at your existing auth module structure and the abplan functionality, I'd recommend organizing the abplan modules following the same DDD/Hexagonal architecture pattern. Here's how I would structure it:

## Core Domain Modules

```
src/modules/
├── project-management/           # Core domain for managing electrical projects
│   ├── domain/
│   │   ├── project.entity.ts     # Project, Room, Equipment entities
│   │   ├── project.repository.ts # Repository interface
│   │   └── project.events.ts     # Domain events
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── createProject.ts
│   │   │   ├── updateProject.ts
│   │   │   ├── analyzeFloorPlan.ts
│   │   │   └── generateProjectSummary.ts
│   │   ├── project.actions.ts
│   │   ├── project.reducer.ts
│   │   └── project.selectors.ts
│   └── infrastructure/
│       ├── ProjectRepository.ts
│       └── __tests__/
│           └── InMemoryProjectRepository.ts
│
├── plan-analysis/               # Subdomain for AI plan analysis
│   ├── domain/
│   │   ├── plan.entity.ts       # Plan, AnalysisResult entities
│   │   └── plan-analyzer.gateway.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── uploadPlan.ts
│   │       └── analyzePlan.ts
│   └── infrastructure/
│       ├── OpenAIPlanAnalyzer.ts
│       ├── SupabaseStorageProvider.ts
│       └── __tests__/
│           └── MockPlanAnalyzer.ts
│
├── equipment-catalog/           # Subdomain for electrical equipment
│   ├── domain/
│   │   ├── equipment.entity.ts  # EquipmentType, Category entities
│   │   └── equipment.repository.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── getEquipmentsByCategory.ts
│   │       └── getEquipmentsByRoom.ts
│   └── infrastructure/
│       └── StaticEquipmentRepository.ts
│
└── automation-systems/          # Subdomain for home automation (Wiser, etc.)
    ├── domain/
    │   ├── automation.entity.ts # AutomationSystem, WiserConfig entities
    │   └── automation.repository.ts
    ├── application/
    │   └── use-cases/
    │       └── configureAutomationSystem.ts
    └── infrastructure/
        └── StaticAutomationRepository.ts
```

## Key Naming Principles Applied:

1. **Domain-Centric Names**: Focus on business concepts rather than technical implementation
   - `project-management` instead of `abplan`
   - `plan-analysis` instead of `ai-service`
   - `equipment-catalog` instead of `equipment-data`

2. **Ubiquitous Language**: Use terms that business stakeholders would understand
   - `automation-systems` for home automation/domotics
   - `equipment-catalog` for electrical equipment database

3. **Bounded Contexts**: Each module represents a clear business boundary
   - Project lifecycle management
   - AI-powered plan analysis
   - Equipment selection and configuration
   - Automation system configuration

4. **Consistent Structure**: Following your auth module pattern with domain/application/infrastructure layers

## Entity Examples:

```typescript:src/modules/project-management/domain/project.entity.ts
export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  totalSurface: number;
  rooms: Room[];
  equipments: Equipment[];
  automationConfig?: AutomationConfig;
  planUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Room = {
  id: string;
  name: string;
  surface: number;
  exposition?: Exposition;
  equipments: Equipment[];
};

export type ProjectStatus = 'draft' | 'analyzing' | 'ready' | 'completed';
```

This structure separates concerns clearly while maintaining the business focus that DDD emphasizes. Each module can evolve independently while maintaining clear interfaces between them.


### Structure Analysis for Features

Looking at your existing feature structure and following DDD/Hexagonal architecture principles, I'd recommend organizing the `@features` directories to align with your business domains and user workflows. Here's how I would structure them:

## Current Structure Analysis
Your current features are well-organized around user journeys:
- `auth` - Authentication workflows
- `dashboard` - Main user workspace
- `heat-pump-calculator` - Specific calculation tool
- `misc` - Utility pages
- `pricing` - Subscription management
- `shared` - Cross-cutting concerns

## Recommended Feature Structure for AbPlan

```typescript
src/features/
├── auth/                           # Authentication & user management
│   ├── components/
│   ├── routes/
│   └── hooks/
│
├── dashboard/                      # Main workspace & overview
│   ├── components/
│   ├── routes/
│   └── hooks/
│
├── project-management/             # Core abplan functionality
│   ├── components/
│   │   ├── ProjectWizard/
│   │   ├── ProjectList/
│   │   ├── ProjectDetails/
│   │   └── ProjectSummary/
│   ├── routes/
│   │   ├── ProjectCreation.tsx
│   │   ├── ProjectEdit.tsx
│   │   └── ProjectList.tsx
│   └── hooks/
│       ├── useCreateProject.ts
│       ├── useUpdateProject.ts
│       └── useProjectList.ts
│
├── plan-analysis/                  # AI-powered plan analysis
│   ├── components/
│   │   ├── PlanUploader/
│   │   ├── AnalysisResults/
│   │   └── PlanViewer/
│   ├── routes/
│   │   ├── PlanUpload.tsx
│   │   └── AnalysisResults.tsx
│   └── hooks/
│       ├── useUploadPlan.ts
│       └── useAnalyzePlan.ts
│
├── equipment-catalog/              # Equipment selection & configuration
│   ├── components/
│   │   ├── EquipmentBrowser/
│   │   ├── EquipmentCard/
│   │   └── EquipmentFilter/
│   ├── routes/
│   │   ├── EquipmentCatalog.tsx
│   │   └── EquipmentDetails.tsx
│   └── hooks/
│       ├── useEquipmentSearch.ts
│       └── useEquipmentByCategory.ts
│
├── automation-systems/             # Home automation configuration
│   ├── components/
│   │   ├── WiserConfigurator/
│   │   ├── AutomationPresets/
│   │   └── SystemCompatibility/
│   ├── routes/
│   │   ├── AutomationSetup.tsx
│   │   └── SystemConfiguration.tsx
│   └── hooks/
│       └── useAutomationConfig.ts
│
├── quotation-generation/           # Quote & document generation
│   ├── components/
│   │   ├── QuoteBuilder/
│   │   ├── DocumentPreview/
│   │   └── PriceCalculator/
│   ├── routes/
│   │   ├── QuoteGeneration.tsx
│   │   └── DocumentExport.tsx
│   └── hooks/
│       ├── useGenerateQuote.ts
│       └── useExportDocument.ts
│
├── heat-pump-calculator/           # Keep existing - specific tool
│   ├── components/
│   ├── routes/
│   └── hooks/
│
├── pricing/                        # Keep existing - subscription management
│   ├── components/
│   ├── routes/
│   └── hooks/
│
├── shared/                         # Keep existing - cross-cutting concerns
│   ├── components/
│   ├── hooks/
│   └── utils/
│
└── misc/                          # Keep existing - utility pages
    └── routes/
```

## Key Naming Principles Applied:

### 1. **Business Domain Focus**
- `project-management` instead of `abplan-core`
- `plan-analysis` instead of `ai-analysis`
- `equipment-catalog` instead of `equipment-db`

### 2. **User Journey Alignment**
- Features map to actual user workflows
- Each feature represents a complete user capability
- Clear separation of concerns

### 3. **Consistent Structure**
Each feature follows the same internal structure:
```typescript
feature-name/
├── components/     # UI components specific to this feature
├── routes/         # Page-level components and routing
└── hooks/          # Feature-specific React hooks
```

### 4. **Scalability Considerations**
- Features can grow independently
- Clear boundaries prevent coupling
- Easy to add new features without restructuring

## Example Feature Implementation:

```typescript:src/features/project-management/routes/ProjectCreation.tsx
import { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { ProjectWizard } from '../components/ProjectWizard/ProjectWizard';
import { useCreateProject } from '../hooks/useCreateProject';

export const ProjectCreation = () => {
  const { mutateAsync: createProject, isPending } = useCreateProject();

  const handleProjectSubmit = async (projectData: CreateProjectData) => {
    await createProject(projectData);
    // Navigate to project details or dashboard
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Nouveau Projet</h1>
        <ProjectWizard 
          onSubmit={handleProjectSubmit}
          isLoading={isPending}
        />
      </div>
    </DashboardLayout>
  );
};
```

This structure maintains clear separation between business domains while keeping the user experience cohesive through shared components and consistent patterns.


## TODO:
- Add tests
- Add use app selector, what about to use selector from redux directly from hook to avoid mistake to take react query state and selector ? 
- Use ZOD for form validation
- Use same naming in backend and frontend 
- CREATE READ UPDATE DELETE => delete is reserved and we need to add suffix to avoid conflict, maybe use other word like remove ? so if we are no following CRUD naming, we can use 


Use port / adapter ? 

Agent for better markdown


deduplicate same file sent

pagination should be in react query or use case ?

use swagger api

Store plan analyze
Delete project

cleanup archi


Dashboard page should display last 5 projects in "Projets récents" section

router step so we can reload => project id in url

clicking on item should work

Cleanup

project preview plan etc

router in url project store anaylze etc

---
analyze/surface
analyze/equipments


-------------
handle multiple floor

refacto to use codegen

utiliser react compiler

issue with plan deletion

verifier qu'on a pas des doublons d'analyze all et analyze all devrait backup par defaut dans project-rooms

vu plan projects cassé
reprendre en redux et clean archi

- Variabiliser
Nom / element

- [x] Griser tertiaire
- [x] Ajouter nbre d'habitants


- [x] Rénovation == no check

piece detecte => height 100%

modal top issue

-----
[x] Statistiques rapides row à supprimer

Card
- [x] Jour mois date
- [x] Surface
- [x] Plan


[x] Nouveau projet => project new

- [ ] pagination ne doit pas etre visible si pas assez d'élement et pendant le chargement
- [ ] changer le nom html / header / favicon


http://app.mon-idelec.fr/

- code => definir engine CSV / output
- table row ou graph => kuzudb enchainement de table ?
--------
backoffice

- [ ] Loading principal est pas OK faire un overlay ?
- [ ] Login est pas persistent, ok en local, nok en prod
- [ ] Remplacer surface loi carrez par surface totale
- [ ] 401 on any request should redirect to login page
- [ ] vérifier projt by scopé par user

Ajoute dans la card project, la surface et la preview des plans

Ajoute le nombre de personne dans le logement.
Cette valeur doit etre stocké coté backend, modifie le backend en fonction de.

refacto with redux

- [ ] Fix double request to analyze-all et y'en a un qui fail
- [ ] refacto pour port /a dapoater / redux

- [ ] faire tout en camel case ou kebab case ?
- [ ] modifier les info perso

Comment ca marche pour PAC chauffe eau et chauffage / clim

- [ ] Resend setup

ajout type equipement et supression orientation sud etc pour RSE
- [ ] suggérer auto remplissage en fonction des normes / selection utilisateur => split dimenssionnement et le reste ?
- [ ] Check normes
- [ ] Tout passer en francais ?
- [ ] surface loi carrez => surface totale
Fais pareil pour dimensionnement Chauffe Eau en fonction du tableau.

Need

- logo
- favicon

Fermer tout les ports à part ssh et 80 et 443 avec ufw


- Pas bien comprise pour la selection dimensionnement cable comment ca se passe, c'est par equipement ?
- Systeme PAC / Climatisation chauffage / notamment pour le gainable
- Logo ?

PAC => chauffe eau

ref principale et ref associée => cache prise etc

- integration compliance engine derriere nestjs + auth => bien fermer les ports / dockerizer
- project rooms to json ld

- Ajoute la finesse de validation des protections de foudre par code postale, trouve cette liste sur internet

- rajouter le min d'équipement par defaut

options roomType => roomType

// Question

Chauffe eau ça ne va pas 

- Simple proposition d’ajouter un chauffe-eau sans plus de précision

il faut choisir le type
C'est bizarre de mettre les elements globaux par piece et pas en global
=> quid du chauffe eau PAC / thermo etc
=> 

WetRoom => BadRoom

====

Apply suggested fix
Message en francais

Bizarre le classement dégagement < 4 m2 => toujours etre un degagement et warning ou pas en fonction superficie


equipement simple fux / double flux => aucun sens de faire sa par chambre et surtout d'en avoir plus que 1
et si simple flux on ne devrait pas pouvoir mettre double flux

issue with login

debounce put

===

appliquer changement ne marche plus


Prise réseau doit utiliser référence SCH5520476 (NF C 15-100)

Prise réseau doit utiliser boîte encastrement EUR52061 (NF C 15-100)

Prise réseau nécessite câble type RJ45 (NF C 15-100)

on est pas obligé d'avoir chauffage ? ni chauffe eau ?

améliorer les suggestions => avoid regex

on ne devrait pas avoir degagement et couleur > 4 m2 mais unqiuement le type et autres c garage sinon quand on change l'area c chelou 

remplacer wetroom => batroom / actuellement on a les 2

Si y'a pas de cuisine ou celier buanderie ?

401 is not handled and should not expire when user is using the app

il manque prise va et vient

. vs , => passer tout en ,c

un Point d’éclairage est obligatoir dans les WC

debounce marche pas bien / thrttle

pb 401

401 doit redirect sur loign

améliorer les suggestions

ufw configurer

améliorer redirect 401

rajouter les tests

attention au codegen

il manque le nombre de personne
number_of_people

refaire les tests du moteur de dimensionnement et check equipement

split les shapes et ontologies en plusieurs fichiers

====
chauffe eau / nombre de personne / surface NOK

-----

revoir message pour dimensionnement par piece ou global
je ne devrais pas pouvoir rajouter plusieurs clim par piece pareil pour pac etc
Mais il se passe quoi si je mets plusieurs convecteur / clim on devrait avoir un circuit dédié non ?

Erreur 24A disjoncteur existe pas
Dans les installations domestiques, les disjoncteurs modulaires conformes à la norme EN 60898-1 sont livrés dans des calibres standardisés : 1 A, 2 A, 3 A, 4 A, 6 A, 10 A, 16 A, 20 A, 25 A, 32 A, 40 A, 50 A et 63


generateur CSV devis ?

LA LOGIQUE DE REFRESH TOKEN NE MARCHE PAS, SUREMENT PCK ON NE STOCKE PAS LA VALUE DANS LE COOKIE

PROBLEME modale croppé au top à cause du spacing

stocker et modifier et revalider dimensionnement

il manque des references 

Validation mail pour creation de compte et captcha ?

manque le mail de bienvenu

Concernant les couleurs, il n'existe pas de Mat, c'est soit blanc (SCHS520702), soit noir (SCHS540702)

L'utilisateur ne doit pas pouvoir changer le prix

modal issues


---

- 6 prises min
- Probleme Disjoncteurs par traduit.


Balcon => 

Total - garage et exterieur


===============
Prise plaque dans la cuisine erreur par piece.
Capper nombre de convecteur etc/ climatisation etc => oui / non
On ne sait pas ou c ajouté 

Retirer AB des references

Step 8: Select => reference complet meme quand select pas ouvert
Il manque les 30% => pour choisir le module

Prendre modules x rangé => update la valeur.

----
Ajouter interrupteur différentiel

A
AAC
F

-----

- [x] Retirer FloorHeating etc / VMC on a pas
Total devis => Montant estimé du projet
Devis détaillé


Ajouté montant HT dans les cards des projets.

CSV marche pasé

ajouter log et monitoring / why so slow


La prise plaque devrait etre enforce pour les cuisines et pas en global comme c'est le cas, et donc je devrais avoir la suggestion de l'équipement manquant pour les pieces cuisine & salon/sejour avec cuisine intégré.

Corrige les modales

reference sans "AB"

cleanup with Redux / cons

============================
pb de cache le prix ne s'affiche pas correctement



===

Type

R2V

PREFILEE => choisir bonne ref apres

COAXIAL

CAT6 UTP

Titre => retirer par Abelec
====
intitulé => reference principale

===
dimensionnement
appliquer suggestions


- [x] ID Plan 

===========================

- [x] Erreur d'analyse => à la place de analyse fails => Aucun plan détecté
- [x] "Virer les estimations et projections fournies"


- [x] Injecter, position en bas à droite ca cache les buttons donc je l'ai mis en haut


<button data-tally-open="wM2VGM" data-tally-emoji-text="👋" data-tally-emoji-animation="head-shake" data-tally-auto-close="0">Une suggestion ?</button>
 
 
 Dans le header
<script async src="https://tally.so/widgets/embed.js"></script>
 
=====
Checker dimensionnement ok