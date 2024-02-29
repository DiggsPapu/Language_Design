// 1. aumentar
// 2. construir el arbol con shunting yard
// 3. ponerle numeros a las hojas (excepto a epsilon)
// 4. construir las funciones sobre el arbol
// Refs: https://www.geeksforgeeks.org/regular-expression-to-dfa/
//       https://www.youtube.com/watch?v=leENeyk1T5M

import { minimizeDFA } from "./DFA";
import { NFA } from "./NFA";
import { State } from "./State";
import { TreeNode } from "./TreeNode";

export class SyntaxTree {
  constructor(treeRoot, nodes, regex, maxpos) {
    this.treeRoot = treeRoot;
    this.nodes = nodes;
    this.regex = regex;
    this.tokens = [("return ID", "ID")];
    this.maxpos = maxpos;
    this.alphabet = null;
    this.getAlphabet()
  }
  printSet(set:Set){
    let string = "";
    for (let element of set) {
      string+=" "+element.value+" position: "+element.position+"\n"
    }
    return string;
  }
  printArraySet(sets){
    let string = "";
    for (let i = 0; i<sets.length; i++){
      string+="set"+i+":\n"+this.printSet(sets[i]) + "\n";
    }
    return string;
  }
  // Obtener el alfabeto
  getAlphabet() {
    this.alphabet = [];
    // recorrer la postfix
    for (let i = 0; i < this.regex.regex.length; i++) {
      const l = this.regex.regex[i];
      // si es un simbolo, no es una letra del alfabeto
      if (!["|", ".", "?", "*", "+","ε",")","("].includes(l)) {
        // si no se ha agregado a la lista, se agrega la letra
        if (!this.alphabet.includes(l)) {
          this.alphabet.push(l);
        }
      }
    }
  };
  /**
   *
   * @param {*} set1
   * @param {*} set2
   * @returns un nuevo set con la union de dos conjuntos para poder calcular las funciones del arbol
   */
  union = (set1, set2) => {
    return new Set([...set1, ...set2]);
  };

  /**
   *
   * @param {*} set1
   * @param {*} set2
   * @returns new Set() con la interseccion de dos conjuntos para poder calcular las funciones del arbol
   */
  intersection = (set1, set2) => {
    return new Set([...set1].filter((x) => set2.has(x)));
  };

  /**
   *
   * @param {*} n
   *
   * NULLABLE
   *
   * sobre el nodo, de forma recursiva (cada nodo es un lenguaje regular),
   * me devuelve true si el lenguaje del nodo n puede ser vacio, si no es vacio me devuelve false
   */
  nullable(n) {
    // en el caso de llegar a una hoja...
    if (n.left === null && n.right === null) {
      // verificar que no sea un epsilon
      return n.value === "ε";
    } else {
      // ahora hay que ver cada caso y ejecutar recursivamente las operaciones respecto a las reglas
      if (n.value === "*" || n.value === "?") {
        // definitivamente es anulable
        return true;
      } else if (n.value === "+") {
        // se le pasa a su nodo hijo
        return this.nullable(n.left);
      } else if (n.value === ".") {
        // se verifica la verdad en ambos casos
        return this.nullable(n.left) && this.nullable(n.right);
      } else if (n.value === "|") {
        // con que uno de los dos sea verdadero este nodo sera anulable
        return this.nullable(n.left) || this.nullable(n.right);
      }
    }
  }

  /**
   *
   * @param {*} n
   *
   * el nodo n genera un lenguaje, cada palabra tiene una pos en el arbol,
   * firstpos devuelve cada posicion para esa palabra en el arbol
   */
  firstpos(n) {
    // revisar si se llega a una hoja
    if (n.left === null && n.right === null) {
      if (n.value === "ε") {
        return new Set();
      } else {
        return new Set([n]);
      }
    } else {
      // si no es porque estamos en un operador
      if (n.value === "*" || n.value === "+" || n.value === "?") {
        return this.firstpos(n.left);
      } else if (n.value === ".") {
        if (this.nullable(n.left)) {
          // hacer A U B para el nodo
          return this.union(this.firstpos(n.left), this.firstpos(n.right)); //this.firstpos(n.left).union(this.firstpos(n.right));
        } else {
          return this.firstpos(n.left);
        }
      } else if (n.value === "|") {
        // hacer A U B para el nodo
        return this.union(this.firstpos(n.left), this.firstpos(n.right)); // igual q arriba
      }
    }
  }

