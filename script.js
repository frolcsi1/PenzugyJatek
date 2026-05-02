import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

// TODO: Replace the following with your app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeiz5cjFl_wCvGqZjT5HDzTod69bbyM6Q",
  authDomain: "penzugyjatek.firebaseapp.com",
  databaseURL: "https://penzugyjatek-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "penzugyjatek",
  storageBucket: "penzugyjatek.firebasestorage.app",
  messagingSenderId: "665450095732",
  appId: "1:665450095732:web:ff7beb9639648238da5d21",
  measurementId: "G-9RZHCZH6LS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);


const signUp = () => {
    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    createUserWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres regisztráció! UID:", user.uid);
        document.querySelector("#loginDiv").style.display = "none";
        document.querySelector("#lobby0Div").style.display = "block";
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

    signInWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres belépés! UID:", user.uid);
        document.querySelector("#loginDiv").style.display = "none";
        document.querySelector("#lobby0Div").style.display = "block";
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);
    })
}

const createLobby = () => {
    const user = auth.currentUser
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        return;
    }
    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);

    get(ref(database, 'usedCodes')).then((snapshot) => {
        let usedCodes = "";
        if (snapshot.exists()) {
            usedCodes = snapshot.val();
        }

        if (usedCodes.includes(lobbyIdStr + ";")) {
            console.error("Ez a lobbyId már létezik válassz másikat!");
            return;
        }
        
        set(ref(database, 'usedCodes'), usedCodes + lobbyIdStr + ";");

        set(ref(database, 'Rooms/' + lobbyIdStr), {
            Code: lobbyId,
            PIN: lobbyPIN,
            host: user.uid,
            players: {
            },
            previousQuestionsIds: "-1;",
            questionId: -1,
            score: {
            },
            status: 0
        });
        console.info("A szoba létrehozva!")
        document.querySelector("#lobby0Div").style.display = "none";
        document.querySelector("#lobby1Div").style.display = "block";

        get(ref(database, 'Rooms/' + lobbyIdStr)).then((snapshot1) => {
            const roomData = snapshot1.val();
            document.querySelector("#LobbyIdh2").textContent = "LobbyId: " + roomData.Code;
            onValue(ref(database, 'Rooms/' + lobbyIdStr + "/players"), (snapshot2) => {
                const players = snapshot2.val();
                const listElement = document.querySelector("#playersListul");
                listElement.innerHTML = "";
                if (players) {
                    const userNames = Object.values(players);
                    userNames.forEach((userName) => {
                        const li = document.createElement('li');
                        li.textContent = userName;
                        listElement.appendChild(li);
                    });
                }
            })
        }).catch((error1) => {
            console.error(error1);
        })
    }).catch((error) => {
        console.error(error);
    })
}


const joinLobby = () => {
    
}



document.querySelector("#signinBtn").addEventListener('click', signIn);
document.querySelector("#signupBtn").addEventListener('click', signUp);
document.querySelector("#createBtn").addEventListener('click', createLobby);
document.querySelector("#joinBtn").addEventListener('click', joinLobby);