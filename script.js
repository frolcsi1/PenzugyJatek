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
let onValueBidListening = null;
let onValueMainWord = null;
let onValuePoints = null
let errorTimeout = null;
const errorDiv = document.querySelector("#errorDiv");
let autoLogin = true;
const emailDomain = "@penzugyjatek.notexists"
let newPlayersAllowed = true
let letters = [];
let players = {};
let mainWordDef = "";
let mainWordLength = 0;


/************************************************************************************************************************************************
 * END OF INITIALIZATION
 * START OF FUNCTIONS
************************************************************************************************************************************************/


function clearEventListeners() {
    controller.abort();
    controller = new AbortController();
}

function hideAll() {
    document.querySelector("#privacyPolicyDiv").classList.add("hidden");
    document.querySelector("#loginDiv").classList.add("hidden");
    document.querySelector("#lobby0Div").classList.add("hidden");
    document.querySelector("#lobby1hostDiv").classList.add("hidden");
    document.querySelector("#lobby1playerDiv").classList.add("hidden");
    document.querySelector("#GameQuestionDiv").classList.add("hidden");
    document.querySelector("#GameAuctionDiv").classList.add("hidden");
    document.querySelector("#errorDiv").classList.add("hidden");
    document.querySelector("#pointsDiv").classList.add("hidden");
}

