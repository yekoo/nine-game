$((e)=>{
    initGame(2);
})

var tableColumns;
var playersTotal;
var cardKindsLetters = ["c","s","h","d"];
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
var stack = buildStack();
var playerHands, currentPlayer;


function initGame(playersCount){
    playersTotal = playersCount;
    shakeStack(stack);
    //alert(stack);
    playerHands = divideCards(playersTotal);
    //alert( playerHands.join("\n") );
    currentPlayer = findFirstPlayer();
    //alert("First player: "+currentPlayer);
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
            arr.push(cardNames[n]+cardKindIdx[k]);
        }
    }
    return arr;
}

function shakeStack(arr){
    let shaked = [];

    for(let i=0; arr.length; i++){
        let rand = parseInt( Math.random()*arr.length);
        shaked.push( arr.splice(rand, 1) );
    }
    arr.push(...shaked);
}

function divideCards(playersNum){
    let handCards = [];
    let playerCardsNum = 36/playersNum;
    for(let i=0; i<playersNum; i++){
        handCards.push( stack.splice(0, playerCardsNum));
    }
    return handCards;
}

function findFirstPlayer(){
    for(let i=0; i<playerHands.length; i++){
        let alCards = playerHands[i].join(",");
        if(alCards.indexOf("9"+kindbub)>=0)
            return i;
    }
}

function buildCurrentPlayerHand(){
    let curPlayerHand = [ ... playerHands[currentPlayer]];
    let userHand = $(".user__hand");
    
    for(let i=0; i<curPlayerHand.length; i++){
        let cardStr = curPlayerHand[i].join("");
        let cardName = cardStr.length==2 ? cardStr.substr(0,1) : cardStr.substr(0,2);
        let card = $('<div class="card user__card">');

        //card.text(cardName);
        let kindIndex = cardStr.length==2 ? cardStr.substr(1,1) : cardStr.substr(2,1);

        //card.append(kindElements[kindIndex]);
        card.append(
            '<div class="card__label">'+cardName+
            '<div class="rk">'+kindElements[kindIndex]+'</div></div>'
        );
        card.append(
            '<div class="card__label card__label_bot">'+
            cardName+'<div class="rk">'+kindElements[kindIndex]+
            '</div></div>'
        );

        card.data("kind", kindIndex);
        card.data("name", cardName);
        console.log("Kind index: "+kindIndex);
        card.click( cardClick );
        userHand.append(card);
    }
}

function buildOpponentHands(hand, index){
    console.log("player hands: "+playerHands.join("\n"));

    `  для каждой руки оппонента нужно сделать свою функцию
       и в ней запускать оппонентскую строилку руки
       и устроить автоматическую выбиралку рук в зависимости от количества оппонентов
       
       нет, в атрибуте указывать руку, в которую класть карты`

    let curPlayerHand = [ ... playerHands[index]];
    let userHand = $(".user__hand");
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
    let cardKind = $(e.target).data("kind");
    let properSide = $(e.target).data("name").match(/\d+/);
    let numSide = properSide=="6" || properSide=="7" || properSide=="8";
    let nineCard = numSide=="9";

    $(e.target).removeClass("user__card");
    $(e.target).addClass("table__card");
    
    let pendDir = "append";;
    let columnSide;
    if(numSide){
        columnSide = ".column__cell_bot";
    }else if(nineCard){
        columnSide = ".column__cell_mid";
    }else{
        columnSide = ".column__cell_top";
        pendDir = "prepend";
    }
    $(tableColumns[cardKind]).find(columnSide).get(0)[pendDir](e.target);
}