import { State } from "./State";
import { NFA } from "./NFA";
import { Tree } from "./Tree"

export function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue) return key;
  }
}
export const fixLabels = (nfa) => {
  let newStates = [];
  let count = 0;
  let newTransitions = new Map();
  let relations = new Map();

  for (let i = 0; i < nfa.states.length; i++) {
    const state = nfa.states[i];
    relations.set(`Q${count}`, state.label);
    count++;
  }

  for (const [key, transition] of relations) {
    for (const [lastKey, lastTransition] of nfa.transitions) {
      if (transition === lastKey) {
        newTransitions.set(key, lastTransition);
      }
    }
  }

  for (const [key, transition] of newTransitions) {
    for (const [symbol, nextState] of transition) {
      newTransitions.get(key).set(symbol, getByValue(relations, nextState));
    }
  }

  for (const [key, transition] of newTransitions) {
    newStates.push(new State(key, transition));
  }

  const initialStateLabel = getByValue(relations, nfa.initialState.label);
  const q0 = new State(
    initialStateLabel,
    newTransitions.get(initialStateLabel)
  );

  let finals = [];

  if (nfa.finalState instanceof Array) {
    for (let i = 0; i < nfa.finalState.length; i++) {
      const final = nfa.finalState[i];
      const finalStateLabel = getByValue(relations, final.label);
      const qf = new State(
        finalStateLabel,
        newTransitions.get(finalStateLabel)
      );
      finals.push(qf);
    }
  } else {
    const finalStateLabel = getByValue(relations, nfa.finalState.label);
    const qf = new State(finalStateLabel, newTransitions.get(finalStateLabel));
    finals.push(qf);
  }

  const dfa = new NFA(q0, finals, newStates, nfa.alphabet, newTransitions);

  return [dfa, relations];
};

export const drawGraphDFA = (nfa) => {
  let dotStr = "digraph fsm {\n";
  dotStr += "rankdir=LR;\n";
  dotStr += 'size="8,5";\n';
  dotStr += "node [shape = point]; INITIAL_STATE\n";

  nfa.finalState.forEach((s) => {
    dotStr += "node [shape = doublecircle]; " + s.label + ";\n";
  });

  dotStr += "node [shape = circle];\n";
  dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";

  nfa.transitions.forEach((nextStates, state) => {
    nextStates.forEach((destinies, symbol) => {
      switch (symbol){
        case "+":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#43;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#43;\"];\n";
          }
          break;
        case "*":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#42;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#42;\"];\n";
          }
          break;
        case ".":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#46;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#46;\"];\n";
          }
          break;  
        case ";":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#59;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#59;\"];\n";
          }
          break;  
        case "|":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#124;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#124;\"];\n";
          }
          break; 
        case "(":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#40;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#40;\"];\n";
          }
          break; 
        case ")":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#41;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#41;\"];\n";
          }
          break; 
        case " ":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\" \"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\" \"];\n";
          }
          break; 
        default:
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
          }
          break;
      };
    });
  });

  dotStr += "}";

  return dotStr;
};

export const drawGraph = (nfa) => {
  let dotStr = "digraph fsm {\n";
  dotStr += "rankdir=LR;\n";
  dotStr += 'size="8,5";\n';
  dotStr += "node [shape = point]; INITIAL_STATE\n";
  dotStr += "node [shape = doublecircle]; " + nfa.finalState.label + ";\n";
  dotStr += "node [shape = circle];\n";
  dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";

  nfa.transitions.forEach((nextStates, state) => {
    nextStates.forEach((destinies, symbol) => {
      switch (symbol){
        case "+":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#43;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#43;\"];\n";
          }
          break;
        case "*":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#42;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#42;\"];\n";
          }
          break;
        case ".":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#46;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#46;\"];\n";
          }
          break;  
        case ";":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#59;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#59;\"];\n";
          }
          break;  
        case "|":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#124;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#124;\"];\n";
          }
          break; 
        case "(":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#40;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#40;\"];\n";
          }
          break; 
        case ")":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\"&#41;\"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\"&#41;\"];\n";
          }
          break; 
        case " ":
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=\" \"];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=\" \"];\n";
          }
          break; 
        default:
          if (destinies instanceof Array) {
            destinies.forEach((s) => {
              dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
            });
          } else {
            dotStr +=
              "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
          }
          break;
      };
    });
  });

  dotStr += "}";

  return dotStr;
};

export const drawGraphTokens = (nfa) => {
  let dotStr = "digraph fsm {\n";
  dotStr += "rankdir=LR;\n";
  dotStr += 'size="8,5";\n';
  dotStr += "node [shape = point]; INITIAL_STATE\n";
  dotStr += "node [shape = doublecircle]; " + nfa.finalState.label + ";\n";
  dotStr += "node [shape = circle];\n";
  dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";

  nfa.transitions.forEach((nextStates, state) => {
    nextStates.forEach((destinies, symbol) => {
      if (destinies instanceof Array) {
        destinies.forEach((s) => {
          dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
        });
      } else {
        dotStr +=
          "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
      }
    });
  });

  dotStr += "}";

  return dotStr;
};
export const drawTree = (tree) =>{
  let counter = 0;
  let dotStr = "digraph tree {\n";
  dotStr += "rankdir=TB;\n";
  dotStr += 'size="8,5";\n';
  
  [dotStr, counter] = drawTreeNode(tree.treeRoot,counter,dotStr);
  dotStr += "}";
  return dotStr;
};
function drawTreeNode(node, counter, string_graph){
  if (node !== null){
    // console.log(node.value)
    string_graph+=counter+" [label=\""+node.value+"\"];\n";
    counter++;
    let copy_c = counter-1;
    if (node.left !== null){
      string_graph += "" + copy_c+ " -> " + counter + ";\n";
      [string_graph,counter] = drawTreeNode(node.left, counter, string_graph);
    }
    if (node.right !== null){
      string_graph += "" + copy_c+ " -> " + counter + ";\n";
      [string_graph,counter] = drawTreeNode(node.right, counter, string_graph);
    }
  };
  return [string_graph, counter]
};