function gotoPrivacyPolicy() {
    hideAll();
    document.querySelector("#privacyPolicyDiv").classList.remove("hidden");

    
    clearEventListeners();
    document.querySelector("#ChangeToEnglishBtn").addEventListener('click', () => {
        document.querySelectorAll(".hu").forEach(element => {
            element.classList.add("hidden");
        });
        document.querySelectorAll(".en").forEach(element => {
            element.classList.remove("hidden");
        });
    }, { signal: controller.signal });
    document.querySelector("#ChangeToHungarianBtn").addEventListener('click', () => {
        document.querySelectorAll(".en").forEach(element => {
            element.classList.add("hidden");
        });
        document.querySelectorAll(".hu").forEach(element => {
            element.classList.remove("hidden");
        });
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
    hideAll();
    document.querySelector("#loginDiv").classList.remove("hidden");
    
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

    hideAll();
    document.querySelector("#lobby0Div").classList.remove("hidden");
    document.querySelector("#userNh2").textContent = "Felhasználónév: " + (auth.currentUser.email.replace(emailDomain, ""));
    
    clearEventListeners();
    document.querySelector("#createBtn").addEventListener('click', createLobby, { signal: controller.signal });
    document.querySelector("#joinBtn").addEventListener('click', joinLobby, { signal: controller.signal });
    document.querySelector("#logoutBtn").addEventListener('click', logOut, { signal: controller.signal });
    document.querySelector("#toCreate").addEventListener('click', showCreate, { signal: controller.signal });
    document.querySelector("#toJoin").addEventListener('click', showJoin, { signal: controller.signal });
    document.querySelector("#toRules").addEventListener('click', showRules, { signal: controller.signal });
}

function gotoLobby1hostDiv(roomData) {
    hideAll();
    document.querySelector("#lobby1hostDiv").classList.remove("hidden");

    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    if (onValueBidListening) {
        onValueBidListening();
        onValueBidListening = null;
    }
    if (onValueMainWord) {
        onValueMainWord();
        onValueMainWord = null;
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
    
    clearEventListeners();
    document.querySelector("#startGameBtn").addEventListener('click', () => {
        startGame(lobbyIdStr);
    }, { signal: controller.signal });
    document.querySelector("#closeRoomBtn").addEventListener('click', () => {
        closeRoom(lobbyIdStr);
    }, { signal: controller.signal });
    window.addEventListener('beforeunload', (event) => {
        event.preventDefault();
        event.returnValue = '';
    }, { signal: controller.signal });
}

function gotoLobby1playerDiv(roomData) {
    hideAll();
    document.querySelector("#lobby1playerDiv").classList.remove("hidden");
    const user = auth.currentUser;
    
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    if (onValueBidListening) {
        onValueBidListening();
        onValueBidListening = null;
    }
    if (onValueMainWord) {
        onValueMainWord();
        onValueMainWord = null;
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
        if (snapshot1.val() == 1) {
            gotoGameQuestionsDiv(lobbyIdStr);
        } else if (snapshot1.val() == 3) {
            gotoGameAuctionDiv(lobbyIdStr);
        } else {
            console.warn(snapshot1.val());
        }
    });

    onValueMainWord = onValue(ref(database, 'Rooms/' + lobbyIdStr + '/main/' + user.uid + '/mainDef'), (snapshot3) => {
        const data = snapshot3.val();
        if (onValueMainWord && data) {
            mainWordDef = data;
            get(ref(database, 'Rooms/' + lobbyIdStr + '/main/' + user.uid + '/length'), (snapshot4) => {
                mainWordLength = snapshot4.val();
                onValueMainWord();
            })
        }
    });

    onValuePoints = onValue(ref(database, 'Rooms/' + lobbyIdStr + '/main/' + user.uid + '/points'), (snapshot5) => {
        const points = snapshot5.val();
        document.querySelector("#pointsH1").textContent = 'Pontok: ' + points;
    });
    
    clearEventListeners();
    document.querySelector("#exitRoomBtn0").addEventListener('click', () => {
        exitRoom(lobbyIdStr);
    }, { signal: controller.signal });
}

function gotoGameQuestionsDiv(lobbyIdStr) {
    hideAll();
    document.querySelector("#GameQuestionDiv").classList.remove("hidden");
    document.querySelector("#pointsDiv").classList.remove("hidden");
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    if (onValueBidListening) {
        onValueBidListening();
        onValueBidListening = null;
    }
    if (onValueMainWord) {
        onValueMainWord();
        onValueMainWord = null;
    }
    
    for (let i = 0; i < 4 ; i++) {
        for (let j = 0; j < 4; j++) {
            document.querySelector(`#Option${i}${j}`).checked = false;
            document.querySelector(`#Option${i}${j}`).disabled = false;
        }
    }

    onValueGameSatusStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/status"), (snapshot1) => {
        if (snapshot1.val() == 0) {
            gotoLobby1playerDiv();
        } else if (snapshot1.val() == 2) {
            const o0 = document.querySelector('input[name="O0"]:checked');
            const o1 = document.querySelector('input[name="O1"]:checked');
            const o2 = document.querySelector('input[name="O2"]:checked');
            const o3 = document.querySelector('input[name="O3"]:checked');
            const a0 = o0?.value ?? "0";
            const a1 = o1?.value ?? "0";
            const a2 = o2?.value ?? "0";
            const a3 = o3?.value ?? "0";
            set(ref(database, 'Rooms/' + lobbyIdStr + '/answers/' + auth.currentUser.uid), {
                a0: a0,
                a1: a1,
                a2: a2,
                a3: a3,
            });
            for (let i = 0; i < 4 ; i++) {
                for (let j = 0; j < 4; j++) {
                    document.querySelector(`#Option${i}${j}`).disabled = true;
                }
            }
        } else if (snapshot1.val() == 3) {
            gotoGameAuctionDiv(lobbyIdStr);
        } else {
            console.warn(snapshot1.val());
        }
    });
    
    get(ref(database, "Rooms/" + lobbyIdStr + '/questions')).then((snapshot) => {
        const data = snapshot.val();
        for (let i = 0; i < 4; i++) {
            document.querySelector(`#def${i}`).textContent = data[`question${i}`];
            const optionsRaw = data[`options${i}`];
            const options = optionsRaw.split('\\\\');
            for (let j = 0; j < 4; j++) {
                document.querySelector(`#O${i}${j}`).textContent = options[j];
            }
        }
    }).catch((error) => {
        console.error(error);
        findError(error);
    });
    
    clearEventListeners();
    document.querySelector("#exitRoomBtn1").addEventListener('click', () => {
        exitRoom(lobbyIdStr);
    }, { signal: controller.signal });
}

