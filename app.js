// Configuración Firebase
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

const state = {
  uid: null,
  user: null
};

// Referencias a elementos del DOM
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const btnRegister = document.getElementById('btn-register');

const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');

const btnLogout = document.getElementById('btn-logout');

const timeEntryInput = document.getElementById('time-entry-input');
const btnAddEntry = document.getElementById('btn-add-entry');

const entriesList = document.getElementById('entries-list');

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

// Login
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

// Estado de autenticación
auth.onAuthStateChanged(user => {
  if (user) {
    state.uid = user.uid;
    state.user = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email
    };

    document.getElementById('auth-container').classList.add('hidden');
    updateUserInfo();

    database.ref(`users/${user.uid}/initialSetupComplete`).once('value').then(snapshot => {
      const setupComplete = snapshot.val();
      if (!setupComplete) {
        document.getElementById('initial-setup-form').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
      } else {
        document.getElementById('initial-setup-form').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        loadUserData();
        listenTimeEntries(user.uid);
      }
    });
  } else {
    state.uid = null;
    state.user = null;
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('initial-setup-form').classList.add('hidden');
  }
});

// Guardar datos del formulario inicial
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById('setup-user-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const fullName = document.getElementById('full-name').value;
      const phone = document.getElementById('phone').value;
      const idNumber = document.getElementById('id-number').value;

      if (!state.uid) return;

      database.ref(`users/${state.uid}/profile`).set({
        name: fullName,
        phone: phone,
        id: idNumber
      });

      database.ref(`users/${state.uid}/initialSetupComplete`).set(true).then(() => {
        document.getElementById('initial-setup-form').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        updateUserInfo();
        loadUserData();
        listenTimeEntries(state.uid);
      });
    });
  }
});

// Mostrar la información del usuario
function loadUserData() {
  if (!state.uid) return;
  database.ref(`users/${state.uid}/profile`).once('value').then(snapshot => {
    const data = snapshot.val();
    if (data) {
      document.getElementById('info-name').textContent = data.name || '';
      document.getElementById('info-phone').textContent = data.phone || '';
      document.getElementById('info-id').textContent = data.id || '';
    }
  });
}

// Mostrar el correo del usuario
function updateUserInfo() {
  if (state.user) {
    const userEmailSpan = document.getElementById('user-email');
    if (userEmailSpan) userEmailSpan.textContent = state.user.email;
  }
}

// Escuchar y mostrar entradas de tiempo
function listenTimeEntries(uid) {
  const ref = database.ref(`timeEntries/${uid}`);
  ref.off(); // eliminar listeners previos

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

// Agregar nueva entrada
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
