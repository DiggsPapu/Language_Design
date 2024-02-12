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

// export const drawTree = (tree:Tree) =>{
  
//   let dotStr = "digraph tree {\n";
//   dotStr += "rankdir=BT;\n";
//   dotStr += 'size="8,5";\n';
//   dotStr += "node [shape = point]; INITIAL_STATE\n";
//   dotStr += "node [shape = circle]; " + tree.finalState.label + ";\n";
//   dotStr += "node [shape = circle];\n";
//   dotStr += "INITIAL_STATE -> " + nfa.initialState.label + ";\n";

//   nfa.transitions.forEach((nextStates, state) => {
//     nextStates.forEach((destinies, symbol) => {
//       if (destinies instanceof Array) {
//         destinies.forEach((s) => {
//           dotStr += "" + state + " -> " + s + " [label=" + symbol + "];\n";
//         });
//       } else {
//         dotStr +=
//           "" + state + " -> " + destinies + " [label=" + symbol + "];\n";
//       }
//     });
//   });

//   dotStr += "}";

//   return dotStr;
// };