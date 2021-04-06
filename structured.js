'use strict';



function Card(suit, suitChar, rank, rankChar){
    this.suit = suit;
    this.suitChar = suitChar;
    this.rank = rank;
    this.rankChar = rankChar;
    this.code = suit+""+rank;
    this.onClick = null;
    // faceUp:null,
    this.domElement = null;
    this.getElement = ()=>{
        return this.domElement;
    };
    this.setFaceUp = (how)=>{
        const faceStateClassName = how ? "user__card" : "opponent__card";
        this.domElement.classList.add(faceStateClassName);
    };
    this.buildCardElement = (user = false)=>{
        this.domElement = document.createElement("div");
        this.domElement.dataset.code = this.code;
        let cardsFaceUp = user ? "user__card" : "opponent__card"
        this.domElement.className = "card "+cardsFaceUp;
        let tagClass = this.suit%2 ? "rk" : "bk";
        
        this.domElement.insertAdjacentHTML('beforeend', `<div class="faceUp">
            <div class="card__label">
                ${this.rankChar}
                <div class="${tagClass}">${this.suitChar}</div>
            </div>
            <div class="card__label card__label_bot">
                ${this.rankChar}
                <div class="${tagClass}">${this.suitChar}</div>
            </div>
        </div>`);
        // this.domElement.addEventListener('click', this.cardClicked);
    };
    this.setOnClick = (handler)=>{
        this.onClick = handler;
        this.domElement.addEventListener("click", this.onClick);
    }
};

function Hand(handId, userHand){
    this.domElement = document.getElementById(handId);
    this.getElement = ()=>{ return this.domElement};
    this.cards = null;// []

    this.setOnClick = (handler)=>{
        console.log("Hand click handler setting");
        for(let c=0; c<this.cards.length; c++){
            this.cards[c].setOnClick(handler);
        }
    };
    this.setCardsFaceUp = (how)=>{
        for(let c=0; c<this.cards.length; c++){
            this.cards[c].setFaceUp(how);
        }
    };
    this.hiliteProperCards = ()=>{};
    this.fillCards = (cardArr)=>{
        this.cards = cardArr;
        for(let c=0; c<cardArr.length; c++){
            this.domElement.appendChild(cardArr[c].domElement);
        }
    }
    this.hasOneOfCards = (cards)=>{
        var result = cards.filter( (o1)=> {
            return this.cards.some( (o2)=> {
                return (o1.code == o2.code);
            });
        });
        //console.log(result," is result and PROPER CARDS",this.cards, cards);
        return result;
        
    }
    this.computerChoose = (tableWaitings, gameInsertHandler, nextTurnHandler)=>{
        
        // console.log("CPU",tableWaitings, this.cards);
        let chosenCard = tableWaitings[0];
        // console.log("{{{",tableWaitings[0]);
        setTimeout(() => {
            gameInsertHandler(chosenCard.domElement);
            nextTurnHandler();
        }, 1300);
    }
    this.isHandEmpty = ()=>{
        console.log(this.cards.length);
        return this.cards.length==0;
    }
}

function Column(element, suit, suitChar){
    // console.log(element, suit, suitChar);
    this.domElement = element;//document.getElementById(colId);
    this.suit = suit;
    this.suitChar = suitChar;
    let partsElems = this.domElement.children;
    this.topPart=partsElems[0];
    this.midPart=partsElems[1];
    this.botPart=partsElems[2];

    this.putCard = (elem, rank)=>{
        /*if(rank==3){
            this.midPart.appendChild(elem);
        }*/
        //  table__card, card_9
        if(rank==3){
            elem.className = "card table__card card_9";
            this.midPart.append(elem);
        }else if(rank>3){
            elem.className = "card table__card";
            this.topPart.prepend(elem);
        }else{
            elem.className = "card table__card";
            this.botPart.append(elem);
        }
    },

    this.getSuitWaitingCards = ()=>{
        //  ->  [{suit:0, rank:3}]
        const emptySpaces = [];
        if( !(this.midPart.children.length-1) ){
            return [{suit:this.suit, rank:3, code:(this.suit+""+3)}];
        }
        // console.log(">>> ",this.midPart.children.length);

        let topWaiting = this.topPart.children.length+4;
        if(topWaiting<9)
            emptySpaces.push( {
                part: this.topPart, 
                suit: this.suit,
                rank: topWaiting,
                code: (this.suit+""+topWaiting),
            });

        let botWaiting = 2-this.botPart.children.length;
        if(botWaiting>=0)
            emptySpaces.push( {
                part: this.botPart, 
                suit: this.suit,
                rank: botWaiting,
                code: (this.suit+""+botWaiting),
            });
        return emptySpaces;
    }
}

