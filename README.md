# Firebase Blog Projekt

## Einleitung
Dieses Projekt ist eine einfache Blog-Anwendung, die mit Firebase Firestore für die Datenspeicherung und Firebase Authentication für die Benutzeranmeldung arbeitet. Beiträge können erstellt, bearbeitet und gelöscht werden. Die Bilder für die Posts werden über eine URL eingebunden.

## Funktionen
* **Login/Logout** mit Google Authentication
* **Erstellen von Blog-Beiträgen** mit Quill Rich-Text-Editor
* **Bearbeiten und Löschen** von Beiträgen
* **Bilder über URL einfügen**
* **Post-Listing auf listing.html** mit Links zu Einzelposts auf post.html

## Installation
1. **Firebase Projekt einrichten**
   * Gehe zur Firebase Console
   * Erstelle ein neues Projekt
   * Aktiviere Firestore-Datenbank und Authentication (Google Login aktivieren)
2. **Firebase Konfiguration in das Projekt einfügen**
   * Ersetze die `firebaseConfig` in `index.html` mit den eigenen Firebase-Konfigurationsdaten.

## Datei-Struktur


📂 firebase-blog
 ├── 📄 index.html          # Hauptseite mit Editor und Login
 ├── 📄 listing.html        # Übersicht aller Blog-Posts
 ├── 📄 post.html           # Einzelansicht eines Blog-Posts
 ├── 📄 styles.css          # Styling der Seiten
 ├── 📄 script.js           # Firebase und QuillJS Logik
 ├── 📄 README.md           # Projekt-Dokumentation


## Seiten und Funktionen
1. **index.html** (Blog Editor)
* Login/Logout mit Google
* Quill Rich-Text-Editor für Blog-Posts
* Speicherung der Beiträge in Firestore
* Anzeige aller Posts mit Bearbeiten- und Löschen-Funktion
2. **listing.html** (Post-Übersicht)
* Listet alle Beiträge mit Titeln auf
* Jeder Titel verlinkt zur `post.html?id=POST_ID`
3. **post.html** (Einzel-Post Ansicht)
* Lädt und zeigt nur den angeforderten Post basierend auf der URL-Parameter-ID (`id=POST_ID`)

## Firestore Datenstruktur


📂 posts (Collection)
   ├── 📄 POST_ID (Dokument)
       ├── headline: "Post Titel"
       ├── content: "HTML-Inhalt aus dem Editor"
       ├── user: "Benutzer Email"
       ├── timestamp: "Erstellungszeitpunkt"


## Sicherheit (Firestore Regeln)
Stelle sicher, dass Firestore nur authentifizierten Nutzern das Schreiben erlaubt:


rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}


## Hosting
Das Projekt kann mit Firebase Hosting oder GitHub Pages gehostet werden.
Firebase Hosting Setup:
1. Firebase CLI installieren: `npm install -g firebase-tools`
2. Firebase Login: `firebase login`
3. Initialisieren: `firebase init`
4. Deployen: `firebase deploy`

## Fazit
Dieses Projekt demonstriert die Integration von Firebase Firestore, Authentication und Quill.js zur Erstellung eines einfachen Blogs mit Login, Beitragserstellung und -verwaltung. Anpassungen und Erweiterungen, wie z. B. Kategorien oder Kommentare, können einfach hinzugefügt werden.
