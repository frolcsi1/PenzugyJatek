import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set, onValue, remove, update, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js"


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
let onValueGameSatusStop = null;
let errorTimeout = null;
const errorDiv = document.querySelector("#errorDiv");
let autoLogin = true;
const emailDomain = "@penzugyjatek.notexists"
let newPlayersAllowed = true


/************************************************************************************************************************************************
 * END OF INITIALIZATION
 * START OF FUNCTIONS
************************************************************************************************************************************************/


function clearEventListeners() {
    controller.abort();
    controller = new AbortController();
}

function gotoPrivacyPolicy() {
    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "none";
    document.querySelector("#privacyPolicyDiv").style.display = "block";
    
    clearEventListeners();
    document.querySelector("#ChangeToEnglishBtn").addEventListener('click', () => {
        document.documentElement.style.setProperty('--hu-display-inline-block', 'none');
        document.documentElement.style.setProperty('--hu-display-block', 'none');
        document.documentElement.style.setProperty('--hu-display-list-item', 'none');
        document.documentElement.style.setProperty('--en-display-inline-block', 'inline-block');
        document.documentElement.style.setProperty('--en-display-block', 'block');
        document.documentElement.style.setProperty('--en-display-list-item', 'list-item');
    }, { signal: controller.signal });
    document.querySelector("#ChangeToHungarianBtn").addEventListener('click', () => {
        document.documentElement.style.setProperty('--en-display-inline-block', 'none');
        document.documentElement.style.setProperty('--en-display-block', 'none');
        document.documentElement.style.setProperty('--en-display-list-item', 'none');
        document.documentElement.style.setProperty('--hu-display-inline-block', 'inline-block');
        document.documentElement.style.setProperty('--hu-display-block', 'block');
        document.documentElement.style.setProperty('--hu-display-list-item', 'list-item');
    }, { signal: controller.signal });

    document.querySelector("#privacyPolicyContinue0").addEventListener('click', () => {
        gotoLoginDiv(autoLogin);
    }, { signal: controller.signal });
    document.querySelector("#privacyPolicyContinue1").addEventListener('click', () => {
        gotoLoginDiv(autoLogin);
    }, { signal: controller.signal });
}

function gotoLoginDiv(first = false) {
    if (first) {
        autoLogin = false;
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.info("Sikeres bejelentkezés! UID: " + user.uid);
                showError("Sikeres bejelentkezés!", 0);
                gotoLobby0Div();
            } else {
                gotoLoginDiv();
            }
        });
    }

    document.querySelector("#privacyPolicyDiv").style.display = "none";
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
            get(ref(database, 'Rooms/' + lobbyIdSession)).then((snapshot) => {
                const roomData = snapshot.val();
                
                console.info("Visszalépve a szobába!");
                showError("Visszalépve a szobába!", 0);
                gotoLobby1hostDiv(roomData);
                return;
            }).catch((error) => {
                console.error(error);
                findError(error);
            });
        } else {
            get(ref(database, 'Rooms/' + lobbyIdSession)).then((snapshot) => {
                const roomData = snapshot.val();
                    
                console.info("Csatlakozva a szobához!");
                showError("Csatlakozva a szobához!", 0);
                
                gotoLobby1playerDiv(roomData);
                return;
            }).catch((error) => {
                console.error(error);
                findError(error);
            });
        }
    }

    document.querySelector("#privacyPolicyDiv").style.display = "none";
    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "block";
    document.querySelector("#userNh2").textContent = "Felhasználónév: " + (auth.currentUser.email.replace(emailDomain, ""));
    
    clearEventListeners();
    document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
    document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    document.querySelector("#logoutBtn").addEventListener('click', logOut, { signal: controller.signal });
}

function gotoLobby1hostDiv(roomData) {
    document.querySelector("#privacyPolicyDiv").style.display = "none";
    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "block";

    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    
    document.querySelector("#LobbyIdhosth2").textContent = "Szobaszám: " + String(roomData.Code);
    const listElement = document.querySelector("#playersListhostul");
    const lobbyIdStr = sessionStorage.getItem("lobbyId");
    onValuePlayersStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/players"), (snapshot) => {
        const players = snapshot.val();
        listElement.innerHTML = "";
        if (players) {
            const playersList = Object.values(players);
            if (playersList.length >= 10) {
                set(ref(database, 'Rooms/' + lobbyIdStr + "/newPlayerAllowed"), false);
                newPlayersAllowed = false;
            } else if (!newPlayersAllowed) {
                set(ref(database, 'Rooms/' + lobbyIdStr + "/newPlayerAllowed"), true);
                newPlayersAllowed = true;
            }
            playersList.forEach((player) => {
                const li = document.createElement('li');
                li.textContent = player.nickname;
                listElement.appendChild(li);
            });
        }
    }, (error) => {
        console.error(error);
        findError(error);
        gotoLobby0Div();
        return;
    });

    onValueGameSatusStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/status"), (snapshot1) => {
        if (snapshot1.val() == 0) {
            console.info("OK")
        } else {
            console.warn(snapshot1.val());
        }
    });
    
    clearEventListeners();
    document.querySelector("#startGameBtn").addEventListener('click', startGame, { signal: controller.signal });
    document.querySelector("#closeRoomBtn").addEventListener('click', () => {
        closeRoom(lobbyIdStr);
    }, { signal: controller.signal });
    window.addEventListener('beforeunload', (event) => {
        event.preventDefault();
        event.returnValue = '';
    }, { signal: controller.signal });
}

