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
    this.hiliteAsSuitable = ()=>{
        this.domElement.classList.add("user__card_suitable");
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
    this.cardOnClick = null;


    this.setOnClick = (handler)=>{
        // console.log("Hand click handler setting");
        this.cardOnClick = handler;
        /*for(let c=0; c<this.cards.length; c++){
            this.cards[c].setOnClick(handler);
        }*/
    };
    this.setCardsFaceUp = (how)=>{
        for(let c=0; c<this.cards.length; c++){
            this.cards[c].setFaceUp(how);
        }
    };
    this.hiliteProperCards = (suitable)=>{
        for(let card of suitable){
            let properCard = this.cards.find(elm => `${elm.code}` === `${card.code}`);
            if(properCard) {
                properCard.setOnClick(this.cardOnClick);
                properCard.hiliteAsSuitable();
            };
        }
    };
    this.fillCards = (cardArr)=>{
        this.cards = cardArr;
        for(let c=0; c<cardArr.length; c++){
            this.domElement.appendChild(cardArr[c].domElement);
        }
    }
    this.clearHand = ()=>{
        this.domElement.textContent = "";
    };
    this.hasOneOfCards = (cards)=>{
        var result = cards.filter( (o1)=> {
            return this.cards.some( (o2)=> {
                return (o1.code == o2.code);
            });
        });
        return result;
        
    }
    this.computerChoose = (tableWaitings, gameInsertHandler, nextTurnHandler)=>{
        let chosenCard = this.easyCpuChoose(tableWaitings);
        // console.log("{{{",tableWaitings[0]);
        this.findAndRemoveCard(chosenCard);
        setTimeout(() => {
            gameInsertHandler(chosenCard.domElement);
            nextTurnHandler();
        }, 200);
        //  1900
    }
    this.findAndRemoveCard = (card)=>{
        const index = this.cards.findIndex((element, index) => {
            if (card.code === element.code) {
                return true
            }
        });
        // console.log("Card in array found!"+index);
        this.cards.splice(index, 1);
    }
    this.easyCpuChoose = (waitingCards)=>{
        const randIdx = Math.floor( Math.random() * (waitingCards.length-1));
        return waitingCards[randIdx];
    }
    this.masterCpuChoose = ()=>{

    }
    this.isHandEmpty = ()=>{
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
    },
    this.clearColumn = ()=>{
        console.log("Clear column");
        // this.domElement.textContent = "";
        this.topPart.textContent = "";
        // this.midPart.textContent = "";
        // console.log(">>> ", this.midPart, this.midPart.children);
        for( let card of this.midPart.children){
            // console.log(card.className);
            if(card.className != "column__kind-symbol")
                card.remove();
        }
        //  убрать отличные от .column__kind-symbol карты
        this.botPart.textContent = "";
    }
}

