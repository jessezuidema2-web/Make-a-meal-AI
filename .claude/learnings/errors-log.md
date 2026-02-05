# Claude Error Log & Learnings

Dit bestand houdt fouten bij die ik heb gemaakt zodat ik ervan kan leren.

---

## 2024-02-04: Carnivore Tag Fix (KRITIEKE FOUT)

### Fout 5: Verkeerde tag definities - CARNIVORE met eieren
**Probleem:** Recepten met eieren hadden de 'carnivore' tag, maar carnivore dieet = ALLEEN VLEES.
**Voorbeelden die FOUT waren:**
- "Prosciutto & Eggs" - bevat eieren
- "Steak & Eggs" - bevat eieren
- "Bacon Egg Cups" - bevat eieren
- "Chorizo & Eggs" - bevat eieren
**Oorzaak:** Niet goed nagedacht over wat 'carnivore' betekent. Eieren zijn NIET vlees.
**Oplossing:**
1. 'carnivore' tag verwijderd van alle recepten met eieren
2. 6 nieuwe PURE VLEES ontbijt recepten toegevoegd
**Les:** BIJ ELKE TAG: controleer of het recept ECHT aan de definitie voldoet:
- carnivore = ALLEEN vlees/vis, geen eieren, geen zuivel, geen groenten
- vegan = geen dierlijke producten
- spicy = moet pittig zijn
- sweet = moet zoet zijn

---

## 2024-02-04: DiscoverScreen Recipe Fixes

### Fout 1: Dubbele Unsplash URLs
**Probleem:** Bij het maken van recipeData.ts had ik meerdere recepten dezelfde foto URL gegeven.
**Oorzaak:** Niet systematisch unieke URLs toegewezen per recept.
**Oplossing:** Alle 162 recepten doorgelopen en elke URL uniek gemaakt.
**Les:** Bij het genereren van data met afbeeldingen, altijd een check doen op duplicaten:
```bash
grep -oP "https://images\.unsplash\.com/[^'?]+" file.ts | sort | uniq -d
```

### Fout 2: Missing StyleSheet definitions
**Probleem:** In JSX verwezen naar `styles.resultTime` en `styles.modalTime` die niet bestonden.
**Oorzaak:** Styles toegevoegd in JSX maar vergeten toe te voegen aan StyleSheet.
**Oplossing:** Beide styles toegevoegd aan StyleSheet.
**Les:** Na elke JSX wijziging met nieuwe styles, direct ook StyleSheet updaten. TypeScript check runnen: `npx tsc --noEmit`

### Fout 3: Hardcoded macro values in tracker
**Probleem:** Bij "Add to Tracker" werden carbs en fat hardcoded op 0 gezet.
**Oorzaak:** Oude code die niet was bijgewerkt toen carbs/fat aan recipes werden toegevoegd.
**Oplossing:** `carbs: selectedRecipe.carbs, fat: selectedRecipe.fat` toegevoegd.
**Les:** Bij het toevoegen van nieuwe velden aan een interface, ALLE plekken checken waar die interface wordt gebruikt.

### Fout 4: Shell escaping issues
**Probleem:** `!==` in node -e command werd niet goed ge-escaped in Windows PowerShell.
**Oorzaak:** PowerShell interpreteert `!` als history expansion.
**Oplossing:** Script naar bestand schrijven in plaats van inline uitvoeren.
**Les:** Voor complexe JavaScript/TypeScript checks, schrijf naar een temp bestand en run dat.

---

## 2024-02-05: Filter Coverage & Sorting Fix

### Fout 6: Onvoldoende filter coverage bij 3-filter combinaties
**Probleem:** Veel 3-filter combinaties (bijv. dinner + sweet + italian) gaven 0 resultaten.
**Oorzaak:** Recepten hadden te weinig tags en er waren niet genoeg recepten per niche combinatie.
**Oplossing:**
1. fix-tags.js script gemaakt om automatisch tags toe te voegen op basis van nutritionele waarden
2. 170+ nieuwe recepten toegevoegd verspreid over alle keukens
3. Multi-tagging strategie: elk recept krijgt ALLE relevante tags (lunch+dinner+snack voor desserts, etc.)
**Resultaat:** 378 recepten, 378 unieke URLs, ALLE haalbare 2- en 3-filter combinaties 5+ resultaten.
**Les:**
- Bij het toevoegen van recepten: gebruik multi-tagging agressief
- Maak ALTIJD een analyse script om alle combinaties te testen
- Logisch onmogelijke combinaties (vegan+carnivore, cross-cuisine) zijn OK om 0 te hebben

### Fout 7: Geen sortering op relevantie
**Probleem:** Resultaten werden niet gesorteerd. Bijv. high-protein filter toonde niet de hoogste protein eerst.
**Oorzaak:** `results` useMemo filterde alleen, sorteerde niet.
**Oplossing:** Sortering toegevoegd op basis van actieve goal filters:
- high-protein → sort op protein (hoog→laag)
- cutting → sort op calories (laag→hoog)
- bulking → sort op calories (hoog→laag)
- pre-workout → sort op carbs (hoog→laag)
- quick → sort op time (snel→langzaam)
**Les:** Bij elk filter systeem: denk na over sortering, niet alleen filtering.

---

## Best Practices Geleerd

1. **Altijd TypeScript check na wijzigingen:** `npx tsc --noEmit`
2. **Check duplicaten in data:** Gebruik grep + sort + uniq
3. **Test filter coverage:** Maak een test script voor alle combinaties
4. **Commit atomisch:** Kleine, gefocuste commits met duidelijke messages
5. **Documenteer wijzigingen:** Update PROGRESS.md of CHANGELOG

---

## Commands om te onthouden

```bash
# Check TypeScript
npx tsc --noEmit

# Vind dubbele URLs
grep -oP "pattern" file | sort | uniq -d

# Tel unieke items
grep -oP "pattern" file | sort -u | wc -l

# Git status
git status
git diff --stat
```
