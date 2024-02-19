// 1. aumentar
// 2. construir el arbol con shunting yard
// 3. ponerle numeros a las hojas (excepto a epsilon)
// 4. construir las funciones sobre el arbol
// Refs: https://www.geeksforgeeks.org/regular-expression-to-dfa/
//       https://www.youtube.com/watch?v=leENeyk1T5M

import { minimizeDFA } from "./DFA";
import { NFA } from "./NFA";

export class SyntaxTree {
  constructor(treeRoot, nodes, regex) {
    this.treeRoot = treeRoot;
    this.nodes = nodes;
    this.regex = regex;
    this.tokens = [("return ID", "ID")];
  }

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
        let i = this.lastpos(n.left);
        for (const state of i) {
          state.followpos = this.union(state.followpos, this.firstpos(n.right));
          //state.followpos.union(n.right);
        }
      } else {
        return new Set();
      }
    }
  }

  generateDirectDFA(augmented) {
    const tokens = this.tokens;
    // hacer el calculo de las funciones para cada nodo del arbol
    this.nodes.forEach((node) => {
      node.nullable = this.nullable(node);
      node.firstpos = this.firstpos(node);
      node.lastpos = this.lastpos(node);
      node.followpos = this.followpos(node);
    });
    console.log(this.nodes);
    console.log(this.treeRoot);

    // se necesita lo siguiente para armar el DFA
  }
}