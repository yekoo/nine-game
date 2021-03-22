'use strict';

// const { threadId } = require("worker_threads");

console.log('dobro');

var cardKinds = ["♣","♥","♠","♦"];
var cardLevels = ["6","7","8","9","10","J","Q","K","A"];
var cardStack;

const settings = {
    playersCount: 2,
};

function CardStack(){
    this.stack = null;
    this.handsCards = null;

    this.buildStack = ()=>{
        let arr = [];
        for(let k=0; k<4; k++){
            for(let n=0; n<9; n++){
                let cardObj = {
                    code:k+""+n,
                    kindIdx: k,
                    levelIdx: n,
                    kind: cardKinds[k], 
                    level: cardLevels[n],
                    fullName: ""+cardKinds[k]+cardLevels[n],
                    faceUp: false
                };
                arr.push(cardObj);
            }
        }
        console.log("CARDS STACK:",arr[0]);
        this.stack = arr.slice(0);
        return arr;
    };
    this.shuffle = ()=>{
        let currentStack = this.stack.slice(0);
        let shaked = [];

        for(let i=0; currentStack.length; i++){
            let rand = parseInt( Math.random()*currentStack.length);
            let catchCard = currentStack.splice(rand, 1)[0];
            shaked.push( catchCard );
        }
        this.stack = shaked;//.slice(0);
        return shaked;
    }

    this.divide = (playersCount)=>{
        this.handsCards = [];
        let playerCardsNum = 36/playersCount;
        
        for(let i=0; i<playersCount; i++){
            let handCards = this.stack.splice(0, playerCardsNum);
            this.handsCards.push( handCards );
        }
        return this.handsCards;
    }
}

function Card(kindOrCode, level){
    if(level==undefined){
        this.kindIdx =  Math.floor(+kindOrCode/10);
        this.levelIdx = +kindOrCode%10;
    } else {
        this.kindIdx = +kindOrCode;
        this.levelIdx = +level;
    }
    
    this.code = `${this.kindIdx}${this.levelIdx}`;
    this.html = null;
    this.element = null;
    this.faceDown = true;
    this.onClick = null;

    this.init = (obj)=>{
        this.buildCard(obj);
    }

    this.getName = ()=> this.name;

    this.cardClicked = (e)=>{
        this.onClick(this);
    }

    this.buildCard = (obj)=>{
        this.element = document.createElement("div");
        let cardsFaceUp = obj.user ? "user__card" : "opponent__card"
        this.element.className = "card "+cardsFaceUp;
        let tagClass = this.kindIdx%2 ? "rk" : "bk";
        this.element.insertAdjacentHTML('beforeend', `<div class="faceUp">
            <div class="card__label">
                ${cardLevels[this.levelIdx]}
                <div class="${tagClass}">${cardKinds[this.kindIdx]}</div>
            </div>
            <div class="card__label card__label_bot">
                ${cardLevels[this.levelIdx]}
                <div class="${tagClass}">${cardKinds[this.kindIdx]}</div>
            </div>
        </div>`);
        this.element.addEventListener('click', this.cardClicked);
    }
    
    this.getElement = ()=> this.element;
    return this;
}

function PlayerHand(playerNum, playerCards, handId, playerHuman, cardClicked){
    this.playerNum = playerNum;
    this.cards = playerCards;
    this.elementID = handId;

    this.cards = this.cards.sort( (a, b) => a.code - b.code)
    const handElem = document.getElementById(handId);
    
    for(let cardObj of playerCards){
        let card = new Card(cardObj.code);
        card.onClick = cardClicked;
        card.init({user:playerHuman});
        handElem.appendChild(card.element);
    }

    this.hiliteCards = (properCards)=>{
        console.log("find proper cards",properCards,"in hand",this.cards);
        var result = properCards.filter( (o1)=> {
            return this.cards.some( (o2)=> {
                return o1.level == o2.code;
           });
        });
        console.log( ">>>>>> "+result);
    }

    return this;
}

