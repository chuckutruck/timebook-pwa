// Configuración Firebase (tu configuración)
const firebaseConfig = {
  apiKey: "AIzaSyAI-VxrbSC-d1WscOkpY9d8NaEUgdjneeE",
  authDomain: "tidbok-df555.firebaseapp.com",
  databaseURL: "https://tidbok-df555-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tidbok-df555",
  storageBucket: "tidbok-df555.firebasestorage.app",
  messagingSenderId: "467331966400",
  appId: "1:467331966400:web:abb6949a76918f2eb8d425"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');

const userEmailSpan = document.getElementById('user-email');
const entriesList = document.getElementById('entries-list');

const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const btnRegister = document.getElementById('btn-register');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');

const btnLogout = document.getElementById('btn-logout');

const timeEntryInput = document.getElementById('time-entry-input');
const btnAddEntry = document.getElementById('btn-add-entry');

// Registrar usuario
btnRegister.addEventListener('click', () => {
  const email = regEmailInput.value.trim();
  const password = regPasswordInput.value.trim();
  if (!email || !password) {
    alert('Email y contraseña requeridos');
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert('Usuario registrado: ' + userCredential.user.email);
    })
    .catch(error => alert('Error: ' + error.message));
});

// Login usuario
btnLogin.addEventListener('click', () => {
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();
  if (!email || !password) {
    alert('Email y contraseña requeridos');
    return;
  }
  auth.signInWithEmailAndPassword(email, password)
    .catch(error => alert('Error: ' + error.message));
});

// Logout
btnLogout.addEventListener('click', () => {
  auth.signOut();
});

// Escuchar estado de autenticación
auth.onAuthStateChanged(user => {
  if (user) {
    // Usuario conectado
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    userEmailSpan.textContent = user.email;

    listenTimeEntries(user.uid);
  } else {
    // Usuario desconectado
    authSection.style.display = 'block';
    appSection.style.display = 'none';
    entriesList.innerHTML = '';
  }
});

// Escuchar entradas en Realtime Database
function listenTimeEntries(uid) {
  const ref = database.ref(`timeEntries/${uid}`);
  ref.off(); // Quitar listeners previos para evitar duplicados

  ref.on('value', snapshot => {
    const data = snapshot.val();
    entriesList.innerHTML = '';
    if (data) {
      Object.entries(data).forEach(([key, entry]) => {
        const li = document.createElement('li');
        li.textContent = entry.description || JSON.stringify(entry);
        entriesList.appendChild(li);
      });
    } else {
      entriesList.innerHTML = '<li>No hay entradas</li>';
    }
  });
}

// Guardar nueva entrada
btnAddEntry.addEventListener('click', () => {
  const description = timeEntryInput.value.trim();
  if (!description) {
    alert('Escribe una descripción');
    return;
  }
  const user = auth.currentUser;
  if (!user) {
    alert('No autenticado');
    return;
  }
  const ref = database.ref(`timeEntries/${user.uid}`);
  ref.push({ description, timestamp: Date.now() })
    .then(() => {
      timeEntryInput.value = '';
    })
    .catch(error => alert('Error: ' + error.message));
});