function gotoLobby1playerDiv(roomData) {
    document.querySelector("#privacyPolicyDiv").style.display = "none";
    document.querySelector("#loginDiv").style.display = "none";
    document.querySelector("#lobby1hostDiv").style.display = "none";
    document.querySelector("#lobby0Div").style.display = "none";
    document.querySelector("#lobby1playerDiv").style.display = "block";
    
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }

    document.querySelector("#LobbyIdplayerh2").textContent = "Szobaszám: " + String(roomData.Code);
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
        findError(error);
        gotoLobby0Div();
        return;
    });

    onValueGameSatusStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/status"), (snapshot1) => {
        if (snapshot1.val() == 0) {
            console.info("OK")
        } else {
            console.warn(snapshot1.val());
        }
    });
    
    clearEventListeners();
    document.querySelector("#exitRoomBtn").addEventListener('click', () => {
        exitRoom(lobbyIdStr);
    }, { signal: controller.signal });
}

const signUp = () => {
    clearEventListeners();

    const userN = document.querySelector("#userNInput").value;
    const email = userN + emailDomain;
    const pwd = document.querySelector("#pwdInput").value;

    createUserWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres regisztráció! UID:", user.uid);
        showError("Sikeres regisztráció!", 0);
        gotoLobby0Div();
    })
    .catch((error => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);

        findError(errorCode);

        document.querySelector("#signinBtn").addEventListener('click', signIn, { signal: controller.signal });
        document.querySelector("#signupBtn").addEventListener('click', signUp, { signal: controller.signal });
    }));
}


const signIn = () => {
    clearEventListeners();

    const userN = document.querySelector("#userNInput").value;
    const email = userN + emailDomain;
    const pwd = document.querySelector("#pwdInput").value;

    signInWithEmailAndPassword(auth, email, pwd)
    .then((userCredential) => {
        const user = userCredential.user;
        console.info("Sikeres belépés! UID:", user.uid);
        showError("Sikeres belépés!", 0);
        gotoLobby0Div();
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode);
        console.error(errorMessage);

        findError(errorCode);
        
        document.querySelector("#signinBtn").addEventListener('click', signIn, { signal: controller.signal });
        document.querySelector("#signupBtn").addEventListener('click', signUp, { signal: controller.signal });
    });
}

const createLobby = () => {
    clearEventListeners();

    const user = auth.currentUser
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        showError("Nincs bejelentkezve!", 2);
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }
    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);

    if (!lobbyId || !lobbyPIN) {
        console.error("HIBA: Nincs kitöltve minden szükséges mezőt!");
        showError("Nincs kitöltve minden szükséges mező!", 1);
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }

    get(ref(database, 'usedCodes/' + lobbyIdStr)).then((snapshot) => {
        const used = snapshot.val();
        if (used) {
            console.error("Ez a lobbyId már létezik. Válasszon másikat!");
            showError("Ez a lobbyId már létezik. Válasszon másikat!");
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
            return;
        }
        
        set(ref(database, 'usedCodes/' + lobbyIdStr), true);

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
            status: 0,
            newPlayerAllowed: true,
        });

        get(ref(database, 'Rooms/' + lobbyIdStr)).then((snapshot1) => {
            const roomData = snapshot1.val();
            
            console.info("A szoba létrehozva!");
            showError("A szoba létrehozva!", 0);
            sessionStorage.setItem("lobbyId", lobbyIdStr);
            sessionStorage.setItem("isHost", "true");

            gotoLobby1hostDiv(roomData);
        }).catch((error1) => {
            console.error(error1);
            findError(error1);
            
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        });
    }).catch((error) => {
        console.error(error);
        findError(error);
        
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    });
}


const joinLobby = () => {
    clearEventListeners();

    const user = auth.currentUser;
    if (!user) {
        console.error("HIBA: Nincs bejelentkezve a felhasználó!");
        showError("Nincs bejelentkezve!", 2);
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }

    let lobbyId = Number(document.querySelector("#lobbyIdInput").value);
    let lobbyIdStr = String(lobbyId).padStart(4, "0")
    let lobbyPIN = Number(document.querySelector("#lobbyPINInput").value);
    let nickname = document.querySelector("#lobbyNicknameInput").value;

    if (!lobbyId || !lobbyPIN || !nickname) {
        console.error("HIBA: Nincs kitöltve minden szükséges mező!");
        showError("Nincs kitöltve minden szükséges mező!", 1);
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        return;
    }

    get(ref(database, "usedCodes/" + lobbyIdStr)).then((snapshot) => {
        const isExists = snapshot.val()
        if (!isExists) {
            console.warn("Nem található szoba ezzel a kóddal");
            showError("Nem található szoba ezzel a kóddal!", 2);
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
            
            console.info("Csatlakozva a szobához!");
            showError("Csatlakozva a szobához!", 0);
            sessionStorage.setItem("lobbyId", lobbyIdStr);
            sessionStorage.setItem("isHost", "false");
            
            gotoLobby1playerDiv(roomData);
        }).catch((error1) => {
            console.error(error1);
            findError(error1);
            
            document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
            document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
        });
    }).catch((error) => {
        console.error(error);
        findError(error);
        
        document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
        document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    });
}

