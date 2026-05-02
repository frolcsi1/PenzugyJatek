import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// TODO: Replace the following with your app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeiz5cjFl_wCvGqZjT5HDzTod69bbyM6Q",
    authDomain: "penzugyjatek.firebaseapp.com",
    projectId: "penzugyjatek",
    storageBucket: "penzugyjatek.firebasestorage.app",
    messagingSenderId: "665450095732",
    appId: "1:665450095732:web:ff7beb9639648238da5d21",
    measurementId: "G-9RZHCZH6LS"
};

const app = initializeApp(firebaseConfig);


const signUp = () => {
    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres regisztráció! UID:", user.uid);
        document.querySelector("#loginDiv").style.display = "none";
        document.querySelector("#lobbyDiv").style.display = "block";
    })
    .catch((error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);
    }))
}


const signIn = () => {
    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres belépés! UID:", user.uid);
        document.querySelector("#loginDiv").style.display = "none";
        document.querySelector("#lobbyDiv").style.display = "block";
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);
    })
}

const createLobby = () => {
    
}


const joinLobby = () => {
    
}



document.querySelector("#signinBtn").addEventListener('click', signIn);
document.querySelector("#signupBtn").addEventListener('click', signUp);
document.querySelector("#createBtn").addEventListener('click', createLobby);
document.querySelector("#joinBtn").addEventListener('click', joinLobby);