// Game state variables
let player1Name = "";
let player2Name = "";
let player1Cards = [];
let player2Cards = [];
let player1Card = "";
let player2Card = "";
let roundNumber = 1;
let scores = { player1: 0, player2: 0 };
let currentPlayer = "player1";
let currentLanguage = "ar";

// Card translations and images
const cardData = {
    "E": {
        name: translations.ar.emperor,
        image: "Emperor.jpeg"
    },
    "S": {
        name: translations.ar.slave,
        image: "Slave.jpeg"
    },
    "C": {
        name: translations.ar.citizen,
        image: "Citizen.jpeg"
    }
};

// Language switching
document.getElementById("lang-toggle").addEventListener("click", () => {
    const newLang = currentLanguage === "ar" ? "en" : "ar";
    switchLanguage(newLang);
});

function switchLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    
    // Update card translations
    cardData.E.name = translations[lang].emperor;
    cardData.S.name = translations[lang].slave;
    cardData.C.name = translations[lang].citizen;
    
    // Update language toggle button
    const langBtn = document.getElementById("lang-toggle");
    langBtn.innerHTML = `
        <span class="primary-lang">${lang.toUpperCase()}</span>
        <span class="secondary-lang">${lang === "ar" ? "EN" : "AR"}</span>
    `;
    
    // Update all text content
    document.title = translations[lang].title;
    updateAllText();
}

function updateAllText() {
    const t = translations[currentLanguage];
    
    // Update all static text elements
    document.querySelector("#player-info h2").textContent = t.enterNames;
    document.getElementById("player1-name").placeholder = t.player1Placeholder;
    document.getElementById("player2-name").placeholder = t.player2Placeholder;
    document.getElementById("start-game").textContent = t.startGame;
    document.getElementById("p1-seen").textContent = t.seenCards;
    document.getElementById("p2-seen").textContent = t.seenCards;
    document.getElementById("p1-confirm-card").textContent = t.confirmChoice;
    document.getElementById("p2-confirm-card").textContent = t.confirmChoice;
    document.getElementById("reveal-cards").textContent = t.revealCards;
    document.getElementById("restart-btn").textContent = t.playAgain;
    
    // Update dynamic text elements if they exist
    if (player1Name) {
        document.getElementById("player1-title").textContent = `${t.areYou} ${player1Name}?`;
        document.getElementById("confirm-player1").textContent = `${t.yesIAm} ${player1Name}`;
        document.getElementById("p1-reconfirm-title").textContent = `${t.stillYou} ${player1Name}?`;
        document.getElementById("confirm-p1-reconfirm").textContent = t.yesStillMe;
        if (document.getElementById("p1-choose-title")) {
            document.getElementById("p1-choose-title").textContent = `${t.chooseCard} ${player1Name}`;
        }
    }
    
    if (player2Name) {
        document.getElementById("player2-title").textContent = `${t.areYou} ${player2Name}?`;
        document.getElementById("confirm-player2").textContent = `${t.yesIAm} ${player2Name}`;
        document.getElementById("p2-reconfirm-title").textContent = `${t.stillYou} ${player2Name}?`;
        document.getElementById("confirm-p2-reconfirm").textContent = t.yesStillMe;
        if (document.getElementById("p2-choose-title")) {
            document.getElementById("p2-choose-title").textContent = `${t.chooseCard} ${player2Name}`;
        }
    }

    // Update game board text
    document.querySelector("#game-board h2").textContent = t.result;
    document.querySelector("#reveal-confirm h2").textContent = t.readyToReveal;
    const drawText = document.querySelector("#draw-animation p");
    if (drawText) drawText.textContent = t.draw;

    // Update card titles
    document.getElementById("p1-cards-title").textContent = t.yourCards;
    document.getElementById("p2-cards-title").textContent = t.yourCards;
}

