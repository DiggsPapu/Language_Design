import "./App.css";
import React, { useState } from "react";
import { Regex } from "./Regex";
import { Thompson } from "./Thompson";
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
} from "./drawFunctions";
import * as trial from "./Trial";
import { SyntaxTree } from "./SyntaxTree";

function App() {
  const [input, setInput] = useState("");
  const [checkInput, setCheckInput] = useState("");
  const [nfa, setNfa] = useState(null);
  const [dfa, setDfa] = useState(null);
  const [directDfa, setDirectDfa] = useState(null);
  const [dfaMin, setDfaMinimized] = useState(null);
  const [outputNfaS, setOutputNFAS] = useState("");
  const [outputDfaS, setOutputDFAS] = useState("");
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
    const regex = new Regex(input);
    console.log(regex)
    setPostfix(regex.postfix);
    // const syntaxTree = new SyntaxTree(postfix);
    
    const thompson = new Thompson(regex.postfix);
    setDotNFA(drawGraph(thompson.nfa));
    const tree = regex.constructTree();
    const ast = new SyntaxTree(tree[0], tree[1], regex, tree[2]);
    const nfaToDfa = NFAToDFA(thompson.nfa);
    // console.log(nfaToDfa)
    const [dfaI, relations] = fixLabels(nfaToDfa);
    setDotDFA(drawGraphDFA(dfaI));
    const directDfa = ast.generateDirectDFA()
    const dfaMinimized = minimizeDFA(dfaI);
    // console.log(dfaMinimized);
    setDotMinDFA(drawGraphDFA(dfaMinimized));
    setNfa(thompson.nfa);
    setDfa(dfaI);
    setDfaMinimized(dfaMinimized);
    setDirectDfa(directDfa);
    setDotDirDFA(drawGraphDFA(directDfa));
    setDotDirDFAMin(drawGraphDFA(minimizeDFA(directDfa)));
    setSintaxTree(ast);
    setDotSintaxTree(drawTree(ast));
    console.log(ast)
  };
  
  const clickSimulate = () => {
    let startTime = performance.now();
    nfa.simulate(checkInput)?setOutputNFAS("Si, se tardo: "+(-startTime+performance.now()).toFixed(30).toString()+" segundos"):setOutputNFAS("No, se tardo: "+(-startTime+performance.now()).toFixed(30).toString()+" segundos");
    startTime = performance.now();
    dfa.simulate(checkInput)?setOutputDFAS("Si, se tardo: "+(-startTime+performance.now()).toFixed(30).toString()+" segundos"):setOutputDFAS("No, se tardo: "+(-startTime+performance.now()).toFixed(30).toString()+" segundos");
  };

  return (
    <div className="App">
      <h1>Lab AB</h1>

      <input
        type="text"
        placeholder="ingrese una regex"
        id="regex-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleClick}>Aceptar</button>

      <h2>Postfix:</h2>
      <h3 id="postfix" name="postfix">
        {postfix}
      </h3>
      <h2>Sintax Tree:</h2>
      <Graphviz dot={dotSintaxTree} />

      <h2>AFN:</h2>
      <Graphviz dot={dotNFA} />

      <h2>AFD generado a partir de AFN:</h2>
      <Graphviz dot={dotDFA} />

      <h2>AFD minimizado:</h2>
      <Graphviz dot={dotMinDFA} />
      <Graphviz dot={dotDirDFAMin} />

      <h2>AFD directamente construido con regex:</h2>
      <Graphviz dot={dotDirDFA} />
      <h2>AFD directamente construido con regex (minimizado):</h2>
      <Graphviz dot={dotDirDFAMin} />

      <h2>Simulaciones</h2>
      <input
        type="text"
        placeholder="ingrese una cadena para la simulacion"
        id="validar"
        value={checkInput}
        onChange={(e) => setCheckInput(e.target.value)}
      />
      <button id="enter2" onClick={clickSimulate}>aceptar</button>
      <h3>Simulacion AFN:</h3>
      <h3 id="afn-simulado">{outputNfaS}</h3>
      <h3>Simulacion AFD:</h3>
      <h3 id="afd-simulado">{outputDfaS}</h3>

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
