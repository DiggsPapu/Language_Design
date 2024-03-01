/**
 * Es el Algoritmo de Shunting yard
 * Clase para guardar la regex de algun modo y poder pasarla a postfix
 *
 * tiene:
 *
 * - una regex
 *
 * - una expresion postfix
 *
 * - si la regex ingresada es valida
 *
 * - una regex con puntos como operadores de concatenacion
 *
 */

import { Token } from "./Token";
import { TreeNode } from "./TreeNode";
const regexTokens = {
  LPAREN: "(",
  RPAREN: ")",
  OR: "|",
  CONCAT: ".",
  POSITIVE_CLOSURE: "+",
  KLEENE: "*",
  BACKSLASH:"\\",
}
export class Regex {
  constructor(regex) {
    this.regex = regex;
    this.valid = this.isValid(regex);
    console.log(this.valid);
    if (this.valid) {
      this.regexWithDots = this.insertDotsInRegex();
      this.regexTokenized = this.tokenize(this.regexWithDots);
      this.postfixTokenized = this.infixToPostfixTokenized();
      console.log(this.postfixTokenized);
      this.postfix = this.infixToPostfix(this.regexWithDots);
      this.augmented = this.regexWithDots + "#";
    } else {
      this.postfix = "";
      console.error("input incorrecto");
    }
  }
  // sirve para ver si un elemento es operador
  isOperator(element) {
    return ["|", ".", "?", "*", "+", "(", ")"].includes(element);
  }

  // para verificar regex validas, true es valida, false es no valida
  isValid(regex) {
    // ver que no existan . ? + |
    if (regex === ".") return false;
    if (regex === "?") return false;
    if (regex === "+") return false;
    if (regex === "|") return false;
    if (regex === "*") return false;
    // ver directamente desde la regex, si se ingresaron mas '(' que ')'
    let lefts = 0;
    let rights = 0;
    // ver si hay casos tipo (. , (+ o similares incorrectos
    let last = "";

    for (let i = 0; i < regex.length; i++) {
      const c = regex[i];

      if (c === "(") {
        lefts++;
      }

      if (c === ")") {
        rights++;
      }

      if (i !== 0) {
        last = regex[i - 1];
        // ver errores con parentesis
        // antes
        if (
          (c === "*" || c === "+" || c === "?" || c === "." || c === "|") &&
          (last === "(" && regex[i -2] !== "\\")
        ) {
          console.log("hey4")
          return false;
        }
        // despues
        if (c === ")" && (last === "(" || last === "." || last === "|") && regex[i -2] !== "\\") {
          console.log("hey3");
          return false;
        }

        // ver errores con operadores binarios
        if (
          (c === "*" || c === "+" || c === "?" || c === "." || c === "|") &&
          (last === "." && regex[i -2] !== "\\")
        ) {
          console.log("hey2");
          return false;
        }
        if (
          (c === "*" || c === "+" || c === "?" || c === "." || c === "|") &&
          (last === "|" && regex[i -2] === "\\")
        ) {
          console.log("hey1");
          return false;
        }
      }
      else {
        if (
          (c === "*" || c === "+" || c === "?" || c === "." || c === "|")&&(regex[i-1]!=="\\")
        ) {
          console.log("hey0")
          return false;
        }
      }
    }

    // ver si el ultimo caracter es binario
    if ((regex[regex.length - 1] === "." && (regex[regex.length-2]!=="\\")) || (regex[regex.length - 1] === "|" && (regex[regex.length-2]!=="\\"))) {
      return false;
    }

    // ver si existe la misma cantidad de parentesis derechos e izquierdos
    if (lefts !== rights) {
      return false;
    }

    // si nada de lo anterior se cumple, se acepta la regex
    return true;
  }