// Initialize event listeners
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("start-game").addEventListener("click", startGame);
    document.getElementById("confirm-player1").addEventListener("click", confirmPlayer1);
    document.getElementById("p1-seen").addEventListener("click", p1SeenCards);
    document.getElementById("confirm-player2").addEventListener("click", confirmPlayer2);
    document.getElementById("p2-seen").addEventListener("click", p2SeenCards);
    document.getElementById("confirm-p1-reconfirm").addEventListener("click", p1Reconfirm);
    document.getElementById("confirm-p2-reconfirm").addEventListener("click", p2Reconfirm);
    document.getElementById("p1-confirm-card").addEventListener("click", p1ConfirmSelection);
    document.getElementById("p2-confirm-card").addEventListener("click", p2ConfirmSelection);
    document.getElementById("reveal-cards").addEventListener("click", revealCards);
    document.getElementById("restart-btn").addEventListener("click", restartGame);
});

function initializeCards() {
    if (Math.random() < 0.5) {
        player1Cards = ["E", "C", "C", "C"];
        player2Cards = ["S", "C", "C", "C"];
    } else {
        player1Cards = ["S", "C", "C", "C"];
        player2Cards = ["E", "C", "C", "C"];
    }
}

function startGame() {
    player1Name = document.getElementById("player1-name").value.trim();
    player2Name = document.getElementById("player2-name").value.trim();

    if (player1Name && player2Name) {
        initializeCards();
        document.getElementById("player-info").classList.add("hidden");
        document.getElementById("player1-title").textContent = `${translations[currentLanguage].areYou} ${player1Name}?`;
        document.getElementById("confirm-player1").textContent = `${translations[currentLanguage].yesIAm} ${player1Name}`;
        document.getElementById("player1-confirm").classList.remove("hidden");
    } else {
        alert(currentLanguage === "ar" ? "الرجاء إدخال أسماء اللاعبين" : "Please enter player names");
    }
}

function showPlayerCards(containerId, cards) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        const cardImg = document.createElement("img");
        cardImg.src = cardData[card].image;
        cardImg.alt = cardData[card].name;
        cardElement.appendChild(cardImg);
        container.appendChild(cardElement);
    });
}

function showSelectableCards(containerId, cards, player) {
    const container = document.createElement("div");
    container.className = "card-container";
    
    const parent = document.getElementById(player === "player1" ? "player1-choose" : "player2-choose");
    const oldContainer = parent.querySelector(".card-container");
    if (oldContainer) parent.removeChild(oldContainer);
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement("div");
        cardElement.className = "selectable-card";
        const cardImg = document.createElement("img");
        cardImg.src = cardData[card].image;
        cardImg.alt = cardData[card].name;
        cardElement.appendChild(cardImg);
        cardElement.dataset.value = card;
        cardElement.dataset.index = index;
        
        cardElement.addEventListener("click", function() {
            const selected = container.querySelector(".selected");
            if (selected) selected.classList.remove("selected");
            this.classList.add("selected");
            
            if (player === "player1") {
                player1Card = this.dataset.value;
            } else {
                player2Card = this.dataset.value;
            }
        });
        
        container.appendChild(cardElement);
    });
    
    parent.appendChild(container);
}

function confirmPlayer1() {
    document.getElementById("player1-confirm").classList.add("hidden");
    document.getElementById("p1-cards-title").textContent = translations[currentLanguage].yourCards;
    document.getElementById("player1-cards").classList.remove("hidden");
    showPlayerCards("p1-cards", player1Cards);
}

function p1SeenCards() {
    document.getElementById("player1-cards").classList.add("hidden");
    document.getElementById("player2-title").textContent = `${translations[currentLanguage].areYou} ${player2Name}?`;
    document.getElementById("confirm-player2").textContent = `${translations[currentLanguage].yesIAm} ${player2Name}`;
    document.getElementById("player2-confirm").classList.remove("hidden");
}

function confirmPlayer2() {
    document.getElementById("player2-confirm").classList.add("hidden");
    document.getElementById("p2-cards-title").textContent = translations[currentLanguage].yourCards;
    document.getElementById("player2-cards").classList.remove("hidden");
    showPlayerCards("p2-cards", player2Cards);
}

