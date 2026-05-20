import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// CONFIGURACIÓN DE TU PROYECTO FIREBASE
// Reemplaza este objeto con tus datos reales de Firebase Console
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCCw5JyFk3gE2iaszW0FNxHtV3XPJa7kPo",
    authDomain: "cpes-56a66.firebaseapp.com",
    projectId: "cpes-56a66",
    storageBucket: "cpes-56a66.firebasestorage.app",
    messagingSenderId: "1046401265413",
    appId: "1:1046401265413:web:e1ba68ebfa32497340916c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentActiveTab = 1;

// Elementos del DOM
const loginModal = document.getElementById('login-modal');
const teacherDashboard = document.getElementById('teacher-dashboard');
const btnToggleLogin = document.getElementById('btn-toggle-login');
const submissionsContainer = document.getElementById('submissions-container');
const loginError = document.getElementById('login-error');

// Mantiene la sesión activa al recargar
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginModal.style.display = 'none';
        btnToggleLogin.style.display = 'none';
        teacherDashboard.style.display = 'block';
        fetchSubmissions();
    } else {
        teacherDashboard.style.display = 'none';
        loginModal.style.display = 'none';
        btnToggleLogin.style.display = 'block';
    }
});

// Abrir Login
btnToggleLogin.addEventListener('click', () => {
    loginModal.style.display = 'block';
    btnToggleLogin.style.display = 'none';
    loginModal.scrollIntoView({ behavior: 'smooth' });
});

// Evento Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('prof-email').value;
    const password = document.getElementById('prof-password').value;
    loginError.style.display = 'none';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById('login-form').reset();
    } catch (error) {
        loginError.style.display = 'block';
        console.error("Error de autenticación:", error.message);
    }
});

// Evento Logout
document.getElementById('btn-logout').addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
    }
});

// Guardar Datos en Firestore
async function sendSubmission(formNum, alumno, respuestas) {
    try {
        await addDoc(collection(db, "entregas"), {
            alumno: alumno,
            cuestionario: formNum,
            respuestas: respuestas,
            fecha: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date()
        });
        
        document.getElementById(`success-${formNum}`).style.display = 'block';
        document.getElementById(`form-cuestionario-${formNum}`).reset();
        setTimeout(() => document.getElementById(`success-${formNum}`).style.display = 'none', 5000);
        
        if(auth.currentUser) fetchSubmissions();
    } catch (error) {
        alert("Hubo un error al enviar la tarea. Intenta de nuevo.");
        console.error("Error al guardar en base de datos:", error);
    }
}

// Interceptores de formularios
document.getElementById('form-cuestionario-1').addEventListener('submit', (e) => {
    e.preventDefault();
    const alumno = document.getElementById('nombre-1').value;
    const respuestas = [
        { pregunta: "1. Lectura del texto", respuesta: document.getElementById('q1-1').value },
        { pregunta: "2. ¿Qué fue la generación del 80?", respuesta: document.getElementById('q1-2').value },
        { pregunta: "3. ¿Qué significa el PAN y su objetivo?", respuesta: document.getElementById('q1-3').value },
        { pregunta: "4. Ley de Territorios Nacionales", respuesta: document.getElementById('q1-4').value }
    ];
    sendSubmission(1, alumno, respuestas);
});

document.getElementById('form-cuestionario-2').addEventListener('submit', (e) => {
    e.preventDefault();
    const alumno = document.getElementById('nombre-2').value;
    const respuestas = [
        { pregunta: "1. 1880 como punto de inicio", respuesta: document.getElementById('q2-1').value },
        { pregunta: "2. Cambios que marcaron el fin", respuesta: document.getElementById('q2-2').value },
        { pregunta: "3. ¿Qué es la Década Infame?", respuesta: document.getElementById('q2-3').value }
    ];
    sendSubmission(2, alumno, respuestas);
});

