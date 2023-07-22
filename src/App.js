import './App.css';
import { useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";
import { Button } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';


const ENDPOINT = "https://socket-server-tep2.onrender.com";
const socket = socketIOClient(ENDPOINT);




function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, user, connectedUser, nextPlayer }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'O';
    } else {
      nextSquares[i] = 'X';
    }
    onPlay(nextSquares,nextPlayer);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + user;
  } else {
    status = nextPlayer + ' playing';
  }

  return (
    <>
      <div className="status text-info">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {

  const [rooms, setRoom] = useState([]);
  const [user, setUser] = useState('');
  const [isUser, setisUser] = useState(false);
  const [isConnected, setisConnected] = useState(false);
  const [connectedUser, setconnectedUser] = useState('');
  const [currentUser, setcurrentUser] = useState('');
  const [currentSquares, setcurrentSquares] = useState('');
  const [nextPlayer,setnextPlayer] = useState('')

  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  //var currentSquares = history[history.length - 1];
  
  function handlePlay(nextSquares,nextPlayer) {
    if(nextPlayer != user) return true;
    setHistory([...history, nextSquares]);
    setXIsNext(!xIsNext);
    setnextPlayer(nextPlayer)
    setcurrentSquares(nextSquares)
    socket.emit("userPlay", connectedUser.socketid, nextSquares, connectedUser.username, xIsNext, socket.id)
  }

  var createUser = e =>{
    var newdata = rooms.filter(function(item){
        return item.username === user        
      })
    if(newdata.length === 0 && user!=''){
      socket.emit("createNewUser", user)
      setcurrentUser('')
      setisUser(true)
    }else if(user==''){
      alert("user field is mandatory")
    }else{
      alert("user exsist : "+user)
    }
   
  }
  var refresh = e =>{
    console.log(currentSquares)
      setcurrentSquares(Array(9).fill(null))
      setXIsNext(!xIsNext)
      setnextPlayer(user)
      socket.emit("userPlay", connectedUser.socketid, Array(9).fill(null), user, !xIsNext, socket.id)
  }
  var join = (socketid, username) => {
    socket.emit("connectUser", socketid, user, socket.id, xIsNext)
    setisConnected(true)
    setconnectedUser({username,socketid})
    setnextPlayer(user)
    
  }

  useEffect(() => {
    socket.emit("connected")
    setcurrentSquares(history[history.length - 1])
    socket.on("newUserResponse", data => {
      
      var newdata = data.filter(function(item){
        return item.socketid != socket.id && item.connected == false;         
      })
      setRoom(newdata)
    });
    socket.on("userConnected", data => {
      setisConnected(true)
      setconnectedUser(data)

    });
    socket.on("userPlayResponse", data => {
      setcurrentSquares(data)

    });
    socket.on("nextPlayer", data => {
      setnextPlayer(data);

    });
    socket.on("nextX", data => {
      setXIsNext(!data);

    });
  }, []);

  return (
    <div className="container p-0 mt-4">

        <div className="container">
          <div className="row">
            {isUser && <p className="text-dark">Current User : {user}</p>}
            {!isUser &&
            <div className="col-sm">
              <div>
              
              
              <p>Create User</p>
              <input onChange={ e => {setcurrentUser(e.target.value);setUser(e.target.value) }} value={currentUser} required/>
              </div>
              <div>
              <Button variant="primary" size="sm" onClick={createUser}  className="mt-2">
                  Create User
              </Button>
              </div>
  
            
            </div>
            }
            {isConnected &&
            <div className="col-sm">
              <div className="game-board">
                <p className="text-success">Playing with: {connectedUser.username}</p>
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} user={user} connectedUser={connectedUser} nextPlayer={nextPlayer}/>
                <Button variant="secondary" size="sm" onClick={refresh}  className="mt-2 refresh-btn" >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                  <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                </svg>
                &nbsp;Refresh
                </Button>
              </div>
            </div>
            }
            {isUser && rooms.length === 0 && !isConnected &&
              <div className="alert alert-info" role="alert">
              There is no active user found to play! Waiting for users...
              </div>
            }
            {!isConnected && rooms.length>0 &&  isUser &&
            <div className="col-sm">
            <p className="text-warning">List of Active Users to connect</p>
            {isUser && !isConnected && 
              <ListGroup>
              {rooms.map(function(room,index){
                return (
                  <div key={index}>   
                    <ListGroup.Item  className="p-4">{room.username} - {room.socketid} - {room.connected?'connected':'not connected'}<Button variant="primary" size="sm" className="right-btn" onClick={() => join(room.socketid,room.username)} >Connect</Button></ListGroup.Item>
                  
                  </div>
              )
              })}
              </ListGroup>
              }
            </div>
            }
           
          </div>
        </div>
       <div className="mb-3 w-100">
     
      
      </div>

    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
