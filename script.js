import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"

/************************************************************************************************************************************************
 * END OF IMPORTS
 * START OF INITIALIZATION
************************************************************************************************************************************************/

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

let controller = new AbortController();
let onValuePlayersStop = null;


/************************************************************************************************************************************************
 * END OF INITIALIZATION
 * START OF FUNCTIONS
************************************************************************************************************************************************/


/*
window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});*/

function clearEventListeners() {
    controller.abort();
    controller = new AbortController();
}

function gotoLoginDiv() {
    document.querySelector("#lobby0Div").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "none";
    document.querySelector("#loginDiv").style.display = "block";
    
    clearEventListeners();
    document.querySelector("#signinBtn").addEventListener('click', signIn, { signal: controller.signal });
    document.querySelector("#signupBtn").addEventListener('click', signUp, { signal: controller.signal });
}

function gotoLobby0Div() {
    const lobbyIdSession = sessionStorage.getItem("lobbyId");
    const isHost = sessionStorage.getItem("isHost");
    if (lobbyIdSession) {
        if (isHost == "true") {
            get(ref(database, 'Rooms/' + lobbyIdSession)).then((snapshot1) => {
                const roomData = snapshot1.val();
                
                console.info("Visszalépve a szobába!")
                gotoLobby1hostDiv(roomData);
                return;
            }).catch((error) => {
                console.error(error);
            });
        } else {
            get(ref(database, 'Rooms/' + lobbyIdSession)).then((snapshot1) => {
                const roomData = snapshot1.val();
                console.log(roomData);
                    
                console.info("Csatlakozva a szobához!");
                
                gotoLobby1playerDiv(roomData);
                return;
            }).catch((error) => {
                console.error(error);
            });
        }
    }

    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "block";
    document.querySelector("#emailh2").textContent = "Email: " + auth.currentUser.email;
    
    clearEventListeners();
    document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
    document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    document.querySelector("#logoutBtn").addEventListener('click', logOut, { signal: controller.signal });
}

function gotoLobby1hostDiv(roomData) {
    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "block";

    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    
    document.querySelector("#LobbyIdhosth2").textContent = "LobbyId: " + String(roomData.Code);
    const listElement = document.querySelector("#playersListhostul");
    const lobbyIdStr = sessionStorage.getItem("lobbyId");
    onValuePlayersStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/players"), (snapshot2) => {
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
    }, (error) => {
        console.error(error);
        gotoLobby0Div();
        return;
    });
    
    clearEventListeners();
    document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
    document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
}

function gotoLobby1playerDiv(roomData) {
    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "block";
    
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    
    document.querySelector("#LobbyIdplayerh2").textContent = "LobbyId: " + String(roomData.Code);
    const listElement = document.querySelector("#playersListplayerul");
    const lobbyIdStr = sessionStorage.getItem("lobbyId");
    onValuePlayersStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/players"), (snapshot2) => {
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
    }, (error) => {
        console.error(error);
        gotoLobby0Div();
        return;
    });
    
    clearEventListeners();
    document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
    document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
}

const signUp = () => {
    clearEventListeners();

    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    createUserWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres regisztráció! UID:", user.uid);
        gotoLobby0Div();
    })
    .catch((error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);

        document.querySelector("#signinBtn").addEventListener('click', signIn, { signal: controller.signal });
        document.querySelector("#signupBtn").addEventListener('click', signUp, { signal: controller.signal });
    }));
}


const signIn = () => {
    clearEventListeners();

    const email = document.querySelector("#emailInput").value;
    const pwd = document.querySelector("#pwdInput").value;

    signInWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres belépés! UID:", user.uid);
        gotoLobby0Div();
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);
        
        document.querySelector("#signinBtn").addEventListener('click', signIn, { signal: controller.signal });
        document.querySelector("#signupBtn").addEventListener('click', signUp, { signal: controller.signal });
    });
}

const createLobby = () => {
    clearEventListeners();

    const user = auth.currentUser
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }
    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);

    if (!lobbyId || !lobbyPIN) {
        console.error("HIBA: Tölts ki mendne szükséges mezőt!");
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }

    get(ref(database, 'usedCodes')).then((snapshot) => {
        let usedCodes = "";
        if (snapshot.exists()) {
            usedCodes = snapshot.val();
        }

        if (usedCodes.includes(lobbyIdStr + ";")) {
            console.error("Ez a lobbyId már létezik válassz másikat!");
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
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
            
            console.info("A szoba létrehozva!")
            sessionStorage.setItem("lobbyId", lobbyIdStr);
            sessionStorage.setItem("isHost", "true");

            gotoLobby1hostDiv(roomData);
        }).catch((error1) => {
            console.error(error1);
            
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        });
    }).catch((error) => {
        console.error(error);
        
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    });
}


const joinLobby = () => {
    clearEventListeners();

    const user = auth.currentUser;
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }

    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);
    let nickname = document.querySelector("#lobbyNicknameInput").value;

    if (!lobbyId || !lobbyPIN || !nickname) {
        console.error("HIBA: Tölts ki mendne szükséges mezőt!");
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }

    get(ref(database, "usedCodes")).then((snapshot) => {
        if (!snapshot.exists() || !snapshot.val().includes(lobbyIdStr + ";")) {
            console.warn("Nem található szoba ezzel a kóddal");
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
            return;
        }
        set(ref(database, "Rooms/" + lobbyIdStr + "/players/" + user.uid), {
            entered_PIN: lobbyPIN,
            nickname: nickname
        });

        get(ref(database, 'Rooms/' + lobbyIdStr)).then((snapshot1) => {
            const roomData = snapshot1.val();
            console.log(roomData);
                
            console.info("Csatlakozva a szobához!");
            sessionStorage.setItem("lobbyId", lobbyIdStr);
            sessionStorage.setItem("isHost", "false");
            
            gotoLobby1playerDiv(roomData);
        }).catch((error1) => {
            console.error(error1);
            
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        });
    }).catch((error) => {
        console.error(error);
        
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    });
}

const logOut = () => {
    signOut(auth).then(() => {
        console.info("Sikeres kijelentkezés!");
        gotoLoginDiv();
    }).catch((error) => {
        console.error("Hiba a kijelentkezés során: " + error);
    });
}

/************************************************************************************************************************************************
 * END OF FUNCTIONS
 * START OF CODE
************************************************************************************************************************************************/
gotoLoginDiv();
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.info("SIkeres bejelentkezés! UID: " + user.uid);
        gotoLobby0Div();
    } else {
        gotoLoginDiv();
    }
})