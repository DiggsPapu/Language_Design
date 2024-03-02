import "./App.css";
import React, { useState } from "react";
import { Regex } from "./Regex";
import { Thompson } from "./Thompson";
import { ThompsonToken } from "./ThompsonToken";
// import { SyntaxTree } from "./SyntaxTree";
import { Graphviz } from "graphviz-react";
import { generateDirectDFA, NFAToDFA, minimizeDFA, simulateNfa } from "./DFA";
import { NFA } from "./NFA";
import { State } from "./State";
import {
  getByValue,
  fixLabels,
  drawGraphDFA,
  drawGraph,
  drawTree,
  drawTreeTokens,
} from "./drawFunctions";
import * as trial from "./Trial";
import { SyntaxTree } from "./SyntaxTree";
import FileDrop from "./components/FileDrop";

function App() {
  const [input, setInput] = useState("");
  const [checkInput, setCheckInput] = useState("");
  const [nfa, setNfa] = useState(null);
  const [dfa, setDfa] = useState(null);
  const [directDfa, setDirectDfa] = useState(null);
  const [directDfaMin, setDirectDfaMin] = useState(null);
  const [dfaMin, setDfaMinimized] = useState(null);
  const [outputNfaS, setOutputNFAS] = useState("");
  const [outputDfaS, setOutputDFAS] = useState("");
  const [outputDfamin, setOutputDFAmin] = useState("");
  const [outputDfaD, setOutputDFAD] = useState("");
  const [outputDfaDmin, setOutputDFADmin] = useState("");
  const [postfix, setPostfix] = useState("");
  const [sintaxTree, setSintaxTree] = useState(null);
  const [dotSintaxTree, setDotSintaxTree] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );
  const [dotNFA, setDotNFA] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );
  const [dotDFA, setDotDFA] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );
  const [dotMinDFA, setDotMinDFA] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );
  const [dotDirDFA, setDotDirDFA] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );
  const [dotDirDFAMin, setDotDirDFAMin] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );
  const [dotLex, setDotLex] = useState(
    "digraph fsm {rankdir=LR;node [shape = point]; INITIAL_STATE;node [shape = doublecircle]; q1;node [shape = circle];INITIAL_STATE -> q0;q0 -> q1 [label=ε];}"
  );

  const handleClick = () => {
    console.log(input)
    const regex = new Regex(input);
    setPostfix(regex.postfix);
    const thompson1 = new ThompsonToken(regex.postfixTokenized);
    const tokenTree = regex.constructTokenTree();
    setDotNFA(drawGraph(thompson1.nfa));
    const ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
    const nfaToDfa = NFAToDFA(thompson1.nfa);
    setDotDFA(drawGraphDFA(nfaToDfa));
    const dfaMinimized = minimizeDFA(nfaToDfa);
    setDotMinDFA(drawGraphDFA(dfaMinimized));
    
    setSintaxTree(ast);
    setDotSintaxTree(drawTreeTokens(ast));
    const directDfa = ast.generateDirectDFATokens()
    const directDFAMin = minimizeDFA(directDfa);
    
    setNfa(thompson1.nfa);
    setDfa(nfaToDfa);
    setDfaMinimized(dfaMinimized);
    setDirectDfa(directDfa);
    setDirectDfaMin(directDFAMin);
    setDotDirDFA(drawGraphDFA(directDfa));
    setDotDirDFAMin(drawGraphDFA(directDFAMin));
    setDotSintaxTree(drawTreeTokens(ast));
  };
  
  const clickSimulate = () => {
    let startTime = performance.now();
    nfa.simulate(checkInput)?setOutputNFAS("Yes, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds"):setOutputNFAS("No, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds");
    startTime = performance.now();
    dfa.simulate(checkInput)?setOutputDFAS("Yes, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds"):setOutputDFAS("No, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds");
    startTime = performance.now();
    dfaMin.simulate(checkInput)?setOutputDFAmin("Yes, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds"):setOutputDFAmin("No, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds");
    startTime = performance.now();
    directDfa.simulate(checkInput)?setOutputDFAD("Yes, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds"):setOutputDFAD("No, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds");
    startTime = performance.now();
    directDfaMin.simulate(checkInput)?setOutputDFADmin("Yes, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds"):setOutputDFADmin("No, time: "+(-startTime+performance.now()).toFixed(30).toString()+" seconds");
  };

  return (
    <div className="App">
      <h1>Lab AB</h1>
      <h4>Diego Andrés Alonzo Medinilla 20172</h4>
      <div className="grid-container">
        <div className="graph-container">
          <h2>Enter a regex:</h2>
          <input
          type="text"
          placeholder="ingrese una regex"
          id="regex-input"
          value={input}
          onChange={(e) => setInput(e.target.value)} />
          <button onClick={handleClick}>Accept</button>
        </div>
        <div className="graph-container">
          <h2>Postfix:</h2>
          <h3 id="postfix" name="postfix">
            {postfix}
          </h3>
        </div>
        <div className="graph-container">
          <h2>Enter a simulate chain:</h2>
          <input
          type="text"
          placeholder="ingrese una cadena para la simulacion"
          id="validar"
          value={checkInput}
          onChange={(e) => setCheckInput(e.target.value)} />
          <button id="enter2" onClick={clickSimulate}>aceptar</button>
        </div>
        <div className="graph-container">
          <h2>NFA:</h2>
          <Graphviz dot={dotNFA}  options={{

totalMemory: 33554432, // Set the desired total memory value
allowMemoryGrowth: true, // Allow memory growth at runtime
abortingMalloc: false,   // Disable aborting on malloc failure
}}/>
          <p>Simulation:{outputNfaS}</p>
        </div>
        <div className="graph-container">
          <h2>DFA:</h2>
          <Graphviz dot={dotDFA}  options={{

totalMemory: 33554432, // Set the desired total memory value
allowMemoryGrowth: true, // Allow memory growth at runtime
abortingMalloc: false,   // Disable aborting on malloc failure
}}/>
          <p>Simulate:{outputDfaS}</p>
        </div>
        <div className="graph-container">
          <h2>Min DFA:</h2>
          <Graphviz dot={dotMinDFA} />
          <p>Simulate:{outputDfamin}</p>
        </div>
        <div className="graph-container">
          <h2>Syntax Tree:</h2>
          <Graphviz dot={dotSintaxTree} />
          </div>
        <div className="graph-container">
          <h2>DIRECT DFA:</h2>
          <Graphviz dot={dotDirDFA} />
          <p>Simulate:{outputDfaD}</p>
        </div>
        <div className="graph-container">
          <h2>Min DIRECT DFA:</h2>
          <Graphviz dot={dotDirDFAMin} options={{

            totalMemory: 33554432, // Set the desired total memory value
            allowMemoryGrowth: true, // Allow memory growth at runtime
            abortingMalloc: false,   // Disable aborting on malloc failure
          }}/>
          <p>Simulate:{outputDfaDmin}</p>
        </div>
      </div>
      <FileDrop/>
      {/* <hr />
      <h1>Lab 3</h1>

      <label for="yalex">Seleccione un archivo Yalex: </label>
      <br />
      <input type="file" id="yalex" name="yalex" accept=".txt, .yal"></input>
      <br />
      <button id="enter-yalex">aceptar</button>

      <h2>Diagrama de transicion de estados:</h2>
      <Graphviz dot={dotLex} /> */}
    </div>
  );
}

export default App;
