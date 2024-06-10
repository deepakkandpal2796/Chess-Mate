'use strict';

const timeCon = localStorage.getItem("timeControl");
localStorage.removeItem("timeControl");



//selecting elements 
const chessBoard = document.getElementById('chessboard');
const infoPlayer = document.getElementById('info-player');
const infoDisplay = document.getElementById('info-display');

//chess board
const initialChessBoard = [
    blackRook, blackKnight, blackBishop, blackQueen, blackKing, blackBishop, blackKnight, blackRook,
    blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn,
    whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing, whiteBishop, whiteKnight, whiteRook,
]

//starting position
function startingPosition(){
    console.log(timeCon);
    initialChessBoard.forEach((sq, i) => {
        const square = document.createElement('div');
        square.classList.add('square');
        square.innerHTML = sq;
        square.setAttribute('sq-id', i);
        square.firstChild?.setAttribute('draggable', true); //atttribute is necessary for drag event
        chessBoard.appendChild(square);
    
        //displaying light square and dark square
        const row = Math.floor((63 - i )/ 8 ) + 1;
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "lightsq": "darksq");
            } else {
            square.classList.add(i % 2 === 0 ? "darksq" : "lightsq");
        }
    
        
    });
}

//Function on load
startingPosition();
//Global variable 
let startPosition, draggedPiece, draggedPieceLetter, draggedPieceColor, endPosition, isDragoverSqContains, capturedPiece, capturedPieceColor;
let notation;
let currentPlayer = 'white';
let valid, pieceName;


//global function
const changePlayer = function(){
    // Change the player 
    currentPlayer = (currentPlayer == 'white') ? 'black' :  'white';
}



