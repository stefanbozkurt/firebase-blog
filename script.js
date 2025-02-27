// Firebase initialisieren
const firebaseConfig = {
    apiKey: "AIzaSyDi9zN-bJkBfFUljFMOSHsw1uFMvgi_0vs",
    authDomain: "stefanbozkurt.firebaseapp.com",
    projectId: "stefanbozkurt",
    storageBucket: "stefanbozkurt.appspot.com",
    messagingSenderId: "711424993272",
    appId: "1:711424993272:web:f0e847eb9ba6937567980d"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// DOM-Elemente abrufen
const elements = {
    userStatus: document.getElementById("userStatus"),
    loginButton: document.getElementById("loginButton"),
    logoutButton: document.getElementById("logoutButton"),
    mainContent: document.getElementById("mainContent"),
    postsList: document.getElementById("postsList"),
    saveButton: document.getElementById("saveButton"),
    headline: document.getElementById("headline"),
    postTitle: document.getElementById("postTitle"),
    postContent: document.getElementById("postContent"),
};

// Quill Editor initialisieren
let quill;
if (document.getElementById("editor")) {
    quill = new Quill("#editor", {
        theme: "snow",
        modules: {
            toolbar: {
                container: [
                    ["bold", "italic", "underline"], 
                    [{ header: [1, 2, false] }], 
                    ["image"]
                ],
                handlers: { image: imageHandler }
            }
        }
    });
}

// Auth-Status überwachen
auth.onAuthStateChanged(user => {
    if (elements.userStatus) {
        elements.userStatus.innerText = user ? `Eingeloggt als ${user.email}` : "Nicht eingeloggt";
    }

    if (elements.loginButton && elements.logoutButton) {
        elements.loginButton.style.display = user ? "none" : "block";
        elements.logoutButton.style.display = user ? "block" : "none";
    }

    if (document.body.id === "index") {
        elements.mainContent.style.display = user ? "block" : "none";
        if (user) loadPosts();
    }
});

// Login-Funktion
function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => console.error("Fehler beim Login:", error));
}

// Logout-Funktion
function logout() {
    auth.signOut().catch(error => console.error("Fehler beim Logout:", error));
}

// Event-Listener setzen
document.addEventListener("DOMContentLoaded", () => {
    if (elements.loginButton) elements.loginButton.addEventListener("click", login);
    if (elements.logoutButton) elements.logoutButton.addEventListener("click", logout);
    if (elements.saveButton) elements.saveButton.addEventListener("click", savePost);

    switch (document.body.id) {
        case "listing":
            console.log("✅ Lade Listing...");
            loadListing();
            break;
        case "post":
            console.log("✅ Lade Einzelbeitrag...");
            loadSinglePost();
            break;
    }
});

// Beitrag speichern
function savePost() {
    const user = auth.currentUser;
    if (!user) return alert("Bitte einloggen");

    db.collection("posts").add({
        user: user.email,
        headline: elements.headline.value,
        content: quill.root.innerHTML,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(resetEditor);
}

// Beiträge für index.html laden
function loadPosts() {
    db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        if (!elements.postsList) return;
        elements.postsList.innerHTML = "";

        snapshot.forEach(doc => {
            const post = doc.data();
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${post.headline}</strong> - ${post.user} 
                <a href="post.html?id=${doc.id}" target="_blank">Ansehen</a>
                <button onclick="editPost('${doc.id}', '${post.headline.replace(/'/g, "&apos;")}', \`${post.content.replace(/`/g, "\\`")}\`)">Bearbeiten</button>
                <button onclick="deletePost('${doc.id}')">Löschen</button>`;
            elements.postsList.appendChild(li);
        });
    });
}

// Beiträge für listing.html laden
function loadListing() {
    db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        if (!elements.postsList) return;
        elements.postsList.innerHTML = "";

        snapshot.forEach(doc => {
            const post = doc.data();
            const li = document.createElement("li");
            li.innerHTML = `<strong>${post.headline}</strong> - 
                <a href="post.html?id=${doc.id}" target="_blank">Ansehen</a>`;
            elements.postsList.appendChild(li);
        });
    });
}

// Einzelnen Beitrag für post.html laden
function loadSinglePost() {
    const postId = new URLSearchParams(window.location.search).get("id");
    if (!postId) return;

    db.collection("posts").doc(postId).get().then(doc => {
        if (doc.exists) {
            const post = doc.data();
            elements.postTitle.innerText = post.headline;
            elements.postContent.innerHTML = post.content;
        } else {
            elements.postTitle.innerText = "Beitrag nicht gefunden.";
            elements.postContent.innerText = "";
        }
    }).catch(error => console.error("Fehler beim Laden des Beitrags:", error));
}

// Beitrag bearbeiten
function editPost(id, headline, content) {
    elements.headline.value = headline;
    quill.root.innerHTML = content;
    resizeImages();

    elements.saveButton.innerText = "Update";
    elements.saveButton.setAttribute("onclick", `updatePost('${id}')`);
}

// Beitrag aktualisieren
function updatePost(id) {
    db.collection("posts").doc(id).update({
        headline: elements.headline.value,
        content: quill.root.innerHTML
    }).then(resetEditor);
}

// Beitrag löschen
function deletePost(id) {
    if (confirm("Möchtest du diesen Beitrag wirklich löschen?")) {
        db.collection("posts").doc(id).delete();
    }
}

// Editor leeren
function resetEditor() {
    elements.headline.value = "";
    quill.root.innerHTML = "";
}

// Bild-URL Eingabe
function imageHandler() {
    const url = prompt("Bitte Bild-URL eingeben:");
    if (url) {
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", url);
        setTimeout(resizeImages, 100);
    }
}

// Bilder skalieren
function resizeImages() {
    document.querySelectorAll(".ql-editor img").forEach(img => {
        img.style.maxWidth = "500px";
        img.style.height = "auto";
    });
}