const logOut = () => {
    signOut(auth).then(() => {
        console.info("Sikeres kijelentkezés!");
        showError("Sikeres kijelentkezés!", 0);
        gotoLoginDiv();
    }).catch((error) => {
        console.error("Hiba a kijelentkezés során: " + error);
        showError("Hiba a kijelentkezés során: " + error, 2);
    });
}

const closeRoom = (lobbyIdStr) => {
    let updates = {};
    updates[`usedCodes/${lobbyIdStr}`] = false;
    updates[`Rooms/${lobbyIdStr}`] = null;

    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }

    update(ref(database), updates).then(() => {
        console.info("Sikeres törlés");
        showError("Sikeres törlés", 0);

        sessionStorage.removeItem("lobbyId");
        sessionStorage.removeItem("isHost");

        gotoLobby0Div();
    }).catch((error1) => {
        console.error(error1);
        findError(error1);
    });
}

const exitRoom = (lobbyIdStr) => {
    const user = auth.currentUser;
    if (!user) {
        console.error("Nincs bejelentkezve");
        showError("Nincs bejelentkezve!");
        return;
    }
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    remove(ref(database, "Rooms/" + lobbyIdStr + "/players/" + user.uid)).then(() => {
        console.info("Sikeres kilépés");
        showError("Sikeres kilépés", 0);

        sessionStorage.removeItem("lobbyId");
        sessionStorage.removeItem("isHost");

        gotoLobby0Div();
    }).catch((error) => {
        console.error(error);
        findError(error);
    });
}

const findError = (errMsg) => {
    switch(errMsg) {
        case 'auth/email-already-in-use':
            showError("A megadott felhasználónévvel már regisztráltak egy fiókot.", 2);
            break;
        case 'auth/invalid-email':
            showError("Az felhasználónév nem megengedett karaktereket tartalmaz (betűk, számok, _ és betűvel kell kezdődnie).", 2);
            break;
        case 'auth/missing-password':
            showError("Adja meg a jelszavát!", 2);
            break;
        case 'auth/weak-password':
            showError("A jelszó túl rövid vagy túl egyszerű.", 2);
            break;
        case 'auth/operation-not-allowed':
            showError("Hiba történ! A probléma megoldásához forduljon a fejlesztőkhöz! Hibakód: 001.", 2);
            break;
        case 'auth/user-not-found':
            showError("Nincs ilyen felhasználónévvel regisztrált felhasználó.", 2);
            break;
        case 'auth/wrong-password':
            showError("Hibás jelszó.", 2);
            break;
        case 'auth/invalid-credential':
            showError("Hibás felhasználónév vagy jelszó.", 2);
            break;
        case 'auth/user-disabled':
            showError("A felhasználó fiókját a rendszergazda letiltotta. A probléma megoldásához forduljon a fejlesztőkhöz! Hibakód: 011.", 2);
            break;
        case 'auth/too-many-requests':
            showError("Túl sok sikertelen próbálkozás történt rövid időn belül.", 2);
            break;
        case "PERMISSION_DENIED":
            showError("Nincs jogosultsága az adatok lekéréséhez!", 2);
            break;
        case "Permission denied":
            showError("Nincs jogosultsága az adatok lekéréséhez!", 2);
            break;
        case "NETWORK_ERROR":
            showError("Hálózati hiba! Ellenőrizze az internetkapcsolatát.", 2);
            break;
        case "Network error":
            showError("Hálózati hiba! Ellenőrizze az internetkapcsolatát.", 2);
            break;
        default:
            showError("Ismeretlen hiba történt.", 2);
            break;
    }
}

const showError = (message, type)/* type: 0: success; 1: warning; 2: error*/ => {
    if (errorTimeout) {
        clearTimeout(errorTimeout);
    }

    errorDiv.textContent = message;
    errorDiv.style.display = "block";
        errorDiv.className = "";
    switch (type) {
        case 0:
            errorDiv.classList.add("success");
            break;
        case 1:
            errorDiv.classList.add("warn");
            break;
        case 2:
            errorDiv.classList.add("error");
            break;
    }

    errorTimeout = setTimeout(() => {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
        errorDiv.className = "";
        errorTimeout = null;
    }, 5000);
}

const startGame = () => {
    console.log("start");
}


/************************************************************************************************************************************************
 * END OF FUNCTIONS
 * START OF CODE
************************************************************************************************************************************************/


gotoPrivacyPolicy();