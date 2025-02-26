// Firebase-Konfiguration (ersetze mit deinen echten Daten)
const firebaseConfig = {
  apiKey: "AIzaSyDi9zN-bJkBfFUljFMOSHsw1uFMvgi_0vs",
  authDomain: "stefanbozkurt.firebaseapp.com",
  projectId: "stefanbozkurt",
  storageBucket: "stefanbozkurt.firebasestorage.app",
  messagingSenderId: "711424993272",
  appId: "1:711424993272:web:f0e847eb9ba6937567980d"
};

let editPostId = null; // Speichert die ID des Beitrags, der bearbeitet wird

// Blogposts anzeigen (mit Bearbeiten-Buttons)
function loadHeadlines() {
    db.collection("headlines").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const list = document.getElementById("headlinesList");
        list.innerHTML = ""; // Liste leeren

        snapshot.forEach(doc => {
            const data = doc.data();
            const listItem = document.createElement("li");

            listItem.innerHTML = `
                <strong>${data.text}</strong><br>
                ${data.content}<br>
                <em>von ${data.user}</em>
                <br>
                <button onclick="editHeadline('${doc.id}', '${data.text.replace(/'/g, "\\'")}', \`${data.content.replace(/`/g, "\\`")}\`)">
                    Bearbeiten
                </button>
            `;

            list.appendChild(listItem);
        });
    });
}

// Bearbeiten-Funktion
function editHeadline(id, text, content) {
    document.getElementById("headlineInput").value = text;
    quill.root.innerHTML = content;
    editPostId = id; // Speichert die ID des aktuellen Beitrags
}

// Speichern (Neu + Update)
function saveHeadline() {
    const headline = document.getElementById("headlineInput").value;
    const content = quill.root.innerHTML;
    const user = auth.currentUser;

    if (!user) {
        alert("Bitte erst einloggen!");
        return;
    }

    if (!headline.trim()) {
        alert("Bitte eine Headline eingeben!");
        return;
    }

    if (editPostId) {
        // UPDATE: Existierenden Beitrag aktualisieren
        db.collection("headlines").doc(editPostId).update({
            text: headline,
            content: content,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("✅ Beitrag aktualisiert!");
            resetEditor();
        })
        .catch(error => console.error("❌ Fehler beim Aktualisieren:", error));
    } else {
        // NEU: Beitrag speichern
        db.collection("headlines").add({
            text: headline,
            content: content,
            user: user.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("✅ Neuer Beitrag gespeichert!");
            resetEditor();
        })
        .catch(error => console.error("❌ Fehler beim Speichern:", error));
    }
}

// Editor zurücksetzen
function resetEditor() {
    document.getElementById("headlineInput").value = "";
    quill.root.innerHTML = "";
    editPostId = null;
}

// Auth-Listener starten
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById("loginStatus").innerText = `Eingeloggt als: ${user.email}`;
    }
    loadHeadlines();
});
