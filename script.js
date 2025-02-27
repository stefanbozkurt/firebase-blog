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
const userStatus = document.getElementById("userStatus");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const mainContent = document.getElementById("mainContent");
const postsList = document.getElementById("postsList");
const modal = document.getElementById("postModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const overlay = document.getElementById("modalOverlay");

let currentPage = 1;
const postsPerPage = 5;
let totalPages = 1;
let allPosts = [];

// Bild-Upload für Quill
function imageHandler() {
    const imageUrl = prompt("Bild-URL eingeben:");
    if (imageUrl) {
        const range = quill.getSelection();
        quill.insertEmbed(range.index, "image", imageUrl);
    }
}

// Quill Editor initialisieren, falls vorhanden
let quill;
if (document.getElementById("editor")) {
    quill = new Quill("#editor", {
        theme: "snow",
        modules: {
            toolbar: {
                container: [
                    ["bold", "italic", "underline"], 
                    [{ header: [1, 2, false] }], 
                    ["image", "link"]
                ],
                handlers: { image: imageHandler } // Hier war vorher der Fehler!
            }
        }
    });
}

// Login-Status überwachen
auth.onAuthStateChanged(user => {
    if (userStatus) {
        userStatus.innerText = user ? `Eingeloggt als ${user.email}` : "Nicht eingeloggt";
    }

    if (loginButton && logoutButton) {
        loginButton.style.display = user ? "none" : "block";
        logoutButton.style.display = user ? "block" : "none";
    }

    if (document.body.id === "index") {
        mainContent.style.display = user ? "block" : "none";
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

// Event-Listener für Login & Logout
document.addEventListener("DOMContentLoaded", () => {
    if (loginButton) loginButton.addEventListener("click", login);
    if (logoutButton) logoutButton.addEventListener("click", logout);
    const saveButton = document.getElementById("saveButton");
    if (saveButton) saveButton.addEventListener("click", savePost);

    if (document.body.id === "listing") {
        console.log("✅ loadListing() wird aufgerufen");
        loadListing();
    }
    if (document.body.id === "post") {
        loadSinglePost();
    }
    if (closeModal) {
        closeModal.addEventListener("click", closePostModal);
    }
    if (overlay) {
        overlay.addEventListener("click", closePostModal);
    }
});

let editingPostId = null; // Speichert die ID des zu bearbeitenden Posts
// Beitrag speichern
function savePost() {
    const user = auth.currentUser;
    if (!user) return alert("Bitte einloggen");

    const headline = document.getElementById("headline").value;
    const content = quill.root.innerHTML;

    if (editingPostId) {
        // Falls ein Post bearbeitet wird, wird er aktualisiert
        db.collection("posts").doc(editingPostId).update({
            headline,
            content,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Beitrag aktualisiert!");
            editingPostId = null; // Zurücksetzen
            resetEditor();
        }).catch(error => console.error("Fehler beim Aktualisieren:", error));
    } else {
        // Neuer Post wird erstellt
        db.collection("posts").add({
            user: user.email,
            headline,
            content,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Beitrag gespeichert!");
            resetEditor();
        }).catch(error => console.error("Fehler beim Speichern:", error));
    }
}

// Editor zurücksetzen
function resetEditor() {
    document.getElementById("headline").value = "";
    quill.root.innerHTML = "";

    const saveButton = document.getElementById("saveButton");
    if (saveButton) {
        saveButton.innerText = "Speichern";
        saveButton.onclick = savePost;
    }
}

// Beiträge laden und mit Bearbeiten/Löschen-Buttons versehen
function loadPosts() {
    const user = auth.currentUser;
    if (!user) return;

    db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const list = document.getElementById("postsList");
        if (!list) return;
        list.innerHTML = "";

        snapshot.forEach(doc => {
            const post = doc.data();
            const li = document.createElement("li");
            li.innerHTML = `<strong><a href="post.html?id=${doc.id}">${post.headline}</a></strong>`;

            // Bearbeiten- und Löschen-Buttons nur für den Autor anzeigen
            if (post.user === user.email) {
                const editButton = document.createElement("button");
                editButton.innerText = "Bearbeiten";
                editButton.onclick = () => editPost(doc.id, post);

                const deleteButton = document.createElement("button");
                deleteButton.innerText = "Löschen";
                deleteButton.onclick = () => deletePost(doc.id);

                li.appendChild(editButton);
                li.appendChild(deleteButton);
            }

            list.appendChild(li);
        });
    });
}

// Beitrag bearbeiten
function editPost(postId, post) {
    document.getElementById("headline").value = post.headline;
    quill.root.innerHTML = post.content;
    editingPostId = postId; // Setzt die ID des bearbeiteten Beitrags

    document.getElementById("saveButton").innerText = "Änderungen speichern";
}

// Änderungen speichern
function saveEditedPost(postId) {
    const headline = document.getElementById("headline").value;
    const content = quill.root.innerHTML;

    db.collection("posts").doc(postId).update({
        headline,
        content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Post aktualisiert!");
    }).catch(error => console.error("Fehler beim Aktualisieren:", error));
}

// Beitrag löschen
function deletePost(postId) {
    if (confirm("Möchtest du diesen Beitrag wirklich löschen?")) {
        db.collection("posts").doc(postId).delete()
            .then(() => alert("Post gelöscht!"))
            .catch(error => console.error("Fehler beim Löschen:", error));
    }
}

function loadSinglePost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    if (!postId) {
        console.error("Fehlende Post-ID in der URL.");
        return;
    }

    db.collection("posts").doc(postId).get().then(doc => {
        if (doc.exists) {
            const post = doc.data();
            document.getElementById("postTitle").innerText = post.headline;
            document.getElementById("postContent").innerHTML = post.content;
        } else {
            console.error("Beitrag nicht gefunden.");
        }
    }).catch(error => {
        console.error("Fehler beim Laden des Beitrags:", error);
    });
}

// Listing mit Modal-Funktion
function loadListing() {
    db.collection("posts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
        const list = document.getElementById("postsList");
        if (!list) return;
        list.innerHTML = "";

        snapshot.forEach(doc => {
            const post = doc.data();
            const li = document.createElement("li");
            li.innerHTML = `<strong>${post.headline}</strong> - 
                <button onclick="openModal('${doc.id}')">Ansehen</button>`;
            list.appendChild(li);
        });

        allPosts = snapshot.docs;
        totalPages = Math.ceil(allPosts.length / postsPerPage);
        displayPosts(allPosts.slice(0, postsPerPage));
        setupPagination();
    });
}



