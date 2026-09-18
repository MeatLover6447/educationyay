const suits = ['♠', '♣', '♥', '♦'];
const values = [
    { name: '2', val: 2 }, { name: '3', val: 3 }, { name: '4', val: 4 },
    { name: '5', val: 5 }, { name: '6', val: 6 }, { name: '7', val: 7 },
    { name: '8', val: 8 }, { name: '9', val: 9 }, { name: '10', val: 10 },
    { name: 'J', val: 10 }, { name: 'Q', val: 10 }, { name: 'K', val: 10 },
    { name: 'A', val: 11 }
];

let deck = [];
let hand = [];
let selectedCards = [];
let jokers = [];

let stats = {
    round: 1,
    score: 0,
    target: 300,
    money: 4,
    handsLeft: 4,
    discardsLeft: 3
};

const shopPool = [
    { name: "+20 Mult Joker", desc: "+20 Mult", cost: 4, apply: (s) => s.mult += 20 },
    { name: "Double Chips", desc: "Chips x2", cost: 6, apply: (s) => s.chips *= 2 }
];

function initGame() {
    createDeck();
    shuffleDeck();
    drawHand();
    updateUI();
}

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let val of values) {
            deck.push({ suit, ...val, id: Math.random() });
        }
    }
}

function shuffleDeck() {
    deck.sort(() => Math.random() - 0.5);
}

function drawHand() {
    while (hand.length < 8 && deck.length > 0) {
        hand.push(deck.pop());
    }
}

function renderCards() {
    const handContainer = document.getElementById('hand-container');
    const selectedContainer = document.getElementById('selected-container');
    const jokersContainer = document.getElementById('jokers-container');

    handContainer.innerHTML = '';
    selectedContainer.innerHTML = '';
    jokersContainer.innerHTML = '';

    hand.forEach(card => {
        handContainer.appendChild(createCardElement(card, false));
    });

    selectedCards.forEach(card => {
        selectedContainer.appendChild(createCardElement(card, true));
    });

    jokers.forEach(joker => {
        const div = document.createElement('div');
        div.className = 'card joker';
        div.innerHTML = `<strong>${joker.name}</strong><br><small>${joker.desc}</small>`;
        jokersContainer.appendChild(div);
    });
}

function createCardElement(card, isSelected) {
    const div = document.createElement('div');
    const isRed = card.suit === '♥' || card.suit === '♦';
    div.className = `card ${isRed ? 'red' : 'black'} ${isSelected ? 'selected' : ''}`;
    div.innerHTML = `
        <span>${card.name}</span>
        <span style="font-size: 1.5rem; align-self: center;">${card.suit}</span>
        <span style="align-self: flex-end;">${card.name}</span>
    `;
    div.onclick = () => toggleCardSelect(card);
    return div;
}

function toggleCardSelect(card) {
    if (selectedCards.includes(card)) {
        selectedCards = selectedCards.filter(c => c !== card);
        hand.push(card);
    } else {
        if (selectedCards.length >= 5) return;
        selectedCards.push(card);
        hand = hand.filter(c => c !== card);
    }
    renderCards();
}

function discardCards() {
    if (stats.discardsLeft <= 0 || selectedCards.length === 0) return;
    stats.discardsLeft--;
    selectedCards = [];
    drawHand();
    updateUI();
}

function playHand() {
    if (selectedCards.length === 0 || stats.handsLeft <= 0) return;

    stats.handsLeft--;
    
    // Simple scoring logic (Sum of card values * number of cards)
    let baseChips = selectedCards.reduce((sum, card) => sum + card.val, 0);
    let mult = selectedCards.length;

    // Apply Jokers
    let scoreObj = { chips: baseChips, mult: mult };
    jokers.forEach(j => j.apply(scoreObj));

    let handScore = scoreObj.chips * scoreObj.mult;
    stats.score += handScore;

    selectedCards = [];
    drawHand();
    updateUI();

    checkRoundStatus();
}

function checkRoundStatus() {
    if (stats.score >= stats.target) {
        openShop();
    } else if (stats.handsLeft <= 0) {
        alert("Game Over! Restarting...");
        resetGame();
    }
}

function openShop() {
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    
    shopPool.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'card joker';
        div.innerHTML = `<strong>${item.name}</strong><br><small>${item.desc}</small><br>$${item.cost}`;
        div.onclick = () => buyJoker(index);
        shopItems.appendChild(div);
    });

    document.getElementById('shop-modal').classList.remove('hidden');
}

function buyJoker(index) {
    let item = shopPool[index];
    if (stats.money >= item.cost) {
        stats.money -= item.cost;
        jokers.push(item);
        shopPool.splice(index, 1);
        openShop(); // Refresh shop
    } else {
        alert("Not enough money!");
    }
}

function closeShop() {
    document.getElementById('shop-modal').classList.add('hidden');
    stats.round++;
    stats.target = Math.floor(stats.target * 1.5);
    stats.handsLeft = 4;
    stats.discardsLeft = 3;
    stats.money += 4;
    createDeck();
    shuffleDeck();
    hand = [];
    drawHand();
    updateUI();
}

function resetGame() {
    stats = { round: 1, score: 0, target: 300, money: 4, handsLeft: 4, disardsLeft: 3 };
    jokers = [];
    initGame();
}

function updateUI() {
    document.getElementById('round-num').innerText = stats.round;
    document.getElementById('current-score').innerText = stats.score;
    document.getElementById('target-score').innerText = stats.target;
    document.getElementById('money').innerText = stats.money;
    document.getElementById('hands-left').innerText = stats.handsLeft;
    document.getElementById('discards-left').innerText = stats.discardsLeft;
    renderCards();
}

initGame();
