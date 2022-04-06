You've used 82% of your storage. … If you run out of storage, you won't be able to upload new files.Learn more
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value : null};
  }
  
  render() {
    return (
      <button className="square"
        
        onClick = { ()=> {this.props.onClick()} }>
        {/* TODO */this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  
  renderSquare(i) {
   
    return <Square 
    value = {this.props.squares[i]} //{this.state.squares[i]}
    onClick = { () => this.props.onClick(i)}
    />;
  }
  
  /*
  handleClick(i) {
    const squaresUpd = this.state.squares.slice()
    
    squaresUpd[i] = this.state.xIsNext ? 'X' : 'O';
    // squaresUpd[i] ='X';
    this.setState({
      squares : squaresUpd,
      xIsNext : !this.state.xIsNext})
  }
  */

// React DevTools extension for chrome
// we can see the properties, state of the objects

  render() {
   

    return (
      <div>
        {/* <div className="status">{status}</div> */}
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
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
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history : [{squares: Array(9).fill(null)}],
      xIsNext : true,
      moveNumber: 0
    }
  }
  handleClick(i) {
      // const history = this.state.history;
      const history = this.state.history.slice(0, this.state.moveNumber+1);
      const current = history[history.length-1];
      const squaresUpd = current.squares.slice();
      if (calculateWinner(squaresUpd) || squaresUpd[i]) {
        return;
      }
      squaresUpd[i] = this.state.xIsNext ? 'X' : 'O';
     
      
      this.setState({
        
        history: history.concat([{squares: squaresUpd}]),

        xIsNext : !this.state.xIsNext,
      moveNumber: history.length});

  }
  jumpTo(moveNum) {
    this.setState({
      moveNumber: moveNum,
      xIsNext: (moveNum%2) === 0
    });
  }
  render() {
      const history = this.state.history;
      //const current = history[history.length-1];
      const current = history[this.state.moveNumber];
      // const status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      const winner = calculateWinner(current.squares);
      const moves = history.map((boardState, moveNumber) => {
        const desc = moveNumber ?
        'Go to move#' + moveNumber :
        'Go to start';

        return(
          <li key = {moveNumber}>
            <button onClick={ () => this.jumpTo(moveNumber)}>{desc}</button>
          </li>
        )
      });
      let status;
      if (winner) {
        status = "Winner: " + winner;
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    return (
      <div className="game">
        <div className="game-board">
          <Board squares = {current.squares}
          onClick = {(i) => this.handleClick(i)}
          />

        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}



ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