function KindColumn(element, kind){
    this.columnElement = element;
    this.kindIdx = kind;
    this.kindIcon = cardKinds[kind];
    this.topPart = element.getElementsByClassName("column__cell_top")[0];
    this.midPart = element.getElementsByClassName("column__cell_mid")[0];
    this.botPart = element.getElementsByClassName("column__cell_bot")[0];
    this.cards = {
        top:[],
        mid:[],
        bot:[]
    };
    this.topPlus = null;
    this.midPlus = null;
    this.botPlus = null;
    this.pluses = [];


    this.getProperCards = (userCards)=>{
        const filterdCards = userCards.filter( elm => {
            return +elm.kindIdx == +this.kindIdx;
            });
        // console.log(filterdCards);
        // return this.checkSuitableCards(filterdCards);
        return this.getNextCards();
    }

    /*this.checkSuitableCards = (cardsInHand)=>{
        const cardsToPoceed = this.getNextCards();
        //console.log("~~~ Cards to hilite:",cardsToPoceed);
        return cardsToPoceed;
        //console.log( `если у игрока есть соответствующие карты!`,cardsToPoceed);

        //for(let point of cardsToPoceed){
        //    console.log(typeof point,point);
        //    let plus = this.createPlus(point);
        //}
    }*/
    this.hiliteHandCards = (cards)=>{
        console.log("Cards to hilite:",cards);
    }

    this.createPlus = (point)=>{
        let plusElement = document.createElement("div");
        plusElement.className = "column__plus";
        plusElement.innerText = "+";
        console.log(point.className, this.topPart.className);
        let whereToPut = point.part==this.topPart  ? "afterbegin" : "beforeend";
        console.log("how to insert: "+point);
        point.part.appendChild(plusElement);

        plusElement.addEventListener("click", this.plusClicked);
        this.pluses.push(plusElement);
        //return plusElement;
    }
    this.clearAllPluses = ()=>{
        console.log("PLUS CLICKED!");
        for(let plus of this.pluses){
            plus.removeEventListener("click", this.plusClicked);
            plus.parentNode.removeChild(plus);
        }
        this.pluses = [];
    }
    this.plusClicked = (e)=>{
        this.clearAllPluses();
    }
    
    this.getNextCards = ()=>{
        const emptySpaces = [];
        if( !(this.midPart.children.length-1) ){
            return [{part:this.botPart, level:this.kindIdx+""+3}];
        }
        console.log(">>> ",this.midPart.children.length);

        let topWaiting = this.topPart.children.length+4;
        if(topWaiting<9)
            emptySpaces.push( {
                part: this.topPart, 
                level: this.kindIdx+""+topWaiting
            });

        let botWaiting = 2-this.botPart.children.length;
        if(botWaiting>=0)
            emptySpaces.push( {
                part: this.botPart, 
                level: this.kindIdx+""+botWaiting
            });
        return emptySpaces;
    }
    

    this.putCard = (card)=>{
        // const part = this.getColumnSideByLevel(card.levelIdx);
        if(card.levelIdx==3){
            card.element.className = "card table__card card_9";
            this.midPart.append(card.element);
        }else if(card.levelIdx>3){
            card.element.className = "card table__card";
            this.topPart.prepend(card.element);
        }else{
            card.element.className = "card table__card";
            this.botPart.append(card.element);
        }
        console.log();
    }

    /*this.getColumnSideByLevel = (num)=>{
        if(num==3){
            return "column__cell_mid";
        }else if(num<3){
            return "column__cell_bot";
        }else{
            return "column__cell_top";
        }
    }*/
}

function PhaseLabel(){
    this.HUMAN = "player human";
    this.CPU = "player computer";
    this.currentPlayer;
    this.currentNumber = 0;
    this.element;
    this.playersRow;

    this.setPhase = (num=0)=>{
        this.currentNumber;
        this.element.innerText = num;
    }

    this.init = ()=>{
        this.element = document.getElementById('playerLabel');
        this.setPhase();
    }
    this.buildPlayersRow = (num)=>{

    }
}