function gotoGameAuctionDiv(lobbyIdStr) {
    hideAll();
    document.querySelector("#GameAuctionDiv").classList.remove("hidden");
    
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    if (onValueBidListening) {
        onValueBidListening();
        onValueBidListening = null;
    }
    if (onValueMainWord) {
        onValueMainWord();
        onValueMainWord = null;
    }

    onValueGameSatusStop = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/status"), (snapshot1) => {
        if (snapshot1.val() == 1) {
            gotoGameQuestionsDiv(lobbyIdStr);
        } else if (snapshot1.val() == 4) {
            gotoGameEnd(lobbyIdStr);
        } else {
            console.warn(snapshot1.val());
        }
    });

    let offers = [null, null, null, null, null, null];

    onValueBidListening = onValue(ref(database, 'Rooms/' + lobbyIdStr + "/bid"), (snapshot) => {
        const dbChars = snapshot.val() || {};

        for (let i = 0; i < offers.length; i++) {
            const char = offers[i];

            if (char && !dbChars[char]) {
                offers[i] = null;
            }
        }

        for (const [charKey, data] of Object.entries(dbChars)) {
            const alreadyShowed = offers.includes(charKey);

            if (!alreadyShowed) {
                const freeIndex = offers.indexOf(null);

                if (freeIndex !== -1) {
                    offers[freeIndex] = charKey;
                }
            }
        }

        offers.forEach((char, i) => {
            if (char) {
                document.querySelector(`#letter${i}h1`).innerHTML = `${char} (${dbChars[char].bidAmount} pont)`;
                document.querySelector(`#bid${i}Input`).value = dbChars[char].bidAmount+1;
                const newBtn = document.querySelector(`#bid${i}Btn`).cloneNode(true);
                document.querySelector(`#bid${i}Btn`).replaceWith(newBtn);
                document.querySelector(`#bid${i}Btn`).addEventListener('click', () => {
                    console.log(dbChars[char].expire);
                    update(ref(database, 'Rooms/' + lobbyIdStr + '/bid/' + char), {
                        'bidAmount': Number(document.querySelector(`#bid${i}Input`).value),
                        'char': char,
                        'expire': Number(dbChars[char].expire) + 5000,
                        'uid': auth.currentUser.uid
                    });

                }, { signal: controller.signal });
            } else {
                document.querySelector(`#letter${i}h1`).innerHTML = '-';
                document.querySelector(`#bid${i}Input`).value = 0;
                document.querySelector(`#bid${i}Btn`).onclick = null;
            }
        })
    });
    
    clearEventListeners();
    document.querySelector("#exitRoomBtn2").addEventListener('click', () => {
        exitRoom(lobbyIdStr);
    }, { signal: controller.signal });
}