document.getElementById('form-cuestionario-3').addEventListener('submit', (e) => {
    e.preventDefault();
    const alumno = document.getElementById('nombre-3').value;
    
    // Recoger valores de selección múltiple de forma segura
    const optA = document.querySelector('input[name="opt-a"]:checked')?.value || "No seleccionada";
    const optB = document.querySelector('input[name="opt-b"]:checked')?.value || "No seleccionada";
    const optC = document.querySelector('input[name="opt-c"]:checked')?.value || "No seleccionada";
    const optD = document.querySelector('input[name="opt-d"]:checked')?.value || "No seleccionada";
    const optE = document.querySelector('input[name="opt-e"]:checked')?.value || "No seleccionada";

    const respuestas = [
        { pregunta: "Act 1 - Q1: ¿En qué fecha ocurrió el golpe?", respuesta: document.getElementById('q3-a1-1').value },
        { pregunta: "Act 1 - Q2: ¿Quién encabezó el golpe?", respuesta: document.getElementById('q3-a1-2').value },
        { pregunta: "Act 1 - Q3: ¿Qué sectores apoyaron?", respuesta: document.getElementById('q3-a1-3').value },
        { pregunta: "Act 2 - Base: ¿Por qué afectó la crisis de 1929?", respuesta: document.getElementById('q3-a2-base').value },
        { pregunta: "Act 2 - Q1: ¿Qué son las villas miserias?", respuesta: document.getElementById('q3-a2-1').value },
        { pregunta: "Act 2 - Q2: ¿Por qué recibe ese nombre?", respuesta: document.getElementById('q3-a2-2').value },
        { pregunta: "Opción A: El golpe ocurrió en", respuesta: optA },
        { pregunta: "Opción B: El presidente derrocado fue", respuesta: optB },
        { pregunta: "Opción C: El golpe fue encabezado por", respuesta: optC },
        { pregunta: "Opción D: Una causa importante fue", respuesta: optD },
        { pregunta: "Opción E: Luego del golpe se inicia", respuesta: optE }
    ];
    sendSubmission(3, alumno, respuestas);
});

// Leer datos desde Firestore
async function fetchSubmissions() {
    submissionsContainer.innerHTML = '<p style="text-align: center; color: #6B7280;">Buscando entregas nuevas...</p>';
    try {
        const q = query(collection(db, "entregas"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        let html = `<h3>Entregas Recibidas - Cuestionario ${currentActiveTab}</h3>`;
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.cuestionario === currentActiveTab) {
                count++;
                let respuestasHtml = '';
                data.respuestas.forEach(r => {
                    respuestasHtml += `
                        <p class="question-title">${r.pregunta}</p>
                        <p class="answer-text">${r.respuesta}</p>
                    `;
                });

                html += `
                    <div class="student-submission">
                        <h4>🎓 ${data.alumno} <span class="badge">Enviado: ${data.fecha}</span></h4>
                        ${respuestasHtml}
                    </div>
                `;
            }
        });

        if (count === 0) {
            submissionsContainer.innerHTML = `<p style="color: #6B7280; text-align: center; padding: 20px;">No hay respuestas en la nube para el Cuestionario ${currentActiveTab}.</p>`;
        } else {
            submissionsContainer.innerHTML = html;
        }
    } catch (error) {
        submissionsContainer.innerHTML = '<p style="color: #EF4444; text-align: center;">Error al leer la base de datos. Comprueba las reglas de seguridad.</p>';
        console.error(error);
    }
}

// Control de pestañas del panel
document.getElementById('tab-cuestionario-1').addEventListener('click', () => {
    currentActiveTab = 1;
    setActiveTab('tab-cuestionario-1');
});
document.getElementById('tab-cuestionario-2').addEventListener('click', () => {
    currentActiveTab = 2;
    setActiveTab('tab-cuestionario-2');
});
document.getElementById('tab-cuestionario-3').addEventListener('click', () => {
    currentActiveTab = 3;
    setActiveTab('tab-cuestionario-3');
});

function setActiveTab(activeId) {
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(activeId).classList.add('active');
    fetchSubmissions();
}
