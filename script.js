$((e)=>{
    initGame(2);
})

var tableColumns;
var playersTotal;
// var cardKindsLetters = ["c","s","h","d"];
var cardKinds = ["♠","♣","♥","♦"];
var cardKindIdx = [0,1,2,3];
var kindElements = [
    '<div class="bk">♠</div>',
    '<div class="bk">♣</div>',
    '<div class="rk">♥</div>',
    '<div class="rk">♦</div>',
];
var kindbub = 3;
var cardNames = ["6","7","8","9","10","J","Q","K","A"];
//  добавлять в карты нужно не строки выше, а их ИНДЕКСЫ
var cardNamesIdx = [0,1,2,3,4,5,6,7,8];
var stack;
var playerHands, currentPlayer;

var waitingCards;


function initGame(playersCount){
    waitingCards = [];
    stack = buildStack();
    playersTotal = playersCount;
    stack = shakeStack(stack);
    playerHands = divideCards(playersTotal);
    currentPlayer = findFirstPlayer();

    buildCurrentPlayerHand();

    let oppHands = getActiveHands(playersTotal);
    for(let i=0; i<oppHands.length; i++)
        buildOpponentHands(oppHands[i], i+1);
    tableColumns = $(".kind__column");
}

function buildStack(){
    let arr = [];
    for(let k=0; k<4; k++){
        for(let n=0; n<9; n++){
            // arr.push(cardNames[n]+cardKinds[k]);
            // arr.push(cardNamesIdx[n]+""+cardKindIdx[k]);
            //arr.push(cardKindIdx[k]+""+cardNamesIdx[n]);
            let cardObj = {
                code:k+""+n,
                kindIdx: k,
                levelIdx: n,
                kind: kindElements[k], 
                level: cardNames[n],
                fullName: ""+kindElements[k]+cardNames[n],
                faceUp: false
            };
            arr.push(cardObj);
        }
    }
    console.log("CARDS STACK:",arr[0]);
    return arr;
}

function shakeStack(arr){
    let shaked = [];

    for(let i=0; arr.length; i++){
        let rand = parseInt( Math.random()*arr.length);
        shaked.push( ...arr.splice(rand, 1) );
    }
    arr = shaked.slice(0);
    console.log(arr,shaked);
    return shaked;
}

function divideCards(playersNum){
    console.log(">>> STACK "+stack);
    let handCards = [];
    let playerCardsNum = 36/playersNum;
    for(let i=0; i<playersNum; i++){
        handCards.push( stack.splice(0, playerCardsNum));
    }
    console.log("DIVEDED::: "+handCards);
    return handCards;
}

function findFirstPlayer(){
    console.log("findFirstPlayer");
    console.log(currentPlayer, playerHands);
    for(let i=0; i<playerHands.length; i++){
        
        let diamondsNineHere = playerHands[i].filter((elm)=>{
            return elm.code=="33";
        })
        if(diamondsNineHere.length)
            return i;
    }
}

function buildCurrentPlayerHand(){
    console.log(currentPlayer, playerHands);
    let curPlayerHand = [ ... playerHands[currentPlayer]];
    curPlayerHand = sortHandCards(curPlayerHand);

    let userHand = $(".user__hand")[0];
    console.log(curPlayerHand);
    for(let i=0; i<curPlayerHand.length; i++){
        let card = curPlayerHand[i];
        
        let cardElm = $('<div class="card user__card">');
        let cardName = card.level;//cardNames[ cardStr.substr(1,1) ];
        
        cardElm.append(
            '<div class="card__label">'+card.level+card.kind+'</div>'
        );
        cardElm.append('<div class="card__label card__label_bot">'+cardName+card.kind+'</div>');

        cardElm.data("kind", card.kindIdx);
        cardElm.data("name", card.level);
        cardElm.click( cardClick );
        //card
        userHand.append(cardElm.get(0));
    }
}