function gotoGameEnd(lobbyIdStr) {
    hideAll();
    document.querySelector("#GameEndDiv").classList.remove("hidden");
    document.querySelector("#pointsDiv").classList.add("hidden");
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }
    if (onValueBidListening) {
        onValueBidListening();
        onValueBidListening = null;
    }
    if (onValueMainWord) {
        onValueMainWord();
        onValueMainWord = null;
    }
    if (onValuePoints) {
        onValuePoints();
        onValuePoints = null;
    }

    clearEventListeners();
    document.querySelector("#exitRoomBtn2").addEventListener('click', () => {
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
            questions: {
                previousQuestionsIds: "",
                question0: "",
                question1: "",
                question2: "",
                question3: "",
                options0: "",
                options1: "",
                options2: "",
                options3: "",
                answer0: "",
                answer1: "",
                answer2: "",
                answer3: "",
            },
            score: {
            },
            status: 0,
            newPlayerAllowed: true,
            main: {},
            winner: "",
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

const startGame = (lobbyIdStr) => {
    get(ref(database, 'Rooms/' + lobbyIdStr + '/players')).then((snapshot) => {
        console.log(snapshot);
        console.log(snapshot.val());
        Object.keys(snapshot.val()).forEach((uid) => {
            players[uid] = {
                nickname: snapshot.val()[uid].nickname,
                points: 100,
                mainDef: "valami",
                mainWord: "s",
                length: "megoldas".length,
                chars: {},
            }
            //TODO: mainWord/mainDef/points(0) GENERÁLÁSA!!!
        });
        set(ref(database, 'Rooms/' + lobbyIdStr + '/main'), players);
        questions(lobbyIdStr);
    }).catch((error) => {
        console.error(error);
        findError(error);
    });
    console.log("ok")
}

function questions(lobbyIdStr) {

    let questions = [];
    let options = [];
    let answers = [];
    let usedQuestions = '';
    get(ref(database, 'questions')).then((snapshot) => {
        questions = snapshot.val();
        
        get(ref(database, 'options')).then((snapshot1) => {
            options = snapshot1.val() || [];
            
            get(ref(database, 'answers')).then((snapshot2) => {
                answers = snapshot2.val() || [];

                get(ref(database, 'Rooms/' + lobbyIdStr + '/questions/previousQuestionsIds')).then((snapshot3) => {
                    usedQuestions = snapshot3.val() || '';
                    
                    giveQuestion(lobbyIdStr, questions, options, answers, usedQuestions);


                }).catch((error3) => {
                    console.error(error3);
                    findError(error3);
                });
                
            }).catch((error2) => {
                console.error(error2);
                findError(error2);
            });

        }).catch((error1) => {
            console.error(error1);
            findError(error1);
        });

    }).catch((error) => {
        console.error(error);
        findError(error);
    });
}

async function giveQuestion(lobbyIdStr, questions, options, answers, usedQuestions, prevAnsw = null) {
    let newIds = [];
    let newId = -1;
    let newIdsStr = "";
    let newIdStr = "";
    let tries = 0;

    for (let i = 0; i < 4; i++) {
        tries = 0;
        newId = Math.floor(Math.random() * questions.length);
        newIdStr = String(newId) + ";";
        tries++;
        while ((usedQuestions.includes(newIdStr) || newIdsStr.includes(newIdStr)) && tries <= questions.length * 100) {
            console.log(`${tries}/${questions.length * 100}`);
            newId = Math.floor(Math.random() * questions.length);
            newIdStr = String(newId) + ";";
            tries++;
        }
        if (tries >= questions.length * 100) {
            return;
        }

        newIds.push(newId);
        newIdsStr += newIdStr;
    }
    

    if (tries >= questions.length * 100) {
        showError("Nem sikerült 4 új kérdást találni!", 2);
        return;
    }

    usedQuestions = usedQuestions + newIdsStr;

    let updates = {}
    updates['previousQuestionsIds'] = usedQuestions;
    updates['question0'] = questions[newIds[0]];
    updates['question1'] = questions[newIds[1]];
    updates['question2'] = questions[newIds[2]];
    updates['question3'] = questions[newIds[3]];
    updates['options0'] = options[newIds[0]];
    updates['options1'] = options[newIds[1]];
    updates['options2'] = options[newIds[2]];
    updates['options3'] = options[newIds[3]];

    console.log(updates);

    try {
        await update(ref(database, 'Rooms/' + lobbyIdStr + '/questions'), updates)
        await set(ref(database, 'Rooms/' + lobbyIdStr + '/status'), 1);

        await wait(60000);

        await set(ref(database, 'Rooms/' + lobbyIdStr + '/status'), 2);
        await wait(10000);

        const snapshot = await get(ref(database, 'Rooms/' + lobbyIdStr + '/answers'))
        const data = snapshot.val();
        console.log(data);

        Object.entries(data).forEach(([uid, a]) => {
            let plus = 0
            if (a.a0 == answers[newIds[0]]) {plus++;}
            if (a.a1 == answers[newIds[1]]) {plus++;}
            if (a.a2 == answers[newIds[2]]) {plus++;}
            if (a.a3 == answers[newIds[3]]) {plus++;}
            players[uid].points += plus;
        });

        update(ref(database, 'Rooms/' + lobbyIdStr + '/main'), players);

        
        await wait(10000);
        set(ref(database, 'Rooms/' + lobbyIdStr + '/status'), 3);
        await wait(3000);
        auction(lobbyIdStr);
    } catch (error) {
        console.error(error);
        findError(error);
    }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function auction(lobbyIdStr) {
    let stop = false;
    if (onValuePlayersStop) {
        onValuePlayersStop();
        onValuePlayersStop = null;
    }
    if (onValueGameSatusStop) {
        onValueGameSatusStop();
        onValueGameSatusStop = null;
    }

    let abc = ["A", "Á", "B", "C", "Cs", "D", "Dz", "Dzs", "E", "É", "F", "G", "Gy", "H", "I", "Í", "J", "K", "L", "Ly","M", "N", "Ny", "O", "Ó", "Ö", "Ő", "P", "Q", "R", "S", "Sz", "T", "Ty", "U", "Ú", "Ü", "Ű", "V", "W", "X", "Y", "Z", "Zs"];

    for (let i = abc.length-1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1));

        [abc[i], abc[j]] = [abc[j], abc[i]];
    }

    const dbRef = ref(database, `Rooms/${lobbyIdStr}/bid`);
    let lastCharSentTime = 0;

    const mainAuction = setInterval(async () => {
        const snapshot = await get(dbRef);
        let actualOffers = snapshot.val() || {};
        const now = Date.now();
        let changed = false;

        for (const [key, data] of Object.entries(actualOffers)) {
            if (now >= data.expire) {
                if (data.uid !== "") {
                    showError(`A(z) ${data.char} betűt megnyerte: ${data.uid}`);
                    console.log(`A(z) ${data.char} betűt megnyerte: ${data.uid}`);
                    
                    players[data.uid].points -= data.bidAmount;
                    players[data.uid].chars[data.char] = true;
                    update(ref(database, 'Rooms/' + lobbyIdStr + '/main/' + data.uid), players[data.uid]);

                    let win = true;
                    if (players[data.uid].points < 0) {win=false;}
                    else {
                        const chars = Object.keys(players[data.uid].chars);
                        players[data.uid].mainWord.split('').forEach((c) => {
                            console.log(c);
                            console.log(c.toUpperCase());
                            console.log(chars);
                            if (!chars.includes(c.toUpperCase())) {
                                win=false;
                                console.log('HIBA:' + c);
                            }
                        });
                    }
                    if (win) {
                        update(ref(database, 'Rooms/' + lobbyIdStr ), {
                            status: 4,
                            winner: players[data.uid].nickname + '(' + data.uid + ')',
                        });
                        console.log('Győztes: ' + players[data.uid].nickname + '(' + data.uid + ')')
                        stop = true;
                    }
                }
                delete actualOffers[key];
                changed = true;
            }
        }

        const actualNumberOfOffers = Object.keys(actualOffers).length;

        if (actualNumberOfOffers < 5 && abc.length > 0 && (now-lastCharSentTime) >= 1000) {
            const newChar = abc.shift();

            actualOffers[newChar] = {
                "char": newChar,
                "bidAmount": 0,
                "uid": "",
                "expire": now + 5000
            };

            lastCharSentTime = now;
            changed = true;
        }

        if (changed) {
            await update(ref(database, `Rooms/${lobbyIdStr}/`), { 'bid': actualOffers });
        }

        if ((actualNumberOfOffers == 0 && abc.length == 0) || stop) {
            clearInterval(mainAuction);
            if (stop) {
                console.log("Win")
            } else {
                console.log("giveQuestion")
                questions(lobbyIdStr);
            }
        }
    }, 200);
}
function showCreate() {
    document.querySelector("#lobby0RoomDiv").classList.remove("hidden");
    document.querySelector("#lobby0RulesDiv").classList.add("hidden");
    document.querySelectorAll(".createRoom").forEach(el => el.classList.remove("hidden"));
    document.querySelectorAll(".joinRoom").forEach(el => el.classList.add("hidden"));
}
function showRules() {
    document.querySelector("#lobby0RoomDiv").classList.add("hidden");
    document.querySelector("#lobby0RulesDiv").classList.remove("hidden");

}
function showJoin() {
    document.querySelector("#lobby0RoomDiv").classList.remove("hidden");
    document.querySelector("#lobby0RulesDiv").classList.add("hidden");
    document.querySelectorAll(".joinRoom").forEach(el => el.classList.remove("hidden"));
    document.querySelectorAll(".createRoom").forEach(el => el.classList.add("hidden")); 
}
/************************************************************************************************************************************************
 * END OF FUNCTIONS
 * START OF CODE
************************************************************************************************************************************************/


gotoPrivacyPolicy();