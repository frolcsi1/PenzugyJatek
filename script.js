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

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});


const signUp = () => {
    document.querySelector("#signinBtn").removeEventListener('click', signIn);
    document.querySelector("#signupBtn").removeEventListener('click', signUp);

    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    createUserWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres regisztráció! UID:", user.uid);
        document.querySelector("#loginDiv").style.display = "none";
        document.querySelector("#lobby0Div").style.display = "block";
        
        document.querySelector("#createBtn").addEventListener('click', createLobby);
        document.querySelector("#joinBtn").addEventListener('click', joinLobby);
    })
    .catch((error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);

        document.querySelector("#signinBtn").addEventListener('click', signIn);
        document.querySelector("#signupBtn").addEventListener('click', signUp);
    }));
}


const signIn = () => {
    document.querySelector("#signinBtn").removeEventListener('click', signIn);
    document.querySelector("#signupBtn").removeEventListener('click', signUp);

    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    signInWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres belépés! UID:", user.uid);
        document.querySelector("#loginDiv").style.display = "none";
        document.querySelector("#lobby0Div").style.display = "block";
        
        document.querySelector("#createBtn").addEventListener('click', createLobby);
        document.querySelector("#joinBtn").addEventListener('click', joinLobby);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);
        
        document.querySelector("#signinBtn").addEventListener('click', signIn);
        document.querySelector("#signupBtn").addEventListener('click', signUp);
    });
}

const createLobby = () => {
    document.querySelector("#createBtn").removeEventListener('click', createLobby);
    document.querySelector("#joinBtn").removeEventListener('click', joinLobby);

    const user = auth.currentUser
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        return;
    }
    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);

    if (!lobbyId || !lobbyPIN) {
        console.error("HIBA: Tölts ki mendne szükséges mezőt!");
        return;
    }

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

        get(ref(database, 'Rooms/' + lobbyIdStr)).then((snapshot1) => {
            const roomData = snapshot1.val();
            document.querySelector("#LobbyIdhosth2").textContent = "LobbyId: " + roomData.Code;
            
            console.info("A szoba létrehozva!")
            document.querySelector("#lobby0Div").style.display = "none";
            document.querySelector("#lobby1hostDiv").style.display = "block";

            const listElement = document.querySelector("#playersListhostul");
            onValue(ref(database, 'Rooms/' + lobbyIdStr + "/players"), (snapshot2) => {
                const players = snapshot2.val();
                listElement.innerHTML = "";
                if (players) {
                    const playersList = Object.values(players);
                    playersList.forEach((player) => {
                        const li = document.createElement('li');
                        li.textContent = player.nickname;
                        listElement.appendChild(li);
                    });
                }
            });
        }).catch((error1) => {
            console.error(error1);
            
            document.querySelector("#createBtn").addEventListener('click', createLobby);
            document.querySelector("#joinBtn").addEventListener('click', joinLobby);
        });
    }).catch((error) => {
        console.error(error);
        
        document.querySelector("#createBtn").addEventListener('click', createLobby);
        document.querySelector("#joinBtn").addEventListener('click', joinLobby);
    });
}


const joinLobby = () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        return;
    }

    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);
    let nickname = document.querySelector("#lobbyNicknameInput").value;

    if (!lobbyId || !lobbyPIN || !nickname) {
        console.error("HIBA: Tölts ki mendne szükséges mezőt!");
        return;
    }

    get(ref(database, "usedCodes")).then((snapshot) => {
        if (!snapshot.exists() || !snapshot.val().includes(lobbyIdStr + ";")) {
            console.warn("Nem található szoba ezzel a kóddal");
            return;
        }
        set(ref(database, "Rooms/" + lobbyIdStr + "/players/" + user.uid), {
            entered_PIN: lobbyPIN,
            nickname: nickname
        });

        get(ref(database, 'Rooms/' + lobbyIdStr)).then((snapshot1) => {
            const roomData = snapshot1.val();
            console.log(roomData);
            document.querySelector("#LobbyIdplayerh2").textContent = "LobbyId: " + String(roomData.Code);
                
            console.info("Csatlakozva a szobához!")
            document.querySelector("#lobby0Div").style.display = "none";
            document.querySelector("#lobby1playerDiv").style.display = "block";

            const listElement = document.querySelector("#playersListplayerul");
            onValue(ref(database, 'Rooms/' + lobbyIdStr + "/players"), (snapshot2) => {
                const players = snapshot2.val();
                listElement.innerHTML = "";
                if (players) {
                    const playersList = Object.values(players);
                    playersList.forEach((player) => {
                        const li = document.createElement('li');
                        li.textContent = player.nickname;
                        listElement.appendChild(li);
                    });
                }
            });
        }).catch((error1) => {
            console.error(error1);
            
            document.querySelector("#createBtn").addEventListener('click', createLobby);
            document.querySelector("#joinBtn").addEventListener('click', joinLobby);
        });
    }).catch((error) => {
        console.error(error);
        
        document.querySelector("#createBtn").addEventListener('click', createLobby);
        document.querySelector("#joinBtn").addEventListener('click', joinLobby);
    });
}



document.querySelector("#signinBtn").addEventListener('click', signIn);
document.querySelector("#signupBtn").addEventListener('click', signUp);