function p2SeenCards() {
    document.getElementById("player2-cards").classList.add("hidden");
    document.getElementById("p1-reconfirm-title").textContent = `${translations[currentLanguage].stillYou} ${player1Name}?`;
    document.getElementById("player1-reconfirm").classList.remove("hidden");
}

function p1Reconfirm() {
    document.getElementById("player1-reconfirm").classList.add("hidden");
    document.getElementById("player1-choose").classList.remove("hidden");
    document.getElementById("p1-choose-title").textContent = `${translations[currentLanguage].chooseCard} ${player1Name}`;
    showSelectableCards("p1-choose-cards", player1Cards, "player1");
    currentPlayer = "player1";
}

function p2Reconfirm() {
    document.getElementById("player2-reconfirm").classList.add("hidden");
    document.getElementById("player2-choose").classList.remove("hidden");
    document.getElementById("p2-choose-title").textContent = `${translations[currentLanguage].chooseCard} ${player2Name}`;
    showSelectableCards("p2-choose-cards", player2Cards, "player2");
    currentPlayer = "player2";
}

function p1ConfirmSelection() {
    if (!player1Card) {
        alert(currentLanguage === "ar" ? "الرجاء اختيار بطاقة أولاً!" : "Please select a card first!");
        return;
    }
    
    document.getElementById("player1-choose").classList.add("hidden");
    currentPlayer = "player2";
    document.getElementById("p2-reconfirm-title").textContent = `${translations[currentLanguage].stillYou} ${player2Name}?`;
    document.getElementById("player2-reconfirm").classList.remove("hidden");
}

function p2ConfirmSelection() {
    if (!player2Card) {
        alert(currentLanguage === "ar" ? "الرجاء اختيار بطاقة أولاً!" : "Please select a card first!");
        return;
    }
    
    document.getElementById("player2-choose").classList.add("hidden");
    document.getElementById("reveal-confirm").classList.remove("hidden");
}

function removeFirstCitizen(cards) {
    const index = cards.indexOf("C");
    if (index !== -1) {
        cards.splice(index, 1);
    }
    return cards;
}

function revealCards() {
    document.getElementById("reveal-confirm").classList.add("hidden");
    document.getElementById("game-board").classList.remove("hidden");
    revealWinner();
}

function revealWinner() {
    let result = "";
    const t = translations[currentLanguage];

    if (player1Card === "E" && player2Card === "C") {
        result = `${player1Name} ${t.won}`;
        scores.player1++;
    } else if (player1Card === "C" && player2Card === "E") {
        result = `${player2Name} ${t.won}`;
        scores.player2++;
    } else if (player1Card === "S" && player2Card === "E") {
        result = `${player1Name} ${t.won}`;
        scores.player1++;
    } else if (player1Card === "E" && player2Card === "S") {
        result = `${player2Name} ${t.won}`;
        scores.player2++;
    } else if (player1Card === "C" && player2Card === "S") {
        result = `${player1Name} ${t.won}`;
        scores.player1++;
    } else if (player1Card === "S" && player2Card === "C") {
        result = `${player2Name} ${t.won}`;
        scores.player2++;
    } else if (player1Card === "C" && player2Card === "C") {
        document.getElementById("draw-animation").classList.remove("hidden");
        removeFirstCitizen(player1Cards);
        removeFirstCitizen(player2Cards);

        document.getElementById("turn-indicator").textContent = translations[currentLanguage].drawMessage;

        setTimeout(() => {
            if (player1Cards.length > 0 && player2Cards.length > 0) {
                currentPlayer = "player1";
                document.getElementById("p1-reconfirm-title").textContent = `${t.stillYou} ${player1Name}?`;
                document.getElementById("player1-reconfirm").classList.remove("hidden");
            } else {
                document.getElementById("turn-indicator").textContent = translations[currentLanguage].gameOver;
                document.getElementById("restart-btn").classList.remove("hidden");
            }
        }, 2000);
        return;
    }

    document.getElementById("turn-indicator").textContent = result;
    document.getElementById("game-board").classList.add("hidden");
    document.getElementById("winner-board").classList.remove("hidden");
    document.getElementById("winner-name").textContent = result;
}

function restartGame() {
    location.reload();
}
