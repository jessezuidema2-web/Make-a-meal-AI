# Claude Error Log & Learnings

Dit bestand houdt fouten bij die ik heb gemaakt zodat ik ervan kan leren.

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
