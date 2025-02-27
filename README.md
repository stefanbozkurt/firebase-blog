# Blog-Projekt mit Firebase

Dieses Projekt ist ein einfacher Blog mit Firebase-Authentifizierung, Firestore-Datenbank und einer Beitragsverwaltung. Es unterstützt die Erstellung, Bearbeitung und Anzeige von Blogposts sowie eine paginierte Listenansicht.

## Funktionen
- **Benutzer-Authentifizierung** mit Firebase
- **Erstellung & Bearbeitung von Beiträgen** mit Quill-Editor
- **Speicherung der Beiträge** in Firestore
- **Dynamische Pagination** für das Blog-Listing
- **Modal-Anzeige für Beiträge** direkt in der Liste

## Installation
1. **Repository klonen:**
   ```bash
   git clone https://github.com/dein-repo/blog-projekt.git
   cd blog-projekt
   ```
2. **Firebase konfigurieren:**
   - Erstelle ein Firebase-Projekt und aktiviere Firestore sowie die Authentifizierung.
   - Ersetze die Konfiguration in `script.js` mit deinen Firebase-Daten.
3. **Lokalen Server starten:**
   - Öffne `index.html` in einem Live-Server oder einem lokalen Webserver.

## Nutzung
- **Anmelden / Abmelden**: Über den Login-Button
- **Beitrag erstellen**: Als eingeloggter Nutzer möglich
- **Beitrag bearbeiten & löschen**: Nur für Autoren sichtbar
- **Pagination**: Blättert durch Beiträge in Fünfergruppen mit Navigation
- **Modal-Funktionalität**: Beiträge in der Listenansicht können direkt per Klick geöffnet werden

## Bekannte Probleme & Lösungen
- **Modal öffnet sich nicht?** Stelle sicher, dass `openModal()` korrekt aufgerufen wird.
- **Pagination zeigt falsche Seitenzahlen?** Prüfe `setupPagination()` in `script.js`.
- **Firebase-Fehler?** Stelle sicher, dass Firestore und Auth aktiviert sind.

## Lizenz
MIT-Lizenz