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

function Hand(handId, handIdx, cpuLevel){
    this.domElement = document.getElementById(handId);
    this.getElement = ()=>{ return this.domElement};
    this.cards = null;// []
    this.cardOnClick = null;
    this.handIdx = handIdx;
    this.cpuLevel = cpuLevel;

    this.cardsInARow = null;
    this.kindTails = null;
    //this.cardKindRows = null;


    this.setOnClick = (handler)=>{
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
        console.log(">>>>>>>>> FILLACRDS(), RAZDACHA KART PO PUKAM");
        this.cards = cardArr;
        this.cardsInARow = this.findRowedCards(this.cards);
        this.kindTails = this.findAllTails(this.cards);
        console.log("FillCards");
        console.log("cardsInARow:",this.cardsInARow, "kindTails", this.kindTails);
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
    this.computerChoose = (playerHandCards, gameInsertHandler, nextTurnHandler, cpuLevel, tableWaitingCards)=>{
        //let chosenCard = this.easyCpuChoose(tableWaitings);
        // console.log(">>>>>>>>>>>>>>>>>>>>>>>>> level:",{playerHandCards, cpuLevel, tableWaitingCards});
        let chosenCard = cpuLevel=="normal" ? 
                this.easyCpuChoose(playerHandCards) : 
                this.expertCpuChoose(playerHandCards, tableWaitingCards);
        // console.log(">>>>>>", cpuLevel, chosenCard);
        this.findAndRemoveCard(chosenCard);
        
        setTimeout(() => {
            gameInsertHandler(chosenCard.domElement);
            nextTurnHandler();
        }, 800);//  300
        //  1900
    }
    this.findAndRemoveCard = (card)=>{
        const index = this.cards.findIndex((element, index) => {
            if (card.code === element.code) {
                return true
            }
        });
        
        this.cards.splice(index, 1);
    }

    this.easyCpuChoose = (waitingCards)=>{
        const randIdx = Math.floor( Math.random() * (waitingCards.length-1));
        return waitingCards[randIdx];
    }
    this.expertCpuChoose = (playerHandCards, tableWaitingCards)=>{

        this.cardsInARow;
        this.kindTails;
        // console.log('найти имеемые карты на путь к хвостам');
        // console.log('пока набираются карты к хвостам можно пойти картами, что подряд');

        //  если можно продвигать путь к хвостам, то класть к ним
        //  (если путь к своим хвостам имеется на руке, то выбирать иные, пути к хвостам)
        //  пока идет ожидание заполнения пути к хвостам, можно класть порядочные
        //  если игра больше 2-х игроков, то приоритетней класть "предпоследние карты"
        
        // console.log('рандомно выбрать эти карты для хода');
        
        arr.shift()
        return playerHandCards[0];
    }
    
    this.rateByTails = ()=>{
        //  рейтинг по наличию хвостов на руке
        this.cardsInARow;
        this.kindTails;
    }
    this.rateByRows = ()=>{
        //  Отбор по непоследнести 
    }
    this.rateByLast = ()=>{
        //  отбор по хвостатому ходу (удерживание противника)
    }
    this.rateByNotPrev = ()=>{
        //  отбор по степени удержиаемости противника
    }
    this.rateByOpponentHand = ()=>{
        //  отбор по степени удержиаемости противника (удерживание противника)
    }

    this.findSame = (arr1, arr2)=>{

    }
    this.findRowedCards = (cards)=>{
        const sorted = this.cards.slice().sort((a, b) => +a.code - +b.code);

        const kindedCards = [[],[],[],[]];
        for(let crd of sorted){
            kindedCards[crd.suit].push(crd);
        }
        const suitRows = [[],[],[],[]];
        for(let suite in kindedCards){
            const suitCads = kindedCards[suite];
            const rows = [];
            for(let i=1; i<suitCads.length; i++){
                if(suitCads[i].rank==suitCads[i-1].rank+1){
                    const row = [ suitCads[i-1] ];
                    while(suitCads[i] && suitCads[i].rank == 1+suitCads[i-1].rank){
                        row.push(suitCads[i]);
                        i++;
                    }
                    rows.push(row);
                }
            }
            suitRows[suite] = rows;
            console.log();
        }

        return suitRows;
        // return this.cardKindRows = suitRows;
    }
    this.findAllTails = (playerCards)=>{
        const suits = [0,1,2,3];
        const tails = [0,8];
        const suitTails = [[], [], [], []];
        for(let suit in suits){
            for(let rank in tails){
                const tailCard = playerCards.find( (elm)=> elm.suit==suits[suit] && elm.rank==tails[rank]);
                suitTails[suit][rank] = tailCard;
            }
        }
        return suitTails;
    }
    //  AI expert mind^
    this.chooseTailedSuitCard = ()=>{

    }



    this.isHandEmpty = ()=>{
        return this.cards.length==0;
    }

    this.hiliteHand = (shiftStyle)=>{
        this.domElement.style = shiftStyle;
    }
    this.unhiliteHand = ()=>{
        this.domElement.style = "shiftStyle";
    }
}

function Column(element, suit, suitChar){
    
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
        this.topPart.textContent = "";
        
        for( let card of this.midPart.children){
            
            if(card.className != "column__kind-symbol")
                card.remove();
        }
        this.botPart.textContent = "";
    }
}