function buildOpponentHands(hand, index){
    //console.log("player hands: "+playerHands.join("\n"));

    `  для каждой руки оппонента нужно сделать свою функцию
       и в ней запускать оппонентскую строилку руки
       и устроить автоматическую выбиралку рук в зависимости от количества оппонентов
       
       нет, в атрибуте указывать руку, в которую класть карты`

    let curPlayerHand = [ ... playerHands[index]];
    // let userHand = $(".user__ha nd");
    //console.log("Start building all opponent hands",curPlayerHand);
    for(let i=0; i<curPlayerHand.length; i++){
        let card = $('<div class="card opponent__card">');
        $("#"+hand).append(card);
    }
}

function getActiveHands(count){
    switch(count){
        case 2:
            return ["opp__hand_top"];
        case 3:
            return ["opp__hand_right", "opp__hand_left"];
        case 4:
            return ["opp__hand_top", "opp__hand_right", "opp__hand_left"];
    }
}



function cardClick(e){

    $(e.target).off("click");
    let cardKind = $(e.target).data("kind");
    let properSide = $(e.target).data("name").match(/\d+/);
    let numSide = properSide=="6" || properSide=="7" || properSide=="8";
    let nineCard = properSide=="9";
    console.log("Card kind: "+$(e.target).data("name"));
    $(e.target).removeClass("user__card");
    $(e.target).addClass("table__card");
    
    let apppendDir = "append";;
    let columnSide;
    if(numSide){
        columnSide = ".column__cell_bot";
    }else if(nineCard){
        $(e.target).addClass("card_9");
        columnSide = ".column__cell_mid";
    }else{
        columnSide = ".column__cell_top";
        apppendDir = "prepend";
    }
    console.log("columnSide", columnSide);
    $(tableColumns[cardKind]).find(columnSide).get(0)[apppendDir](e.target);

    waitingCards = getNextMoveCards();
    console.log("WAITING CARDS: ",waitingCards);
    let putNow = checkPlayersHandCards( playerHands[currentPlayer] );   //  put players card array as attr
    console.log(currentPlayer + "OWN CARDS: ", putNow);
    console.log("waiting:",waitingCards,"current:", playerHands[currentPlayer]);
}

function sortHandCards(arr){
    arr.sort( (a, b) => a.code - b.code)
    return arr;
}

//  получить возможные карты
function getNextMoveCards(){
    //  пройти по всем колонкам:
    let columns = $(".kind__column");
    let waitingCards = [];
    for( let i=0; i<4; i++){
        waitingCards.push([]);
        let col = columns.get(i);
        
        if($(col).find(".column__cell_mid").children().length==1){
            waitingCards[i].push("9");
            //console.log(">>>");
            continue;
        } 
        console.log("=== Top children: "+$(col).find(".column__cell_top").children().length);
        //  получить ПЕРВЫЙ и --- элемент каждой колонки
        let topElmLevel = $(col).find(".column__cell_top").children(":first-child").data("name");
        let topEmpty = getNextCardFor(topElmLevel);
        if(topEmpty===undefined) topEmpty = "10"
        waitingCards[i].push(topEmpty);

        //  получить --- и ПОСЛЕДНИЦ элемент каждой колонки
        let bottomElmLevel = $(col).find(".column__cell_bot").children(":last-child").data("name");
        let bottomEmpty = getNextCardFor(bottomElmLevel);
         if(bottomEmpty===undefined) bottomEmpty = "8";
        waitingCards[i].push(bottomEmpty);
        //  вычесть, какие карты должны быть следующими после этих карт

    }
    return waitingCards;
}

//  проверить наличие их у угрока
function checkPlayersHandCards(playerHand){
    return waitingCards.filter(function(obj) { return playerHand.indexOf(obj) >= 0; }); 
}

//  добавить найденным картам выезжание

//  добавить отметки на стол к возможным укладкам карт

function getNextCardFor(name){
    console.log("SWITCH name: "+name);
    switch(name){
        case "6":
            console.log("6 - NULL");
            return null;
        case "7":
            return "6";
        case "8":
            return "7";
        case "9":
            return ["8", "10"];
        case "10":
            return "J";
        case "J":
            return "Q";
        case "Q":
            return "K";
        case "K":
            return "A";
        case "A":
            return null;
    }
}