// function Game(playersCount){
function Game(settings){
    this.settings = settings;
    this.playersNum = this.settings.playersCount;
    this.cardStack = null;//new CardStack();
    this.dicidedCards = null;
    this.hands = [];
    this.columns = null;
    this.columnObjs = null;
    this.currentPlayerNum = null;
    this.humanIndex;
    
    this.init = ()=>{
        // this.currentPlayerNum = this.playersNum-1;
        this.cardStack = new CardStack();
        this.cardStack.buildStack();
        this.cardStack.shuffle();
        
        this.dividedCards = this.cardStack.divide(this.playersNum);
        
        this.initColumns();
        this.createHands(this.dividedCards);
        this.columns = document.getElementsByClassName("kind__column");
        this.humanIndex = this.settings.playersCount-1;
        this.currentPlayerNum = this.findFirstPlayer(); //Math.floor(Math.random()*this.playersNum);

    }


    this.cardClicked = (card)=>{
        const cardCode = card.code;
        const idx = this.dividedCards[this.currentPlayerNum].findIndex((elm)=>{
            return +elm.code == +cardCode;
        });
        this.dividedCards[this.currentPlayerNum].splice(idx,1);
        
        this.columnObjs[card.kindIdx].putCard(card);

        this.showAllowedCards();
    }

    this.createHands = (handsCardArray)=>{
        const handElementId = this.getActiveHands(handsCardArray.length);
        
        for(let i=0; i<handsCardArray.length; i++){
            let handObject = new PlayerHand(
                i, handsCardArray[i], handElementId[i], 
                (i===(handsCardArray.length-1)), this.cardClicked );
            this.hands.push(handObject);
        }
    }

    this.findFirstPlayer = ()=>{
        // console.log("hands to look for 9",this.hands);
        for(let i=0; i<this.hands.length; i++){
            let found9=this.hands[i].cards.some( (elm)=>{
                return elm.code=="33";
            });

            if(found9){
                console.log("Hand index with 9 is "+i);
                return i;
            }
        }
    }

    this.initColumns = ()=>{
        this.columnObjs = [];
        let allColumnElements = document.getElementsByClassName("kind__column");
        for(let i=0; i<cardKinds.length; i++){
            const column = new KindColumn(allColumnElements[i], i);
            this.columnObjs.push(column);
        }
    }

    this.getActiveHands = (count)=>{
        switch(count){
            case 2:
                return ["opp__hand_top","user__hand"];
            case 3:
                return ["opp__hand_right", "opp__hand_left","user__hand"];
            case 4:
                return ["opp__hand_top", "opp__hand_right", "opp__hand_left","user__hand"];
        }
    }
    this.startNewGame = ()=>{
        this.init();
        // this.getCurrrentPlayer();
        //this.showAllowedCards();

        this.nextTurn();
    }
    this.nextTurn = ()=>{
        let cardsToGo =this.showAllowedCards();
        if(this.currentPlayerNum != this.humanIndex){
            this.computerThink(cardsToGo);
        }else{
            this.humanThink(cardsToGo);
        }
    }

    this.computerThink = (properArr)=>{
        console.log("COMPUTER TURN");
    }
    this.humanThink = (properArr)=>{
        console.log("HUMAN TURN");
        // this.hands[this.humanIndex];
        // this.hiliteHandCards(properArr);
        this.hands[this.humanIndex].hiliteCards(properArr);
    }
    this.changePlayer = ()=>{

    }

    this.showAllowedCards = ()=>{
        const currentPlayer = this.hands[this.currentPlayerNum];
        const properCards = [];
        for(let column of this.columnObjs){    //  список HTML элементов, а не массив объектов
            properCards.push(...column.getProperCards(currentPlayer.cards));
        }
        return properCards;
    }

    this.gameStepInit = ()=>{

    }
}



var phaseLabel = new PhaseLabel();

var gameSettings = {
    playersCount: 2,
    phaseLabel,
}
var game = new Game(gameSettings);
game.startNewGame();