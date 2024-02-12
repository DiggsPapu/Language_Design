// 1. aumentar
// 2. construir el arbol con shunting yard
// 3. ponerle numeros a las hojas (excepto a epsilon)
// 4. construir las funciones sobre el arbol

export class SyntaxTree {
  constructor(tree, nodesList, regex) {
    this.tree = tree;
    this.nodesList = nodesList;
    this.regex = regex;
  }

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
        return true;
      } else if (n.value === "+") {
        return this.nullable(n.left);
      } else if (n.value === ".") {
        return this.nullable(n.left) && this.nullable(n.right);
      } else if (n.value === "|") {
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
          return this.firstpos(n.left).union(this.firstpos(n.right));
        } else {
          return this.firstpos(n.left);
        }
      } else if (n.value === "|") {
        return this.firstpos(n.left).union(this.firstpos(n.right));
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
          return this.lastpos(n.left).union(this.lastpos(n.right));
        } else {
          return this.lastpos(n.right);
        }
      } else if (n.value === "|") {
        return this.lastpos(n.left).union(this.lastpos(n.right));
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
      // si se llega a un operador...
      if (n.value === "*" || n.value === "+") {
        let first = this.lastpos(n);
        // unir los subconjuntos para cada estado
        for (const state of first) {
          state.followpos.union(this.firstpos(n));
        }
      } else if (n.value === ".") {
        let first = this.lastpos(n.left);
        for (const state of first) {
          state.followpos.union(n.right);
        }
      } else {
        return new Set();
      }
    }
  }

  direct() {}
}