// Beiträge anzeigen
function displayPosts(posts) {
    postsList.innerHTML = "";
    posts.forEach(doc => {
        const post = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `<strong><a href="javascript:void(0)">${post.headline}</a></strong>`;
        li.addEventListener("click", () => openModal(post.headline, post.content)); // Hier wird das Modal geöffnet
        postsList.appendChild(li);
    });
}

// Pagination einrichten
// Pagination einrichten
function setupPagination() {
    pagination.innerHTML = "";
    let maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Vor-Button immer anzeigen
    const prevButton = document.createElement("button");
    prevButton.innerText = "←";
    prevButton.disabled = currentPage === 1; // Inaktiv auf Seite 1
    prevButton.addEventListener("click", () => changePage(currentPage - 1));
    pagination.appendChild(prevButton);
    
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement("button");
        button.innerText = i;
        button.classList.toggle("active", i === currentPage);
        button.addEventListener("click", () => changePage(i));
        pagination.appendChild(button);
    }
    
    // Weiter-Button immer anzeigen
    const nextButton = document.createElement("button");
    nextButton.innerText = "→";
    nextButton.disabled = currentPage === totalPages; // Inaktiv auf letzter Seite
    nextButton.addEventListener("click", () => changePage(currentPage + 1));
    pagination.appendChild(nextButton);
}


// Seitenwechsel
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    displayPosts(allPosts.slice(start, end));
    setupPagination();
}

// Modal öffnen
function openModal(title, content) {
    modalTitle.innerText = title;
    modalContent.innerHTML = content;
    modal.style.display = "block";
    overlay.style.display = "block";

    // ESC & Tab-Steuerung aktivieren
    document.addEventListener("keydown", handleKeyPress);

    // Fokus auf Modal setzen
    closeModal.focus();
}

// Modal schließen
function closePostModal() {
    modal.style.display = "none";
    overlay.style.display = "none";

    // Event-Listener entfernen
    document.removeEventListener("keydown", handleKeyPress);
}

// Funktion für ESC und Tab
function handleKeyPress(event) {
    const focusableElements = modal.querySelectorAll("button, [href], input, select, textarea");
    const focusable = Array.from(focusableElements); // In ein Array umwandeln
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.key === "Escape") {
        closePostModal();
    } else if (event.key === "Tab") {
        if (focusable.length === 0) return; // Falls kein fokussierbares Element vorhanden ist

        if (event.shiftKey) {
            // Shift + Tab -> Fokus zurück
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab -> Fokus vorwärts
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
}



