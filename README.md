# Mon ID Elec
1 point de commande => interrupteur
1 double => 1 point de commande
Prise simple 16A
Prise specialisée 20A

T1 => studio pas de chambre

----
Cuisine
Salle de bain
Circulation et locaux ≥ 4 m2
Palier d’escalier
Séjour
Chambre ou bureau
Buanderie
WC
Extérieur (ex : patio)
Autres (garage, placard, circulation et locaux < 4 m2…)
Séjour avec cuisine intégrée
Salle de bain avec WC intégré

=> Label (editable) | Selecteur (role) | Exposition

- Surface loi Carrez => Surface totale 
-

Par default couleur blanche / interrupteur

============

Ventilation => VMC
Chauffe Eau

Chauffage / Climatisation
- Pompe à chaleur => somme
- Convecteur c'est que la piece courrante


**Options 5**

Wizer grisé

Production d'eau chaude à supprimer
Nombre de personnes dans le logement viré car déplacé


:===
Supprimer : Surface loi Carrez
=> check conformité


- Récap
- Validation 

Validation:
- Bon nombre équipement pour la norme
Coche verte par piece si OK pour contrainte locale
Jaune si rempli pas contrainte locale (explication si possible) => warning
En bas vert si norme respecté au "global" / rouge si nok avec explication.
===================
Tableau electrique (2nd etape) => non existante ojd
Proposer d'acheter disjoncteur / Sélection du tableau electrique / para foudre (liste attendue de Adrien) / cable electrique / interrupteur diferentiels
Proposer par defaut le bon nombre de disjoncteur par rapport aux equipements => calcul en fonction du nbre de prise 
  => 1 disjoncteur par piece
+ 1 disjoncteur en fonction convecteur / PAC etc
===================
Page récap
Devis + fourniture => export CSV
-------------------
Element upsell et tableau electriqueBlocker port 3000 ufw

---
integration nestjs derriere protection auth

Quand j'applique les modifications et que je reviens en arriere sur l'étape équipement, ca duplique les équipements et sacré une nouvelle ligne

degager local storage