  // para manejar correctamenta la concatenacion con el punto y que el thompson no se trabe,
  insertDotsInRegex() {
    // se necesita la regex a recorrer, y un postfix vacio a construir
    const regex = this.regex;
    let converted = "";

    // recorrer cada caracter para construir la regex con puntos
    for (let c = 0; c < regex.length; c++) {
      const element = regex[c];
      converted += element;

      // para el parentesis izquierdo y el operador union es imposible concatenar, lo mismo si ya existe la concatenacion
      if ((element === "(" || element === "|" || element === ".")&&(regex[c-1]!=="\\")) {
        continue;
      }

      // si no se ha llegado al ultimo caracter
      if (c < regex.length - 1) {
        // se obtiene cual es el siguiente
        const next = regex[c + 1];

        // se revisa si es un operador no igual a '(', si si, se interrumpe la iteracion
        if ((this.isOperator(next) && next !== "(") && regex[c]!=="\\") {
          continue;
        }
        else if (regex[c]==="\\"){
          continue;
        }
        // si no, concatenamos
        converted += ".";
      }
    }
    console.log(converted)
    return converted;
  }

  tokenize(exp){
    // This list will have the tokens
    let tokens = [];
    let token = null;
    for (let i = 0; i<exp.length; i++){
      switch(exp[i]){
        case "*":
          token = new Token("*", 2);
          tokens.push(token);
          break;
        case "+":
          token = new Token("+", 2);
          tokens.push(token);
          break;
          case "?":
            token = new Token("?", 2);
            tokens.push(token);
            break;
        case ".":
          token = new Token(".", 1);
          tokens.push(token);
          break;
        case "|":
          token = new Token("|", 0);
          tokens.push(token);
          break;
        case "(":
          token = new Token("(", -1);
          tokens.push(token);
          break;
        case ")":
          token = new Token(")", 3);
          tokens.push(token);
          break;
        case "\\":
          i++;
          token = new Token(exp[i], -2);
          tokens.push(token);
          break;
        default:
          token = new Token(exp[i], -2);
          tokens.push(token);
          break;  
      };
    };
    return tokens;
  }
  infixToPostfixTokenized() {

    // declarar postfix vacia, stack vacio y la procedencia de operadores
    let postfix = [];
    const operatorStack = [];
    // recorrer la postfix
    for (const c of this.regexTokenized) {
      // si el caracter actual es un operador que no sea parentesis
      if (
          (c.value === "." && c.precedence === 1) || (c.value === "|" && c.precedence === 0)
          || (c.value === "*" && c.precedence === 2) || (c.value === "?" && c.precedence === 2) || (c.value === "+" && c.precedence === 2)) {
        // si el stack no esta vacio, se extraen todos los operadores cuya procedencia
        // sea mayor que la del simbolo actual, esto si no hemos llegado al parentesis izquierdo
        while (
          operatorStack.length &&
          operatorStack[operatorStack.length - 1].value !== "(" && operatorStack[operatorStack.length - 1].precedence !== -1 &&
          operatorStack[operatorStack.length - 1].precedence >= c.precedence
        ) {
          // se agrega al postfix
          postfix.push(operatorStack.pop());
        }

        // hasta ya no tener operadores con mayor procedencia, se agrega al stack
        operatorStack.push(c);

        // si llega un parentesis
      } else if ((c.value === "(" && c.precedence === -1) || (c.value === ")" && c.precedence === 3)) {
        // si es izquierdo entra al stack
        if ((c.value === "(" && c.precedence === -1)) {
          operatorStack.push(c);
          // si es derecho se lleva a cabo el proceso de colocar todos los operadores hasta llegar
          // al parentesis izquierdo
        } else {
          while (operatorStack[operatorStack.length - 1].value !== "(" && operatorStack[operatorStack.length - 1].precedence !== -1) {
            postfix.push(operatorStack.pop());
          }
          operatorStack.pop();
        }
        // si lo que llega es un operando, solo se agrega a la postfix
      } else {
        postfix.push(c);
      }
    }
    // si quedaron operadores en el stack, se pueden concatenar al final de la expresion
    while (operatorStack.length) {
      postfix.push(operatorStack.pop());
    }
    return postfix;
  }
  infixToPostfix(exp) {
    // declarar postfix vacia, stack vacio y la procedencia de operadores
    let postfix = "";
    const operatorStack = [];
    const operatorPrecedence = {
      "|": 0,
      ".": 1,
      "?": 2,
      "*": 2,
      "+": 2,
    };

    // recorrer la postfix
    for (const c of exp) {
      // si el caracter actual es un operador que no sea parentesis
      if (c === "." || c === "|" || c === "*" || c === "?" || c === "+") {
        // si el stack no esta vacio, se extraen todos los operadores cuya procedencia
        // sea mayor que la del simbolo actual, esto si no hemos llegado al parentesis izquierdo
        while (
          operatorStack.length &&
          operatorStack[operatorStack.length - 1] !== "(" &&
          operatorPrecedence[operatorStack[operatorStack.length - 1]] >=
            operatorPrecedence[c]
        ) {
          // se agrega al postfix
          postfix += operatorStack.pop();
        }

        // hasta ya no tener operadores con mayor procedencia, se agrega al stack
        operatorStack.push(c);

        // si llega un parentesis
      } else if (c === "(" || c === ")") {
        // si es izquierdo entra al stack
        if (c === "(") {
          operatorStack.push(c);
          // si es derecho se lleva a cabo el proceso de colocar todos los operadores hasta llegar
          // al parentesis izquierdo
        } else {
          while (operatorStack[operatorStack.length - 1] !== "(") {
            postfix += operatorStack.pop();
          }
          operatorStack.pop();
        }
        // si lo que llega es un operando, solo se agrega a la postfix
      } else {
        postfix += c;
      }
    }

    // si quedaron operadores en el stack, se pueden concatenar al final de la expresion
    while (operatorStack.length) {
      postfix += operatorStack.pop();
    }

    return postfix;
  }