let game = {
    playersNum:null,
    currentPlayer:0,
    initGame(playersNum){
        this.playersNum = playersNum;
        this.dataStack.generateStack();
        this.dataStack.shuffleCards();
        const dividedStack = this.dataStack.divideStack(this.playersNum);
        // console.log(">>>>>>>",dividedStack);
        this.hands.fill(dividedStack);
        
        this.hands.setUserCardOnClick((e)=>{this.playerCardClick(e);});
        
        this.table.setPlayersCount(this.playersNum);
        this.table.buildColumns( this.dataStack.getSuits() );
        this.playerLabel.init(playersNum, "playerLabel");
    },
    playerCardClick(e){
        const clickedCardCode = e.target.getAttribute("data-code");
        this.hands.getHandObject(this.currentPlayer).findAndRemoveCard({code:clickedCardCode})
        this.table.changePlayer(this.currentPlayer);
        this.table.insertCard(e.target);

        const userHandEmpty = this.hands.getHandObject( this.currentPlayer).isHandEmpty();
        // console.log(userHandEmpty);
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

        //alert("~ ~ ~ ~ > HIs hand empty? "+currentHand.cards.length);
        // console.log("> > > > > ",this.hands);
        if(currentHand.isHandEmpty()){
            alert("~~~~~~~~~~> Hand empty. The winner is "+this.currentPlayer);
        }else if(gatheredCards.length==0){
            this.playerPass();
            return;
        }
        
        //  определить, ткущий игрок это, ЧЕЛОВЕК или КОМП
        const itPlayerHuman = this.isPlayerHuman();
        if(itPlayerHuman){
            //      ЧЕЛОВЕК: сделать карты руки доступными для мыши
            // console.log("ALLOW HAND MOUSE");
            this.hands.userHand.hiliteProperCards(hasProperCards);
            this.hands.allowUserHand(true);
            //  одидание клика:
        }else{
            // console.log("BLOCK HAND MOUSE");
            this.hands.allowUserHand(false);
            //      КОМП:    выбрать карту для хода
            this.hands.getHandObject(this.currentPlayer).computerChoose(
                gatheredCards,
                (card)=>{this.table.insertCard(card)},
                ()=>this.nextPlayerTurn()
            );
        }
        
        this.changePlayerLabel(this.currentPlayer);
    },
    changePlayerLabel(idx){
        this.playerLabel.change(idx);
    },
    playerPass(){
        this.nextPlayerTurn();
    },
    isPlayerHuman(){
        console.log("isPlayerHuman()",this.currentPlayer);
        return this.currentPlayer==(this.playersNum-1);
    },
    gatherConcreteCards(waitingObjs){
        //  взять колоду карт и найти там соответствующие КОДУ карты
        let cardObjs = [];

        for(let obj of waitingObjs){
            let card = this.hands.getHandObject(this.currentPlayer).cards.find(crd => crd.code==obj.code)
            if(card)
                cardObjs.push(card);
        }
        return cardObjs;
    },
    nextPlayerTurn(){
        if( this.checkCardsOver(this.currentPlayer) ){
            // debugger;
            
            const restart = this.showCongratulation(this.currentPlayer)
            /*if(restart) {
                this.hideCongratulation();
                this.vanishGame();
                //  очистить все данные
                //  аккуратно убрать созданные DOM-элементы
                this.initGame(this.playersNum);
                this.startGame();
            }else{
                //this.vanishGame();
                //showMenu();
            }*/
            console.log(this.currentPlayer +" - finished");
            // showMenu();
            return;
        }
        let cruNum = this.currentPlayer + 1;
        cruNum = cruNum>=this.playersNum ? 0 : cruNum;
        // cruNum = cruNum%this.playersNum;// ? 0 : cruNum;
        console.log("cruNum: "+cruNum);
        this.currentPlayer = cruNum;
        this.table.changePlayer(this.currentPlayer);
        this.playerTurn();
    },
    showCongratulation(playerNum){
        console.log("Show COngrats!", congratsWin);
        //congratsWin.classList.add("congratulations_show");
        // congratsWin.style = {opacity:1, top: 0, display: "block"};
        congratsWin.style = "display: block; opacity:1; top: 0;";
        //return confirm("11111111111! "+this.currentPlayer+" player. /nDo you want to start a new game?")
    },
    hideCongratulation(){
        congratsWin.style = "";
        // congratsWin.classList.remove("congratulations_show");
    },
    restartCurrentGame(){
        this.hideCongratulation();
        this.vanishGame();
        this.hideCongratulation();
        this.initGame(this.playersNum);
        this.startGame();
    },
    gotoMenu(){

    },
    findFirstPlayer(){
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
        // console.log(this.hands.getHandObject(this.currentPlayer));
        const isOver = this.hands.getHandObject(this.currentPlayer).isHandEmpty()
        // console.log('Check is all player cards is over? '+isOver);
        return isOver;
    },

    vanishGame(){
         this.hands.clear();
         this.table.clearTable();
        //  console.log("no more game, just clear hand/table");
        //  clear all variables

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
            let playerCardsNum = this.cards.length/playersCount;
            
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
            // console.log("Start to create arr allWaitingCards");
            for(let col of this.columns){
                allWaitingCards.push(... col.getSuitWaitingCards());
            }
            // console.log("created arr allWaitingCards", allWaitingCards);
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
            /*  отправка Карты на Стол*/
            let cardCode = cardElem.dataset.code;
            let cardSuit = +cardCode[0];
            let cardRank = +cardCode[1];
            
            this.columns[cardSuit].putCard(cardElem, cardRank);
            
            const animationClass = this.animationClasses[this.playersCount][this.currentPlayer] 
            
            cardElem.classList.add(animationClass);
        },

        clearTable(){
            console.log("Clear table");
            for(const column of this.columns){
                column.clearColumn();
            }
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
        getHandObject(idx){
            return this.handObjs[idx];
        },
        getUserHand(){
            return this.handsElements[this.handsElements.length-1];
        },
        allowUserHand(how){
            // console.log(this.userHand);
            /*const allowedCards = this.userHand.domElement.children.filter((elm)=>{
                elm.classList.some(".user__card_suitable")});
            console.log("+++++++++++>",allowedCards);*/
            // const allowedCards = [];
            for(let i=0; i<this.userHand.domElement.children.length; i++){
                this.userHand.domElement.children[i].style = "pointer-events:"+(how?"auto":"none");
            }
            
        },
        
        
        fill(handsCards){
            this.handsElements = this.getActiveHands(handsCards.length);
            // console.log(this.handsElements);
            for(let h=0; h<this.handsElements.length; h++){
                const hand = new Hand(this.handsElements[h]);
                hand.fillCards(handsCards[h]);
                this.handObjs.push(hand);
                if(h<this.handsElements.length-1)
                    hand.setCardsFaceUp(false);
            }
            this.userHand = this.handObjs[this.handObjs.length-1];
        },
        clear(){
            for(let hand of this.handObjs){
                hand.clearHand();
            }
            this.handObjs = [];
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



const back_btn = document.getElementsByClassName("back_btn")[0];

back_btn.onclick = ()=>{showMenu()};

function showMenu(){
    const menuElem = document.getElementById("menu");
    game.vanishGame();
    menuElem.style = "display:block;";
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

const congratsWin = document.getElementsByClassName("congratulations")[0];
const congratsWin__restart = document.getElementById("congr-repeat");
const congratsWin__menu   = document.getElementById("congr-menu");

//console.log(congratsWin, congratsWin__repeat, congratsWin__menu);
congratsWin__restart.onclick = ()=>{
    game.hideCongratulation();
    console.log("RESTART");
    game.restartCurrentGame();
}