let game = {
    playersNum:null,
    currentPlayer:0,
    playerDomLabel:null,

    initGame(playersNum){
        this.playersNum = playersNum;
        this.dataStack.generateStack();
        this.dataStack.shuffleCards();
        
        const dividedStack = this.dataStack.divideStack(this.playersNum);
        this.hands.fill(dividedStack);
        // this.hands[playersNum-1].setOnClick();
        this.hands.setUserCardOnClick((e)=>{this.playerCardClick(e);});
        
        this.table.setPlayersCount(this.playersNum);
        this.table.buildColumns( this.dataStack.getSuits() );
        this.playerLabel.init(playersNum, "playerLabel");
    },
    playerCardClick(e){
        this.table.changePlayer(this.currentPlayer);
        this.table.insertCard(e.target);
        this.nextPlayerTurn();
    },
    startGame(){
        //  найти первого игрока
        this.currentPlayer = this.findFirstPlayer();
        // console.log("===== "+this.currentPlayer);
        this.playerTurn();
        
    },
    
    playerTurn(){
        //  получить массив ожидаемых на столе карт
        const waitingCards = this.table.getWaitingCards();
        //  собрать все икомые объекты Карт из колоды
        const gatheredCards = this.gatherConcreteCards(waitingCards);
        //  сверить КАРТЫ текущего игрока с ожидаемыми картами на столе
        let currentHand = this.hands.getHand(this.currentPlayer)
        let hasProperCards = currentHand.hasOneOfCards(waitingCards);

        if(gatheredCards.length==0 && !currentHand.isHandEmpty()){
            this.playerPass();
            return;
        }

        //  определить, ткущий игрок это, ЧЕЛОВЕК или КОМП
        const itPlayerHuman = this.isPlayerHuman();
        if(itPlayerHuman){
            //      ЧЕЛОВЕК: сделать карты руки доступными для мыши
            console.log("ALLOW HAND MOUSE");
            this.hands.allowUserHand(true);
            //  одидание клика:
        }else{
            console.log("BLOCK HAND MOUSE");
            this.hands.allowUserHand(false);
            //      КОМП:    выбрать карту для хода
            this.hands.getHandObjs()[this.currentPlayer].computerChoose(
                gatheredCards,
                (card)=>{this.table.insertCard(card)},
                ()=>this.nextPlayerTurn());
        }
        
        this.changePlayerLabel(this.currentPlayer);
    },
    changePlayerLabel(idx){
        this.playerLabel.change(idx);
    },
    playerPass(){
        // alert("No cards to move... PASS");
        console.info("NO CARDS!!!!!!!!!!!!!!");
        this.nextPlayerTurn();
    },
    playerWon(idx){
        console.info(` ' '' ' ' '' Player №${idx} has WON!`);
    },
    isPlayerHuman(){
        return this.currentPlayer==(this.playersNum-1);
    },
    gatherConcreteCards(waitingObjs){
        //  взять колоду карт и найти там соответствующие КОДУ карты
        let cardObjs = [];

        // console.log(this.hands.getHandObjs()[this.currentPlayer].cards);
        for(let obj of waitingObjs){
            let card = this.hands.getHandObjs()[this.currentPlayer].cards.find(crd => crd.code==obj.code)
            if(card)
                cardObjs.push(card);
        }
        // console.log(cardObjs);
        return cardObjs;
    },
    nextPlayerTurn(){
        if( this.checkCardsOver(this.currentPlayer) ){
            alert("FINISHED by "+this.currentPlayer+" player ((x")
            return;
        }
        let cruNum = this.currentPlayer + 1;
        cruNum = cruNum>=this.playersNum ? 0 : cruNum;
        this.currentPlayer = cruNum;
        this.table.changePlayer(this.currentPlayer);
        this.playerTurn();
    },
    findFirstPlayer(){
        // console.log(">>>", this.hands.getHandObjs());
        const allHands = this.hands.getHandObjs();
        for(let i=0; i<allHands.length; i++){
            let found9=allHands[i].cards.some( (elm)=>{
                return elm.code=="33";
            });

            if(found9){
                return i;
            }
        }
    },
    checkCardsOver(playerNum){
        console.log(this.hands.getHandObjs()[this.currentPlayer]);
        const isOver = this.hands.getHandObjs()[this.currentPlayer].isHandEmpty()
        console.log('Check is all player cards is over? '+isOver);
        return isOver;
    },

    playerLabel:{
        labelChars:null,
        count:0,
        playerCountLabels:null,
        domElement:null,
        init(count, domElemId){
            this.count = count;
            this.labelChars = ["↑","→","↓","←"];
            this.playerCoundLabels = [
                0,0,[this.labelChars[0],this.labelChars[2]],
                [this.labelChars[3],this.labelChars[1],this.labelChars[2]],
                [this.labelChars[3],this.labelChars[0],this.labelChars[1],this.labelChars[2]],
            ];
            this.playerCountLabels = this.playerCoundLabels[count];
            this.domElement = document.getElementById(domElemId);
        },
        change(idx){
            this.domElement.innerText = this.playerCountLabels[idx];
        }
    },

    dataStack:{
        cardSuits:["♣","♥","♠","♦"],
        cardRanks:["6","7","8","9","10","J","Q","K","A"],
        cards:null,
        handsCards:null,
        getSuits(){ return this.cardSuits; },

        generateStack(){    
            let arr = [];
            for(let suit=0; suit<4; suit++){
                for(let rr=0; rr<9; rr++){
                    let cardObj = new Card(suit, this.cardSuits[suit], rr, this.cardRanks[rr]);
                    cardObj.buildCardElement(true);
                    arr.push(cardObj);
                }
            }
            this.cards = arr;
        },

        shuffleCards(){
            let currentStack = this.cards.slice(0);
            let shaked = [];
    
            for(let i=0; currentStack.length; i++){
                let rand = parseInt( Math.random()*currentStack.length);
                let catchCard = currentStack.splice(rand, 1)[0];
                shaked.push( catchCard );
            }
            this.cards = shaked.slice(0);
            return shaked;
        },
        divideStack(playersCount){
            this.handsCards = [];
            let playerCardsNum = 36/playersCount;
            
            for(let i=0; i<playersCount; i++){
                let handCards = this.cards.splice(0, playerCardsNum);
                this.handsCards.push( handCards );
            }
            return this.handsCards;
        },
    },

    table:{
        tableElement:null,
        columns:null,
        getCard:null,
        playersCount:null,
        animationClassesReserve:[null, null,
            "putCardFromLeft",
            "putCardFromTop",
            "putCardFromRight",
            "putCardFromUser",
        ],
        animationClasses:[null, null,
            ["putCardFromTop","putCardFromUser"],
            ["putCardFromLeft","putCardFromRight","putCardFromUser"],
            ["putCardFromLeft","putCardFromTop","putCardFromRight","putCardFromUser"],
        ],
        currentPlayer:0,

        // putCard(card){},

        columns:[],

        setPlayersCount(num){
            this.playersCount = num;
        },

        buildColumns(suits){
            this.columns=[];
            this.tableElement = document.getElementById("table");
            this.columnElements = document.getElementsByClassName("suit_column");
            for(let i=0; i<suits.length; i++){
                let column = new Column(this.columnElements[i], i, suits[i]);
                this.columns.push(column);
            }
        },
        getWaitingCards(){
            let allWaitingCards = [];
            for(let col of this.columns){
                allWaitingCards.push(... col.getSuitWaitingCards());
            }
             if(allWaitingCards.some((elm)=>{
                return (elm.rank+""+elm.suit)=="33";
            }) ){
                return [{rank:3, suit:3, code:"33"}];
            }
            return allWaitingCards;
        },
        getFilteredSuits(allCards){
            let suitedCards = [[],[],[],[]];
            for(let card of allCards){
                suitedCards[card.suit].push(card);
            }
            return suitedCards;
        },
        changePlayer(num){
            this.currentPlayer = num;
        },
        insertCard(cardElem){
            // console.log(cardElem);
            let cardCode = cardElem.dataset.code;
            let cardSuit = +cardCode[0];
            let cardRank = +cardCode[1];
            // console.log(this+" -> Clicked card props: "+cardSuit+" "+cardRank);
            this.columns[cardSuit].putCard(cardElem, cardRank);
            // cardElem.classList.add( animationClasses[this.currentPlayer] );
            const animationClass = this.animationClasses[this.playersCount][this.currentPlayer] 
            console.log(this.playersCount+" - "+this.currentPlayer+"%%%%%%%%%%%%%%%%% "+animationClass);
            cardElem.classList.add(animationClass);
        },

        

    },
    

    hands:{
        handsElements:null,
        handObjs:[],
        userHand:null,

        getHand(idx){
            return this.handObjs[idx];
        },
        getHandObjs(){
            return this.handObjs;
        },
        getUserHand(){
            return this.handsElements[this.handsElements.length-1];
        },
        allowUserHand(how){
            let pointerMode = "pointer-events:";
            if(how)
                pointerMode+="auto;";
            else
                pointerMode+="none;";
            this.userHand.domElement.style=pointerMode;
        },
        fill(handsCards){
            this.handsElements = this.getActiveHands(handsCards.length);

            for(let h=0; h<this.handsElements.length; h++){
                const hand = new Hand(this.handsElements[h]);
                hand.fillCards(handsCards[h]);
                this.handObjs.push(hand);
                if(h<this.handsElements.length-1)
                    hand.setCardsFaceUp(false);
            }
            this.userHand = this.handObjs[this.handObjs.length-1];
        },
        setUserCardOnClick(handler){
            this.handObjs[this.handObjs.length-1].setOnClick(handler);
        },
        
        getActiveHands(count){
            switch(count){
                case 2:
                    return ["opp__hand_top","user__hand"];
                case 3:
                    return ["opp__hand_left", "opp__hand_right", "user__hand"];
                case 4:
                    return ["opp__hand_left", "opp__hand_top", "opp__hand_right", "user__hand"];
            }
        },
    }
}

function showMenu(){
    
}
function hideMenu(){
    const menuElem = document.getElementById("menu");
    menuElem.style = "display:none;";
}
function startGame(playersNum){
    // alert("START");
    hideMenu();
    game.initGame(playersNum);
    game.startGame();
}