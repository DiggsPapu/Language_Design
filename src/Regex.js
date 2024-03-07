import { Token } from "./Token";
import { TreeNode } from "./TreeNode";
export class Regex {
  constructor(regex) {
    this.regex = regex;
    this.valid = this.isValid(regex);
    if (this.valid) {
      this.regexWithDots = this.insertDotsInRegexTokenized();
      this.postfixTokenized = this.infixToPostfixTokenized(this.regexWithDots);
    } else {
      this.postfix = [];
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
      if (c === "(" && regex[i - 1] !== "\\") {
        lefts++;
      }
      if (c === ")" && regex[i - 1] !== "\\") {
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
          (last === "|" && regex[i -2] !== "\\")
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
      console.log("binario")
      return false;
    }
    // ver si existe la misma cantidad de parentesis derechos e izquierdos
    if (lefts !== rights) {
      console.log("Parentesis")
      return false;
    }
    // si nada de lo anterior se cumple, se acepta la regex
    return true;
  }
  insertDotsInRegexTokenized() {
    // se necesita la regex a recorrer, y un postfix vacio a construir
    const regex = this.regex;
    let tokens = [];
    let token = null;
    // recorrer cada caracter para construir la regex con puntos
    for (let c = 0; c < regex.length; c++) {
      const element = regex[c];
      
      switch(regex[c]){
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
          // El backslash convierte a un operador en un simbolo.
          if (this.isOperator(regex[c+1])){
            tokens.push(new Token(regex[c+1], -2))
            c++;
          }
          // El backslash es un simbolo
          else{
            tokens.push(new Token("\\", -2));
          }
          break;
        default:
          token = new Token(element, -2);
          tokens.push(token);
          break;  
      };
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
        else if (this.isOperator(next)&&regex[c]==="\\"){
          continue;
        }
        // si no, concatenamos
        tokens.push(new Token(".", 1));
      }
    }
    return tokens;
  }
  insertDotsInRegexTokenizedWithWords(dfaArray, regex) {
    // se necesita la regex a recorrer, y un postfix vacio a construir
    let tokens = [];
    let token = null;
    let isWordChar = false;
    let index = 0;
    let S = null;
    // recorrer cada caracter para construir la regex con puntos
    for (let c = 0; c < regex.length; c++) {
      const element = regex[c];
      for (let n = 0; n<dfaArray.length; n++){
        let currentDfa = dfaArray[n];
        [isWordChar, index, S] = currentDfa.yalexSimulate(regex, c);
        if (isWordChar){
          break;
        }
      };
      if (isWordChar){
        let newWord = regex.slice(c, index);
        let newToken = new Token(newWord, -2);
        tokens.push(newToken);
        c = index+1;
        isWordChar = false;
      }
      else{
        switch(regex[c]){
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
            // El backslash convierte a un operador en un simbolo.
            if (this.isOperator(regex[c+1])){
              tokens.push(new Token(regex[c+1], -2))
              c++;
            }
            // El backslash es un simbolo
            else{
              tokens.push(new Token("\\", -2));
            }
            break;
          default:
            token = new Token(element, -2);
            tokens.push(token);
            break;  
        };
      }
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
        else if (this.isOperator(next)&&regex[c]==="\\"){
          continue;
        }
        // si no, concatenamos
        tokens.push(new Token(".", 1));
      }
    }
    return tokens;
  }
  infixToPostfixTokenized(regexWithDots) {
    // declarar postfix vacia, stack vacio y la procedencia de operadores
    let postfix = [];
    const operatorStack = [];
    // recorrer la postfix
    for (let i = 0; i<regexWithDots.length; i++) {
      let c = regexWithDots[i];
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
  constructTokenTree() {
    // representacion del arbol
    let nodeArray = [];
    // crear un stack para ir guardando operadores
    let nodeStack = [];
    // posicion del operador actual
    let pos = 1;
    // recorrer la postfix para ver que nodo va a construirse
    for (const c of this.postfixTokenized) {
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
