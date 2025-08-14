# NF C 15-100 Compliance Engine

This microservice validates electrical installations against the French NF C 15-100 standard using FastAPI, RDFLib/SHACL and Pydantic.

It exposes two main HTTP endpoints:

1. `POST /validate/room-equipment` – Room-by-room compliance validation.
2. `POST /validate/global-with-dimensioning` – Global validation that also produces electrical dimensioning results.

The service is designed to be run as a stand-alone container and is built by the project-level `deploy.sh` script.

---

For complete documentation and integration examples, see the `tests/README.md` file inside this package.

## Integration with NestJS Backend

This compliance engine is deployed as an internal microservice that is accessed through the NestJS backend with authentication protection. The backend exposes only two specific endpoints:

- `POST /api/v1/compliance/validate/room-equipment` - Validate room equipment compliance
- `POST /api/v1/compliance/validate/global-with-dimensioning` - Validate global installation with electrical dimensioning

## Architecture

```
Client → NestJS Backend (Auth Required) → Compliance Engine (Internal)
```

### Security

- The compliance engine runs as an internal Docker service
- No ports are exposed externally for the compliance engine
- All access is routed through the NestJS backend with JWT authentication
- Only authorized users can access compliance validation endpoints

### Docker Deployment

The compliance engine is automatically built and deployed as part of the main application:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

The service will be available internally at `http://compliance-engine:8000` for the backend to communicate with.

## Development

For local development, you can run the compliance engine standalone:

```bash
cd compliance_engine
uv run uvicorn src.compliance_engine.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

When running locally, the OpenAPI documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Health Check

The service provides a health check endpoint at `/health` for Docker health checks and monitoring. 

====


Ran tool
Ran tool
Read file: compliance_engine/shapes/nfc15100_shapes.ttl

On exploite bien l’ontologie NFC 15-100 et les SHACL shapes… mais pas pour « déduire » la liste des matériels à proposer ; on les utilise essentiellement pour VALIDER que ce qui a été proposé respecte les règles.  
Voici le pourquoi :

1. Rôle des shapes  
   • Les shapes décrivent des contraintes : « si le code postal commence par un département à risque, il doit exister au moins un nfc:hasSurgeProtector ».  
   • Elles ne savent pas « fabriquer » le bon objet (type, calibre, description, quantité, etc.) ; SHACL n’a pas de mécanisme de génération.  
   • D’autre part, une fois qu’on a généré le matériel, on repasse l’installation enrichie dans le validateur ; les shapes vérifient alors que tout est présent et correct.

2. Étapes adoptées dans l’API  
   a) Validation « basique » sans les règles de dimensionnement → on filtre toutes les shapes dont le message contient des mots-clés comme « Parafoudre obligatoire », « nombre de disjoncteurs »… (voir _filter_shapes_by_focus_area).  
   b) Calcul de dimensionnement en Python : on compte les prises, on choisit les calibres, on ajoute (ou non) le parafoudre selon le code postal, etc.  
   c) Génération d’un JSON-LD complet (rooms + circuits + SPD, etc.).  
   d) Validation finale : on repasse ce JSON-LD dans le moteur SHACL - cette fois les règles de dimensionnement ne sont plus filtrées car elles sont satisfaites.

3. Pourquoi ne pas laisser la shape décider d’ajouter le parafoudre ?  
   • Une shape peut SEULEMENT signaler qu’il manque un parafoudre ; elle ne peut pas dire quel modèle ni l’intégrer dans la liste de matériels.  
   • L’objectif de l’étape de dimensionnement est de fournir un devis technique quasi complet ; on a donc besoin d’un moteur procédural (Python) qui produit des objets structurés (type, rating, description…).  
   • Après génération, la shape reste utile : elle garantit qu’on a bien mis un SPD pour les départements à risque — ou qu’on n’en a pas mis si ce n’est pas obligatoire (et qu’on n’a pas violé d’autres règles).

En résumé :  
• Les shapes = garde-fous de conformité.  
• Le code Python = moteur de dimensionnement/génération.  
Les deux se complètent : on calcule d’abord, on valide ensuite.


====
Dim monopiece
====

Dimensionnement général:
- nombre de disjoncteurs 20A cuisine == arrondi supérieur de somme des prises cuisines / 6, minimum 1
- nombre de disjoncteurs circuit spécialisé 20A == somme des prises specialisées, minimum 3
- nombre de disjoncteurs 32A == somme des prises plaques, minimum 1

Convecteur:
Si on a des convecteurs, pour chaque piece, prendre la superficie de la piece, un disjoncteur recommandé pour une piece. Alerte si superficie de la piece est supérieure à 90m2

Radiateur inertie:
Si radiateur interie installé, pour chaque piece, prendre la superficie de la piece, un disjoncteur recommandé pour une piece. Alerte si superficie de la piece est supérieure à 60m2

Chauffe-Eau
Si chauffe-eau ajouté, prendre le nombre de personne du logement et prendre la superficie globale hors garage et exterieur. un disjoncteur recommandé pour  chaque appareil.
