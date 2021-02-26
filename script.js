$((e)=>{
    //alert("JQ LOADED");
    initGame()
})

var cardKindsLetters = ["c","s","h","d"];
var cardKinds = ["♠","♣","♥","♦"];
var kindElements = [
    '<div class="bk">♠</div>',
    '<div class="bk">♣</div>',
    '<div class="rk">♥</div>',
    '<div class="rk">♦</div>',
];
var kindbub = "♦";
var cardNames = ["6","7","8","9","10","J","Q","K","A"];
var stack = buildStack();
var playerHands, currentPlayer;


function initGame(){
    shakeStack(stack);
    //alert(stack);
    playerHands = divideCards(4);
    //alert( playerHands.join("\n") );
    currentPlayer = findFirstPlayer();
    //alert("First player: "+currentPlayer);
    buildCurrentPlayerHand();
}

function buildStack(){
    let arr = [];
    for(let k=0; k<4; k++){
        for(let n=0; n<9; n++){
            arr.push(cardNames[n]+cardKinds[k]);
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
        let alCards = playerHands[i].join("");
        if(alCards.indexOf(9+kindbub)>=0)
            return i;
    }
}

function buildCurrentPlayerHand(){
    let curPlayerHand = [ ... playerHands[currentPlayer]];
    let userHand = $(".user__hand");
    console.log("HAND: "+userHand);
    console.log();
    for(let i=0; i<curPlayerHand.length; i++){
        //  <div class="card user__card">7 <div class="bk">♠</div></div>
        let cardStr = curPlayerHand[i].join("");
        let cardName = cardStr.length==2 ? cardStr.substr(0,1) : cardStr.substr(0,2);
        let cardKind = cardStr.length==2 ? cardStr.substr(1,1) : cardStr.substr(2,1);
        let card = $('<div class="card user__card">');
        card.text(cardName);
        card.append('<div class="rk">'+cardKind+'</div>');
        //let kindIndex = cardStr.length==2 ? cardStr.substr(1,1) : cardStr.substr(2,1);
        //card.append(kindElements[]);
        userHand.append(card);
    }
    alert(currentPlayer+" player hand: "+curPlayerHand);
}