  /**
   *
   * @param {*} n
   *
   * es basicamente lo mismo que firstpos pero calculando las ultimas posiciones, es decir,
   * acorde a la estructura del arbol planteada, deberia retornar las hojas que se encuentren
   * antes a la derecha, mientras que firstpos retorna las que esten a la izquierda
   */
  lastpos(n) {
    if (n.left === null && n.right === null) {
      if (n.value === "ε") {
        return new Set();
      } else {
        return new Set([n]);
      }
    } else {
      // si no es porque estamos en un operador
      if (n.value === "*" || n.value === "+" || n.value === "?") {
        return this.lastpos(n.left);
      } else if (n.value === ".") {
        if (this.nullable(n.right)) {
          // retornar la union de conjuntos de los nodos hijos
          return this.union(this.lastpos(n.left), this.lastpos(n.right)); // this.lastpos(n.left).union(this.lastpos(n.right));
        } else {
          return this.lastpos(n.right);
        }
      } else if (n.value === "|") {
        // retornar la union de conjuntos de los hijos

        return this.union(this.lastpos(n.left), this.lastpos(n.right));
      }
    }
  }

  /**
   *
   * @param {*} i
   *
   * calcula el conjunto followpos de un nodo
   */
  followpos(n) {
    // retornar el followpos de una hoja
    if (n.left === null && n.right === null) {
      return new Set();
    } else {
      // si se llega a un star-node
      if (n.value === "*" || n.value === "+") {
        let i = this.lastpos(n);
        // unir los subconjuntos para cada estado
        for (const state of i) {
          state.followpos = this.union(state.followpos, this.firstpos(n)); // ojo aqui
          // state.followpos.union(this.firstpos(n));
        }
      } else if (n.value === ".") {
        let i = n.left.lastpos;
        for (const state of i) {
          state.followpos = this.union(state.followpos, n.right.firstpos);
          //state.followpos.union(n.right);
        }
      } else {
        return new Set();
      }
    }
  }
  isInDStates(set, dStates){
    if (set.size === 0 ) return -2;
    for (let k = 0; k < dStates.length; k++) {
      let set_1 = dStates[k];
      if (set.size === set_1.size){
        let positions = [];
        let positions2 = [];
        for (let node of  set_1) {
          positions.push(node.position);
        }
        for (let node of set){
          positions2.push(node.position);
        }
        let sortedArray1 = [...positions].sort(function(a, b) {
            return a - b;
        });
        let sortedArray2 = [...positions2].sort(function(a, b) {
          return a - b;
        });
        let isSame = true;
        for (let i = 0; i < sortedArray1.length; i++){
          if (sortedArray1[i]!== sortedArray2[i]){
            isSame = false
            break;
          };
        };
        if (isSame){
          return k;
        }
      };      
    };
    return -1;
  };
  generateDirectDFA(augmented) {
    const tokens = this.tokens;
    // Aniadir un # al final
    let lastNode = this.nodes[this.nodes.length - 1];
    let newFinishNode = new TreeNode("#",null,null,this.maxpos);
    let newDotNode = new TreeNode(".",this.treeRoot,newFinishNode,null);
    this.nodes.push(newFinishNode);
    this.nodes.push(newDotNode);
    this.treeRoot = newDotNode;
    // hacer el calculo de las funciones para cada nodo del arbol
    this.nodes.forEach((node) => {
      node.nullable = this.nullable(node);
      node.firstpos = this.firstpos(node);
      node.lastpos = this.lastpos(node);
      node.followpos = this.followpos(node);
    });
    this.treeRoot.followpos = this.followpos(this.treeRoot);
    // Estados del dfa
    let dStates = [this.treeRoot.firstpos];
    // All this will be one state.
    let unmarkedStates = [this.treeRoot.firstpos];
    let q0 = new State("q0", new Map());
    let dfaArray = [q0];
    let finalStates = [];
    let isFinal0 = false
    this.treeRoot.firstpos.forEach((state)=> {
      if (state.value === "#"){
        isFinal0 = true;
      };
    });
    if (isFinal0){
      finalStates.push(q0);
    }
    while (unmarkedStates.length>0){
      let S = unmarkedStates.pop();
      for (let i = 0; i<this.alphabet.length; i++){
        let U = new Set();
        let a_symbol = this.alphabet[i];
        S.forEach((state) => {  
          if (state.value === a_symbol) {
            if (state.followpos.size>1){
              state.followpos.forEach((new_s) => U.add(new_s));
            }
            else {U.add(...state.followpos);}
          };
        });
        let indexU = this.isInDStates(U, dStates);
        let indexS = dStates.indexOf(S);
        if (!(U.size===0)&&(indexU===-1)){
          dStates.push(U);
          unmarkedStates.push(U);
          let newIndex = dfaArray.length
          dfaArray.push(new State(`q${newIndex}`, new Map()));
          dfaArray[indexS].transitions.set(a_symbol, `q${newIndex}`);
          let isFinal = false
          U.forEach((state)=> {
            if (state.value === "#"){
              isFinal = true;
            };
          });
          if (isFinal){
            finalStates.push(dfaArray[newIndex])
          }
        };
        if (indexU>-1){
          dfaArray[indexS].transitions.set(a_symbol, `q${indexU}`);
        };
      };
    };
    let transitions = new Map();
  for (let i=0; i < dfaArray.length ; i++) {
    transitions.set(dfaArray[i].label, dfaArray[i].transitions);
  };
    return new NFA(q0,finalStates,dfaArray,this.alphabet,transitions);
  }
}