function isPathClearForBishop(startIndex, endIndex) {
    const [startCol, startRow] = getRowCol(startIndex);
    const [endCol, endRow] = getRowCol(endIndex);
    // console.log('isPathClearForBishop');
    // console.log(startCol, startRow, endCol, endRow);

    const rowDirection = endRow > startRow ? 1 : -1;
    const colDirection = endCol > startCol ? 1 : -1;

    let currentRow = startRow + rowDirection;
    let currentCol = startCol + colDirection;

    while (currentRow !== endRow && currentCol !== endCol) {
        const currentIndex = (8 - currentRow ) * 8 + currentCol - 1;
        if (currentBoard[currentIndex] != '') {
            return false; // Path is not clear
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }

    return true; // Path is clear
}

function isPathClearForRook(startIndex, endIndex) {
    const [startCol, startRow] = getRowCol(startIndex);
    const [endCol, endRow] = getRowCol(endIndex);

    const rowDirection = endRow > startRow ? 1 : (endRow < startRow ? -1 : 0);
    const colDirection = endCol > startCol ? 1 : (endCol < startCol ? -1 : 0);

    let currentRow = startRow + rowDirection;
    let currentCol = startCol + colDirection;

    // Check vertical path
    if (rowDirection !== 0 && colDirection === 0) {
        while (currentRow !== endRow) {
            const currentIndex = (8 - currentRow) * 8 + currentCol - 1;
            if (currentBoard[currentIndex] !== '') {
                return false; // Path is not clear
            }
            currentRow += rowDirection;
        }
    }
    // Check horizontal path
    else if (rowDirection === 0 && colDirection !== 0) {
        while (currentCol !== endCol) {
            const currentIndex = (8 - currentRow) * 8 + currentCol - 1;
            if (currentBoard[currentIndex] !== '') {
                return false; // Path is not clear
            }
            currentCol += colDirection;
        }
    }
    // Invalid path (neither vertical nor horizontal)
    else {
        return false;
    }

    return true; // Path is clear
}

function isPathClearForQueen(startIndex, endIndex) {
    const [startCol, startRow] = getRowCol(startIndex);
    const [endCol, endRow] = getRowCol(endIndex);

    // Check if the move is valid for either rook or bishop
    if (isPathClearForRook(startIndex, endIndex) || isPathClearForBishop(startIndex, endIndex)) {
        return true;
    }

    return false; // Invalid path
}

// Drag and drop a piece 
const allSquare = document.querySelectorAll('.square');

allSquare.forEach(function(sq){
    sq.addEventListener("dragstart", dragstart);
    sq.addEventListener('dragover', dragover);
    sq.addEventListener('drop', dropDown);

    
})

//dragstart
function dragstart(e){
    startPosition = e.target.parentNode.getAttribute('sq-id');
    draggedPiece = e.target;
    draggedPieceLetter = draggedPiece.dataset.piece.slice(0,1);
}


//dragover
function dragover(e){
    e.preventDefault();

    if(e.target.classList.contains('piece')){
        capturedPiece = e.target;
        endPosition = e.target.parentNode.getAttribute('sq-id');
        isDragoverSqContains = e.target;
    }else{
        endPosition = e.target.getAttribute('sq-id');
        isDragoverSqContains = e.target?.firstChild;
    }
    // console.log(startPosition, endPosition, isDragoverSqContains);
}


//drop
function dropDown(e){

    draggedPieceColor = draggedPiece.dataset.color;
    capturedPieceColor = isDragoverSqContains?.dataset.color;
 
    pieceName = draggedPiece.dataset.piece;
    valid = validation(endPosition, startPosition, pieceName, currentPlayer);
    console.log(`${valid} : valid`);
    if(draggedPieceColor === currentPlayer && valid){
        if(startPosition === endPosition) return;
        if(isDragoverSqContains == null){
            e.target.append(draggedPiece);
            getCordinates(endPosition,draggedPieceLetter);
            changePlayer();
        }else{
            const targetOnSquare = e.target.classList.contains('square');
            if(targetOnSquare && draggedPieceColor != capturedPieceColor){
                e.target.append(draggedPiece);
                e.target.firstChild.remove();
                getCordinates(endPosition, draggedPieceLetter);
                changePlayer();
            }else if(draggedPieceColor != capturedPieceColor){
                e.target.parentNode.append(draggedPiece);
                e.target.remove();
                getCordinates(endPosition, draggedPieceLetter);
                changePlayer();
            }
            //CR : 2 ends
        }

        const currentPlayerKingPos = currentBoard.findIndex(piece => piece === (currentPlayer === 'white' ?  'whiteKing': 'blackKing'));
        const currentKingUnderCheck = isKingUnderCheck(currentPlayerKingPos);
        if (currentKingUnderCheck) {
            alert('Check!');
            if (isCheckmate()) {
                alert('Checkmate!');
            }
        }
        
        // const oppPlayerKingPos = currentPlayerKingPos == 'white' ?  'whiteKing': 'blackKing';
        // const oppKingUnderCheck = isKingUnderCheck(oppPlayerKingPos);
        // if (oppKingUnderCheck){
        //     alert('Still under Check!');
        // }
    
    }else{
        // 'Draggin the wrong piece')
       return;
    }

}


//Points to build 

// CR 1 --closed
// only white player can move white pieces
    // solution : check the player is white or black then remove the dragable = true from the div's as per the need.
    // steps 1: define the turn of white or black.
    // step 2: check the dragable piece wheather it is black or white piece.
    // step 3: only white olayer can move the white pieces. others are dragable false 


// CR 2 --closed
    //On droping the peice, target in the dropDown can be 2 things 1st the piece itself and if user dont drop the target on the piece exactly then it will be dropeed on the square div.
    //in that case the below code fails as it add one more div to the chess board div
    // e.target.parentNode.append(draggedPiece);
    // e.target.remove();

    //solution : If the peice is droped on the square the append should be on the piece inside the square div and if drop is on the piece then code is working fine.

// CR 3 --closed
    //If the peice is again dropped on the same square 
    //If the piece is dropped on the piece div itself then we have to select the parent div and fetch the sq-id.
    //Check the starting and the ending location of the peiece is same if no then only drop

// CR 4 --closed
    //White can't take white piece.
    //black cant take black piece.

// CR 5 --closed
    //Timers should be working
    // solution : Make a stop and resume timer button.
    // on load white timer should start as soon as the peiece droped the other player timer start
    //function take white and bloack as argument run on the drop of the piece 

// CR : 6 --closed
    // find rows and columns and diplay it in move history
    //function get coordinates and append them

// CR : 7
    // If timer ends then popup comes time end and other player win.

//cr : 8
    //make download button working;

// CR : 9 (Major) --closed
    //Make a validation for the piece 
    //Reseach paper on the valid move
    // Pawn:
    // Moves forward one square.
    // On its first move, it can move forward two squares.
    // Captures diagonally.
    // En passant capture.

    // Rook:
    // Moves horizontally or vertically any number of squares.

    // Knight:
    // Moves in an L-shape: two squares in one direction and then one square perpendicular.

    // Bishop:
    // Moves diagonally any number of squares.

    // Queen:
    // Moves horizontally, vertically, or diagonally any number of squares.

    // King:
    // Moves one square in any direction.
    // Castling move.
    // We have to check if the king move is a valid as it doesnt comes on check

//CR :10 
//on click of the piece we get the valid moves 

//CR: 11 
//Remove the add symbol from when we drag 

//! CR: 12 --priority
//king castel 

//! CR: 13 --priority --closed
//if a piece in bwtween only horse can jump 
// const board = [
//     ['blackRook', 'blackKnight', 'blackBishop', 'blackQueen', 'blackKing', 'blackBishop', 'blackKnight', 'blackRook'],
//     ['blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn'],
//     ['', '', '', '', '', '', '', ''],
//     ['', '', '', '', '', '', '', ''],
//     ['', '', '', '', '', '', '', ''],
//     ['', '', '', '', '', '', '', ''],
//     ['whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn'],
//     ['whiteRook', 'whiteKnight', 'whiteBishop', 'whiteQueen', 'whiteKing', 'whiteBishop', 'whiteKnight', 'whiteRook'],
// ];
//We have to make a current board and check the position in between exists or not 

//! CR : 14 --priority --colsed
//pawn takes move logic and the pawn start move 2 after that one move 

//! CR :15 --priority  --closed
// if king is under check then move to the non chcek places
// Calculate the king valid move  --clodes
//!CR : 16 --closed
//if a piece is holding a check dont move that piece 

//CR: 17 
// if king dont have a move to play then game over 

//CR: 18 --closed
//If time out then game over 

//Timer 
//white
const playerOneMin = document.querySelector('#player-one-min');
const playerOneSec = document.querySelector('#player-one-sec');
//black
const playerTwoMin = document.querySelector('#player-two-min');
const playerTwoSec = document.querySelector('#player-two-sec');
//set
playerOneMin.innerHTML = playerTwoMin.innerHTML = timeCon;
//moves
const moves = document.querySelector('.moves');

const timer = setInterval(function(){
    if(currentPlayer == 'white'){
        let min = parseInt(playerOneMin.innerHTML);
        let sec = parseInt(playerOneSec.innerHTML);
        if(min === 0 && sec === 0){
            alert(`Game Over ${currentPlayer} Lost`);
            clearInterval(timer);
            return false;
        }
        playerOneMin.parentElement.classList.add('active-clock');
        playerTwoMin.parentElement.classList.remove('active-clock');
        if( sec == 0){
            playerOneMin.innerHTML =  (min-1).toString().toString().padStart(2, '0');
            sec = 60;
        }
        playerOneSec.innerHTML = (sec-1).toString().padStart(2, '0');
    }else{
        playerTwoMin.parentElement.classList.add('active-clock');
        playerOneMin.parentElement.classList.remove('active-clock');
        let min = parseInt(playerTwoMin.innerHTML);
        let sec = parseInt(playerTwoSec.innerHTML);
        if(min === 0 && sec === 0){
            alert(`Game Over ${currentPlayer} Lost`);
            clearInterval(timer);
            return false;
        }
        else if( sec == 0){
            playerTwoMin.innerHTML =  (min-1).toString().toString().padStart(2, '0');
            sec = 60;
        }
        playerTwoSec.innerHTML = (sec-1).toString().padStart(2, '0');
    }
}, 1000);

const getCordinates = function(pos, piece){
    piece = piece.toUpperCase();
    const positon = parseInt(pos) + 1;
    const row = Math.floor((63 -  pos)/ 8 ) + 1;

    const column = (positon - 1) % 8;
    const columnLetter = columns[column];
    // console.log(column+1, row);

    if(isDragoverSqContains == null){
        notation = `${columnLetter}${row}`;
        const span = document.createElement('p');
        span.classList.add('move');
        span.innerText = notation;
        moves.append(span);
    }else{
        notation = `${piece}x${columnLetter}${row}`;
        const span = document.createElement('p');
        span.classList.add('move');
        span.innerText = notation;
        moves.append(span);
    }
    return  [column+1,row];
}

const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const getRowCol = function(pos){
    const row = Math.floor((63 -  pos)/ 8 ) + 1;
    const positon = parseInt(pos) + 1;
    const column = (positon - 1) % 8;
    return [column+1,row]
}

//Validation 
function validation(endPos, startPos, piece, color){
    const startIndex = parseInt(startPos);
    const endIndex = parseInt(endPos);
    const direction = (color == 'white') ? 1 : -1;
    const enemyPiecePrefix = (color == 'white') ? 'black' : 'white';
    let [y1, x1] = getRowCol(startPos);
    let [y2, x2] = getRowCol(endPos);
    console.log(`validation: ${x1}, ${y1}, ${x2}, ${y2}, ${piece} ${currentPlayer}`);
    // console.log(typeof(startPos));
    // console.log(`${endPos} || ${startPos} `);


    let tempBoard = [...currentBoard];
    function wouldMovePutKingInCheck(){
        const currentPlayerKingPos = tempBoard.findIndex(piece => piece === (currentPlayer === 'white' ?  'whiteKing': 'blackKing'));
        const currentKingUnderCheck = isKingUnderCheckTemp(currentPlayerKingPos, tempBoard);
            if (currentKingUnderCheck) {
                alert('Still under Check!!');
                return false;
            }
        return true;
    }
    const updateTempBoard = function(startPos, endPos){
        let temp = tempBoard[startPos];
        tempBoard[startPos] = '';
        tempBoard[endPos]= temp;
        console.log(tempBoard);
    }
    // const wouldMovePutKingCheck = wouldMovePutKingInCheck();
    
    switch(piece){
        case "king":
            if(Math.abs(x2 - x1) <= 1 && Math.abs(y2 - y1) <= 1){
                const isKingUndCheck = isKingUnderCheck(endIndex);
                if(!isKingUndCheck ){
                    updateCurrentBoard(startIndex, endIndex);
                    return true;
                }
            }
            break;
        case "bishop":
            if(Math.abs(x2 - x1) == Math.abs(y2 - y1)){
                const isPathClearBishop = isPathClearForBishop(startIndex, endIndex)
                if(isPathClearBishop){
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                    updateCurrentBoard(startIndex, endIndex);
                    return true;
                }
            }
            break;
        case "rook":
            if((x2 === x1) || (y2 === y1)){
                const isPathClearRook = isPathClearForRook(startIndex, endIndex);
                if(isPathClearRook){
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                    updateCurrentBoard(startIndex, endIndex);
                    return true;
                }
            }
            break;
        case "queen":
            if((Math.abs(x2 - x1) == Math.abs(y2 - y1)) || (x2 === x1) || (y2 === y1) ){
                const isPathClearQueen = isPathClearForQueen(startIndex, endIndex);
                if(isPathClearQueen){
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                    updateCurrentBoard(startIndex, endIndex);
                    return true;
                }
                
            }
            break;
        case "knight":
            if((Math.abs(x2 - x1) == 1 && Math.abs(y2 - y1) == 2) || (Math.abs(x2 - x1) == 2 && Math.abs(y2 - y1) == 1)){
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                updateCurrentBoard(startIndex, endIndex);
                return true;
            }
            break;
        case "pawn":
            if((y2 == y1) && Math.abs(x2 - x1) == 1){
                if(currentBoard[endIndex]==''){
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                    updateCurrentBoard(startIndex, endIndex);
                    return true;
                }
                
            }else if((y2 == y1) && Math.abs(x2 - x1) == 2 && checkPawnInitialPos(startPos)){
                if(currentBoard[endIndex]==''){
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                    updateCurrentBoard(startIndex, endIndex);
                    return true;
                }
            }else if(Math.abs(y2 - y1) === 1 && x2 === x1 + direction){ 
                if (currentBoard[endIndex].startsWith(enemyPiecePrefix)) {
                    updateTempBoard(startIndex, endIndex);
                    const wouldMovePutKingCheck = wouldMovePutKingInCheck();
                    if(!wouldMovePutKingCheck){
                        tempBoard = [...currentBoard];
                        return false;
                    }
                    updateCurrentBoard(startIndex, endIndex);
                    return true; 
                }                
            }
            break;
        default:
            return false;
    }
}

const currentBoard = [
    "blackRook", "blackKnight", "blackBishop", 'blackQueen', 'blackKing', 'blackBishop', 'blackKnight', 'blackRook',
    'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn', 'blackPawn',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn', 'whitePawn',
    'whiteRook', 'whiteKnight', 'whiteBishop', 'whiteQueen', 'whiteKing', 'whiteBishop', 'whiteKnight', 'whiteRook',
]

// if the move is valid 
const updateCurrentBoard = function(startPos, endPos){
    let temp = currentBoard[startPos];
    currentBoard[startPos] = '';
    currentBoard[endPos]= temp;
    // console.log(currentBoard);
}



const checkPawnInitialPos = function(startPos){
    startPos = parseInt(startPos);
    if((startPos >= 48 && startPos<=55) || (startPos >= 8 && startPos<=15)){
        return true;
    }
    return false;
}



///Check at each king move also and check on the each opp move also.
//Lets take the final position of the piece wheather its the king or the other piece this function will run every time 
//check the turn and the king moving we have to check for both the kigs buit in different way 
//we have to check weather the current player king is not comming in the way of every piece that is on the boaerd of the oposition
//
// function isKingUnderCheck(pos, pieceName){
//     currentPlayer;
//     const oppPlayer = currentPlayer == 'white' ? 'black' : 'white';
//     console.log(currentPlayer, opoppPlayer, pieceName)
//         if(pieceName == 'king' ){

//         }
// }

//only runs whens the king moves
function isKingUnderCheck(kingPos) {
    const opponentColor = currentPlayer == 'white' ? 'black' : 'white';
    const [kingCol, kingRow] = getRowCol(kingPos);
    const direction = currentPlayer == 'white' ? 1 : -1;
    for (let i = 0; i < currentBoard.length; i++) {
        const piece = currentBoard[i];
        if (piece && piece.startsWith(opponentColor)) {
            const [pieceCol, pieceRow] = getRowCol(i);
            switch (piece.substring(opponentColor.length)) {
                //check if to the square it ia valid move of the piece or not then check any piece comes in between
                case 'Rook':
                    if ((pieceRow === kingRow || pieceCol === kingCol) && isPathClearForRook(i, kingPos) ) {
                        return true;
                    }
                    break;
                case 'Bishop':
                    if (Math.abs(pieceRow - kingRow) === Math.abs(pieceCol - kingCol) && isPathClearForBishop(i, kingPos)) {
                        return true;
                    }
                    break;
                case 'Queen':
                    const pathClearQueen = isPathClearForQueen(i, kingPos);
                    if (((Math.abs(pieceCol - kingCol) === Math.abs(pieceRow - kingRow)) || 
                    (pieceCol === kingCol) || 
                    (pieceRow === kingRow)) && pathClearQueen) {
                        return true;
                    }
                    break;
                case 'Knight':
                    if ((Math.abs(pieceCol - kingCol) === 1 && Math.abs(pieceRow - kingRow) === 2) ||
                        (Math.abs(pieceCol - kingCol) === 2 && Math.abs(pieceRow - kingRow) === 1)) {
                        return true;
                    }
                    break;
                case 'Pawn':
                    if (Math.abs(pieceCol - kingCol) == 1 && pieceRow == kingRow + direction) {
                        return true;
                    }
                    break;
                default:
                    break;
            }
        }
    }
    return false;
}


//temprary currnet board banna pdega 
//update the temp current board 
// according to that temp current board check the king is under check or not 
// if not then update the currrentboard 

function isKingUnderCheckTemp(kingPos, board) {
    const opponentColor = currentPlayer == 'white' ? 'black' : 'white';
    const [kingCol, kingRow] = getRowCol(kingPos);
    const direction = currentPlayer == 'white' ? 1 : -1;
    for (let i = 0; i < board.length; i++) {
        const piece = board[i];
        if (piece && piece.startsWith(opponentColor)) {
            const [pieceCol, pieceRow] = getRowCol(i);
            switch (piece.substring(opponentColor.length)) {
                //check if to the square it ia valid move of the piece or not then check any piece comes in between
                case 'Rook':
                    if ((pieceRow === kingRow || pieceCol === kingCol) && isPathClearForRookTemp(i, kingPos, board) ) {
                        return true;
                    }
                    break;
                case 'Bishop':
                    if (Math.abs(pieceRow - kingRow) === Math.abs(pieceCol - kingCol) && isPathClearForBishopTemp(i, kingPos, board)) {
                        return true;
                    }
                    break;
                case 'Queen':
                    const pathClearQueen = isPathClearForQueenTemp(i, kingPos, board);
                    if (((Math.abs(pieceCol - kingCol) === Math.abs(pieceRow - kingRow)) || 
                    (pieceCol === kingCol) || 
                    (pieceRow === kingRow)) && pathClearQueen) {
                        return true;
                    }
                    break;
                case 'Knight':
                    if ((Math.abs(pieceCol - kingCol) === 1 && Math.abs(pieceRow - kingRow) === 2) ||
                        (Math.abs(pieceCol - kingCol) === 2 && Math.abs(pieceRow - kingRow) === 1)) {
                        return true;
                    }
                    break;
                case 'Pawn':
                    if (Math.abs(pieceCol - kingCol) == 1 && pieceRow == kingRow + direction) {
                        return true;
                    }
                    break;
                default:
                    break;
            }
        }
    }
    return false;
}

function isPathClearForBishopTemp(startIndex, endIndex, board) {
    const [startCol, startRow] = getRowCol(startIndex);
    const [endCol, endRow] = getRowCol(endIndex);
    // console.log('isPathClearForBishop');
    // console.log(startCol, startRow, endCol, endRow);

    const rowDirection = endRow > startRow ? 1 : -1;
    const colDirection = endCol > startCol ? 1 : -1;

    let currentRow = startRow + rowDirection;
    let currentCol = startCol + colDirection;

    while (currentRow !== endRow && currentCol !== endCol) {
        const currentIndex = (8 - currentRow ) * 8 + currentCol - 1;
        if (board[currentIndex] != '') {
            return false; // Path is not clear
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }

    return true; // Path is clear
}

function isPathClearForRookTemp(startIndex, endIndex, board) {
    const [startCol, startRow] = getRowCol(startIndex);
    const [endCol, endRow] = getRowCol(endIndex);

    const rowDirection = endRow > startRow ? 1 : (endRow < startRow ? -1 : 0);
    const colDirection = endCol > startCol ? 1 : (endCol < startCol ? -1 : 0);

    let currentRow = startRow + rowDirection;
    let currentCol = startCol + colDirection;

    // Check vertical path
    if (rowDirection !== 0 && colDirection === 0) {
        while (currentRow !== endRow) {
            const currentIndex = (8 - currentRow) * 8 + currentCol - 1;
            if (board[currentIndex] !== '') {
                return false; // Path is not clear
            }
            currentRow += rowDirection;
        }
    }
    // Check horizontal path
    else if (rowDirection === 0 && colDirection !== 0) {
        while (currentCol !== endCol) {
            const currentIndex = (8 - currentRow) * 8 + currentCol - 1;
            if (board[currentIndex] !== '') {
                return false; // Path is not clear
            }
            currentCol += colDirection;
        }
    }
    // Invalid path (neither vertical nor horizontal)
    else {
        return false;
    }

    return true; // Path is clear
}

function isPathClearForQueenTemp(startIndex, endIndex, board) {
    const [startCol, startRow] = getRowCol(startIndex);
    const [endCol, endRow] = getRowCol(endIndex);

    // Check if the move is valid for either rook or bishop
    if (isPathClearForRookTemp(startIndex, endIndex, board) || isPathClearForBishopTemp(startIndex, endIndex, board)) {
        return true;
    }

    return false; // Invalid path
}


function isCheckmate() {
    const kingPos = currentBoard.findIndex(piece => piece === (currentPlayer === 'white' ? 'whiteKing' : 'blackKing'));
    if (!isKingUnderCheck(kingPos)) {
        return false; // Not a checkmate if the king is not in check
    }

    const [kingCol, kingRow] = getRowCol(kingPos);

    const possibleMoves = [
        [kingCol - 1, kingRow - 1],
        [kingCol, kingRow - 1],
        [kingCol + 1, kingRow - 1],
        [kingCol - 1, kingRow],
        [kingCol + 1, kingRow],
        [kingCol - 1, kingRow + 1],
        [kingCol, kingRow + 1],
        [kingCol + 1, kingRow + 1]
    ];

    for (const [newCol, newRow] of possibleMoves) {
        if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
            const newKingPos = (8 - newRow) * 8 + newCol - 1;
            const boardCopy = [...currentBoard];
            boardCopy[kingPos] = '';
            boardCopy[newKingPos] = currentPlayer === 'white' ? 'whiteKing' : 'blackKing';

            if (!isKingUnderCheckTemp(newKingPos, boardCopy)) {
                return false; // The king has at least one move to escape check
            }
        }
    }

    // Additional logic to check if any other piece can block or capture the threatening piece should be added here
    
    return true; // No legal moves available, it's a checkmate
}