let game = {
    playersNum:null,
    currentPlayer:0,
    cpuLevel:null,

    hiliteDirectioStyles:[null,
        ["top:0","bottom:-40px"],
        ["left:0","right:0","bottom:-40px"],
        ["left:0", "top:0","right:0","bottom:-40px"]
    ],
    initGame(playersNum){
        this.playersNum = playersNum;
        this.dataStack.generateStack();
        this.dataStack.shuffleCards();

        this.cpuLevel = document.querySelector("input[name='cpu-level']:checked").value;
        const dividedStack = this.dataStack.divideStack(this.playersNum);
        console.log("game init CPU LEVEL: "+this.cpuLevel);
        this.hands.fill(dividedStack, this.cpuLevel);
        
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
        
        this.nextPlayerTurn();
    },
    startGame(){
        this.currentPlayer = this.findFirstPlayer();
        
        this.playerTurn();
        
    },
    
    playerTurn(){
        //  получить массив ожидаемых на столе карт
        const waitingCards = this.table.getWaitingCards();
        //  собрать все икомые объекты Карт из колоды
        const gatheredCards = this.gatherConcreteCards(waitingCards);
        // console.log("((((( waitingCards", waitingCards);
        //  сверить КАРТЫ текущего игрока с ожидаемыми картами на столе
        let currentHand = this.hands.getHand(this.currentPlayer)
        let hasProperCards = currentHand.hasOneOfCards(waitingCards);

        currentHand.hiliteHand(this.hiliteDirectioStyles[this.playersNum-1][this.currentPlayer]);

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
            
            this.hands.userHand.hiliteProperCards(hasProperCards);
            this.hands.allowUserHand(true);
            //  одидание клика:
        }else{
            
            this.hands.allowUserHand(false);
            //      КОМП:    выбрать карту для хода
            // console.log("CPU LEVEL:", this.cpuLevel);
            this.hands.getHandObject(this.currentPlayer).computerChoose(
                gatheredCards,
                (card)=>{this.table.insertCard(card)},
                ()=>this.nextPlayerTurn(),
                this.cpuLevel,
                waitingCards
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
            
            return;
        }
        const wasHand = this.hands.getHand(this.currentPlayer);
        wasHand.unhiliteHand();
        let cruNum = this.currentPlayer + 1;
        cruNum = cruNum>=this.playersNum ? 0 : cruNum;

        this.currentPlayer = cruNum;
        this.table.changePlayer(this.currentPlayer);
        this.playerTurn();
    },
    showCongratulation(playerNum){
        congratulations__flash.classList.add("congratulations__flash_appear");
        congratsWin.style = "display: block; opacity:1; top: 0;";
        congratulations__message.innerText = "Great job, mate #"+(playerNum+1)+"!";
;

        const rewardClassNameIdx = classNameNumberWithPlayers[this.playersNum-1][playerNum];
        rewardBoxElem.classList.add(rewardBoxStyles[rewardClassNameIdx]);
        //return confirm("11111111111! "+this.currentPlayer+" player. /nDo you want to start a new game?")
    },
    hideCongratulation(){
        congratulations__flash.classList.remove("congratulations__flash_appear");
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
        
        const isOver = this.hands.getHandObject(this.currentPlayer).isHandEmpty()
        
        return isOver;
    },

    vanishGame(){
         this.hands.clear();
         this.table.clearTable();
         rewardBoxElem.className = 'congratulations__reward';
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
            /*  отправка Карты на Стол*/
            let cardCode = cardElem.dataset.code;
            let cardSuit = +cardCode[0];
            let cardRank = +cardCode[1];
            
            this.columns[cardSuit].putCard(cardElem, cardRank);
            
            const animationClass = this.animationClasses[this.playersCount][this.currentPlayer] 
            
            cardElem.classList.add(animationClass);
        },

        clearTable(){
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
            
            for(let i=0; i<this.userHand.domElement.children.length; i++){
                this.userHand.domElement.children[i].style = "pointer-events:"+(how?"auto":"none");
            }
            
        },
        
        
        fill(handsCards, cpuLevel){
            this.handsElements = this.getActiveHands(handsCards.length);
            
            // console.log(this, cpuLevel);
            for(let h=0; h<this.handsElements.length; h++){
                // console.log(this, this.cpuLevel);
                const hand = new Hand(this.handsElements[h], h, this.cpuLevel);
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
    setTimeout(()=>{game.vanishGame();},500);
    congratsWin.style = "top: 0";
    menuElem.style = "top: 0";   //  display:flex;
}
function hideMenu(){
    congratsWin.style = "top:-100vh;";
    const menuElem = document.getElementById("menu");
    menuElem.style = "top: -100vh;"; // display:none;
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
const congratulations__message = document.getElementsByClassName("congratulations__message")[0];

const congratulations__flash = document.getElementsByClassName("congratulations__flash")[0];
const congratulations__reward = document.getElementsByClassName("congratulations__flash")[0];
const rewardBoxStyles = ["congratulations__reward_left","congratulations__reward_top","congratulations__reward_right","congratulations__reward_bottom"]
const classNameNumberWithPlayers = [null, [1,3],[0,2,3],[0,1,2,3]];
const rewardBoxElem = document.getElementsByClassName("congratulations__reward")[0];



congratsWin__restart.onclick = ()=>{
    game.hideCongratulation();
    game.restartCurrentGame();
}
congratsWin__menu.onclick = ()=>{
    showMenu();
    game.hideCongratulation();
}