class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
        <div class="card" data-name="${this.name}">
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">
                    <img src="${this.img}" alt="${this.name}">
                </div>
            </div>
        </div>
    `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }
    //cambio
    toggleFlip(){
        this.isFlipped = !this.isFlipped;
        if (this.isFlipped) {
            this.#flip();
        }else {
            this.#unflip();
        }
    }

    matches(otherCard) {
        return this.name === otherCard.name;
    }//fin
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    shuffleCards() { //cambio
        this.cards.sort(() => Math.random() - 0.5);
    }

    reset() {
        this.shuffleCards();
        this.cards.forEach(card => card.isFlipped = false);
        this.render();
    }

    flipDownAllCards() {
        this.cards.forEach(card => {
            if (card.isFlipped) {
                card.toggleFlip();
            }
        });
    }  //fin
    

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        this.moveCount = 0;   //  agrego cambio
        this.startTime = null;
        this.endTime = null;
        this.timerInterval = null;  //fin cambio
        
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.startGame(); // Agrego cambio en esta linea
    }

    startGame() { // agrego metodo
        this.startTime = new Date();
        this.timerInterval = setInterval(() => this.updateGameInfo(), 1000);
    }

    updateGameInfo() {
        this.moveCount++;
        const elapsedSeconds = Math.floor((new Date() - this.startTime) / 1000);
        const score = this.calculateScore(elapsedSeconds, this.moveCount);
        this.displayGameInfo(this.moveCount, elapsedSeconds, score);
    }

    displayGameInfo(moves, time, score) {
        document.getElementById("move-counter").textContent = `Movimientos: ${moves}`;
        document.getElementById("timer").textContent = `Tiempo: ${time}s`;
        document.getElementById("score").textContent = `Puntuación: ${score}`;
    }  //fin cambio

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }

    checkForMatch() {   //agrego metodos, cambios
        const [firstCard, secondCard] = this.flippedCards;
        if (firstCard.matches(secondCard)) {
            this.matchedCards.push(firstCard, secondCard);
            this.flippedCards = [];
            if (this.matchedCards.length === this.board.cards.length) {
                clearInterval(this.timerInterval);
                this.endTime = new Date();
                const timeTaken = (this.endTime - this.startTime) / 1000;
                const score = this.calculateScore(timeTaken, this.moveCount);
                alert(`¡Has ganado! Tiempo: ${timeTaken} segundos, Movimientos: ${this.moveCount}, Puntuación: ${score}`);
            }
        } else {
            setTimeout(() => {
                firstCard.toggleFlip();
                secondCard.toggleFlip();
                this.flippedCards = [];
            }, this.flipDuration);
        }
    }

    calculateScore(time, moves) {
        return Math.max(1000 - (time + moves * 10), 0);
    }

    resetGame() {
        clearInterval(this.timerInterval);
        this.flippedCards = [];
        this.matchedCards = [];
        this.moveCount = 0;
        this.startTime = null;
        this.endTime = null;
        this.board.reset();
        this.startGame();
    }   //fin cambio
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});

