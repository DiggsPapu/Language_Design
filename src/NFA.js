import { eClosureT, move, checkState } from "./DFA";

/**
 * Clase con el NFA a construir, incluye:
 *
 * - un alfabeto,
 * - una coleccion de estados
 * - un estado inicial,
 * - un(os) estado(s) de aceptacion,
 * - las transiciones
 *
 */

// esta es la clase del afn
export class NFA {
  constructor(initialState, finalState, states, alphabet, transitions) {
    // estos solo son revisiones para ver si los parametros ingresados con correctos, luego construye el objeto

    if (!Array.isArray(alphabet)) {
      let arr = [];
      arr.push(alphabet.toString());
      alphabet = arr;
    }

    if (!(transitions instanceof Map)) {
      console.error("transitions must be a map");
    }
    this.initialState = initialState;
    this.finalState = finalState;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
  // Inicializar la simulacion
  simulate = (input) => {
    // Inicializar el estado 0
    let S = eClosureT([this.initialState], this);
    let indexInput = 0;
    let c = input[indexInput];
    while (indexInput<input.length) {
      S = eClosureT(move(S, c, this),this);
      indexInput++;
      c = input[indexInput];
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return true;
      } 
      else if (checkState(S[indexState].label, this.finalState)){
        return true;
      };
    };
    return false;
  };
  // YalexSimulation
  yalexSimulate = (input, indexInput) => {
    console.log(input);
    // Inicializar el estado 0
    let S = eClosureT([this.initialState], this);
    console.log(S)
    let c = input[indexInput];
    console.log(c);
    while (indexInput<input.length) {
      S = eClosureT(move(S, c, this),this);
      console.log(S)
      for (let indexState = 0; indexState < S.length; indexState++) {
        if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
          console.log("1salgo")
          return [true, indexInput];
        } 
        else if (checkState(S[indexState].label, this.finalState)){
          console.log("2salgo")
          return [true, indexInput];
        };
      };
      indexInput++;
      c = input[indexInput];
      console.log(c);
    };
    for (let indexState = 0; indexState < S.length; indexState++) {
      if (typeof(this.finalState)!==Array && S[indexState].label === this.finalState.label){
        return [true, indexInput];
      } 
      else if (checkState(S[indexState].label, this.finalState)){
        return [true, indexInput];
      };
    };
    return [false, indexInput];
  };
};