  constructTree() {
    // representacion del arbol
    let nodeArray = [];
    // crear un stack para ir guardando operadores
    let nodeStack = [];
    // posicion del operador actual
    let pos = 1;
    // aumentar la postfix

    // recorrer la postfix para ver que nodo va a construirse
    for (const c of this.postfix) {
      // es un operador unario
      if (c === "*" || c === "+" || c === "?") {
        // nodo unario
        const node = new TreeNode(c, nodeStack.pop(), null, null);
        nodeStack.push(node);
        nodeArray.push(node);
      } else if (c === "." || c === "|") {
        // nodo con operador binario
        const rightnode = nodeStack.pop();
        const leftnode = nodeStack.pop();
        const node = new TreeNode(c, leftnode, rightnode, null);
        nodeStack.push(node);
        nodeArray.push(node);
      } else {
        // este nodo es un operando y por lo tanto se convierte en una hoja del arbol
        const node = new TreeNode(c, null, null, pos);
        nodeStack.push(node);
        nodeArray.push(node);
        pos += 1;
      }
    }
    return [nodeStack.pop(), nodeArray, pos];
  }
  constructTokenTree() {
    // representacion del arbol
    let nodeArray = [];
    // crear un stack para ir guardando operadores
    let nodeStack = [];
    // posicion del operador actual
    let pos = 1;
    // aumentar la postfix

    // recorrer la postfix para ver que nodo va a construirse
    for (const c of this.postfixTokenized) {
      // es un operador unario
      // "|": 0,
      // ".": 1,
      // "?": 2,
      // "*": 2,
      // "+": 2,

      if ((c.value === "*" && c.precedence === 2) || (c.value === "+" && c.precedence === 2) || (c.value === "?" && c.precedence === 2)) {
        // nodo unario
        const node = new TreeNode(c, nodeStack.pop(), null, null);
        nodeStack.push(node);
        nodeArray.push(node);
      } else if ((c.value === "."  && c.precedence === 1)|| (c.value === "|" &&  c.precedence === 0)) {
        // nodo con operador binario
        const rightnode = nodeStack.pop();
        const leftnode = nodeStack.pop();
        const node = new TreeNode(c, leftnode, rightnode, null);
        nodeStack.push(node);
        nodeArray.push(node);
      } else {
        // este nodo es un operando y por lo tanto se convierte en una hoja del arbol
        const node = new TreeNode(c, null, null, pos);
        nodeStack.push(node);
        nodeArray.push(node);
        pos += 1;
      }
    }
    return [nodeStack.pop(), nodeArray, pos];
  }

}
