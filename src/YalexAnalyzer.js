import { Regex } from "./Regex";
import { SyntaxTree } from "./SyntaxTree";
import { Token } from "./Token";
import { TreeNode } from "./TreeNode";
import { YalexTokens, asciiUniverses } from "./YalexTokens";
export class YalexAnalyzer{
    constructor(data){
        this.regex = null;
        this.tokenTree = null;
        this.ast = null;
        this.loadAfdCheckers();
        this.readFile(data);
        this.analyzeTokens();
        this.generateTrees();
        console.log(this.tokensSet);
        console.log(this.rulesSet);
        console.log(this.analyzedTokens);
        console.log(this.treeSet);
        console.log(this.afdsFinal);
        console.log(this.tokenChange);
        this.createBigTree();
        this.ascii = new asciiUniverses();
        console.log(this.ascii.UNIVERSE)
        console.log(this.ascii.LETTER)
    };
    loadAfdCheckers(){
      // AFD FOR THE COMMENTARIES
      let regex = new Regex("\\(\\* *("+YalexTokens.TILDES+"|"+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"| |\\.|\\+|\\||\\*|,|\\.|-)*( )*\\*\\)");      
      let tokenTree = regex.constructTokenTree();
      let ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.commentaryDFA = ast.generateDirectDFATokens();
      // AFD FOR THE DELIMETERS
      regex = new Regex("(( )|\n|\r|\t)+");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.delimDFA = ast.generateDirectDFATokens();
      // AFD'S FOR THE DEFINITION
      // Let +
      regex = new Regex("let +");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.letDFA = ast.generateDirectDFATokens();
      //  definition_name afd
      regex = new Regex(" *("+YalexTokens.CHARACTER+")("+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"|_)* *=");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionNameDFA = ast.generateDirectDFATokens();
      // definition definition afd
      regex = new Regex("( )*(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5|6|7|8|9|=|^|:|;|\\+|-|\\*|\\?|\\.|\\(|\\)|\\||]|[|_|\\n|\\t|\\r|\\s|\"|'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'|'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|' '|'\\n'|'\\t'|'\\r'|'\\s'|'\\+'|'/'|'-'|'\\*'|'\\?'|'\\.'|'\\('|'\\)'|'\\|'|'\"'|';'|':'|'='|'^')+"+YalexTokens.TERMINAL)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionDefinitionDFA = ast.generateDirectDFATokens();
      // AFD FOR THE RULES
      regex = new Regex("( )*rule tokens( )*=")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.startRuleDFA = ast.generateDirectDFATokens();
      // rule name
      regex = new Regex("( )*(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5|6|7|8|9|\\+|-|\\*|\\?|\\.|\\(|\\)|\\||]|[|_|\\n|\\t|\\r|\\s|\"|'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'|'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|' '|'\\n'|'\\t'|'\\r'|'\\s'|'\\+'|'/'|'-'|'\\*'|'\\?'|'\\.'|'\\('|'\\)'|'\\|'|'\"'|';'|':'|'='|'<'|'>'|'^'|\">=\"|\"<=\"|\":=\")+"+YalexTokens.TERMINAL)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleNameDFA = ast.generateDirectDFATokens();
      // rule body
      regex = new Regex("{( )*return( )+(_|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)+( )*}")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleBodyDFA = ast.generateDirectDFATokens();
      // console.log(this.ruleBodyDFA)
    };
    // Use an async function to wait for the data
    readFile(data) {
      let isCommentary = false;
      let isDelim = false;
      let isLet = false;
      let startRuleSection = false;
      let indexComentary = 0;
      let indexDelim = 0;
      let indexLet = 0;
      let indexStartRule = 0;
      this.tokensSet = new Map();
      this.tokensSet.set("COMMENTARY", []);
      this.tokensSet.set("DELIMITERS", []);
      this.rulesSet = new Map();
      let S = null;
      // Handle EOF
      data+="\n";
      let i = 0;
      for (i; i<data.length; i++){
        [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(data, i);
        [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(data, i);
        [isLet, indexLet, S] = this.letDFA.yalexSimulate(data, i);
        [startRuleSection, indexStartRule, S] = this.startRuleDFA.yalexSimulate(data, i);
        // It is a space or some kinda symbol
        if (isDelim){
          // console.log("isDelim");
          i = indexDelim;
          if (!(this.tokensSet.get("DELIMITERS").includes(data[i]))) {
            this.tokensSet.get("DELIMITERS").push(data[i]);
          };
        }
        // It is a commentary, it is ignored
        else if (isCommentary){
          // console.log("isComment");
          i = indexComentary;
          let definition = "";
          while (!(data[indexComentary]==="(" && data[indexComentary+1]==="*")){
            definition=data[indexComentary]+definition
            indexComentary--;
          }
          definition=data[indexComentary]+definition;
          this.tokensSet.get("COMMENTARY").push(definition);
        }
        else if (isLet){
          i = indexLet;
          // console.log(`indexLet:${indexLet}->${data[indexLet]}`);
          // console.log(data[indexLet+1])
          // If is definition, erase the spaces and the = symbols
          let tokenName = "";
          let isDefinitionName = false;
          let indexDefinitionName = indexLet;
          [isDefinitionName, indexDefinitionName, S] = this.definitionNameDFA.yalexSimulate(data, indexLet);
          // console.log(`indexLet:${indexDefinitionName}->${data[indexDefinitionName]}`);
          // console.log(data[indexDefinitionName])
          // console.log(isDefinitionName)
          // console.log(S)
          i = indexDefinitionName;
          if (isDefinitionName){
            while (data[indexDefinitionName]==="="||data[indexDefinitionName]===" "||data[indexDefinitionName]==="["){
              indexDefinitionName--;
            }
            while (data[indexDefinitionName]!==" "){
              tokenName = data[indexDefinitionName]+tokenName;
              indexDefinitionName--;
            }
            // A new set is created
            if (!this.tokensSet.has(tokenName)){
              this.tokensSet.set(tokenName, []);
            }
            let isDefinitionDefinition = false;
            let indexDefinitionDefinition = 0;
            // For passing =
            i++;
            // console.log("Start definition");
            // console.log(this.definitionDefinitionDFA)      
            [isDefinitionDefinition, indexDefinitionDefinition, S] = this.definitionDefinitionDFA.yalexSimulate(data, i);
            // console.log(this.definitionDefinitionDFA)
            // The minus one its bc we dont care about the ]
            i = indexDefinitionDefinition;
            if (isDefinitionDefinition){
              let definition = ""
              // console.log(data[indexDefinitionDefinition])
              while (data[indexDefinitionDefinition-1]!=="="){
                definition=data[indexDefinitionDefinition]+definition
                indexDefinitionDefinition--;
                // console.log(data[indexDefinitionDefinition])
              }
              definition=data[indexDefinitionDefinition]+definition;
              definition = definition.trim();
              if (!(this.tokensSet.get(tokenName).includes(definition))) {
                this.tokensSet.get(tokenName).push(definition);
              };
            }
            else {
              throw Error(`Sintax error in position ${i}, character ${data[i]}, expected a definition for the let definition_name`);
            }
            // console.log(data[i]);
          }
          else {
            throw Error(`Sintax error in position ${i}, character ${data[i]} something is not right in the let definition`);
          }              
        }
        // From this point to what is left it will proceed processing
        // the rest of the file because we can't return to let section over here
        else if (startRuleSection){
          // console.log("START RULE SECTION 1ST")
          let isRuleName = false;
          let indexRuleName = 0;
          let isRuleBody = false;
          let indexRuleBody = 0;
          let insideRuleDefinition = false;
          let ruleName = null;
          let canStartNewRuleSection = false;
          // The +1 its bc is in = position
          for (i=indexStartRule+1; i < data.length; i++){
            [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(data, i);
            [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(data, i);
            [isRuleName, indexRuleName, S] = this.ruleNameDFA.yalexSimulate(data, i);
            // console.log("tryRuleBody");
            [isRuleBody, indexRuleBody, S] = this.ruleBodyDFA.yalexSimulate(data, i);
            // It is a space or some kinda symbol
            if (isDelim){
              // console.log("isDelim");
              i = indexDelim;
              if (!(this.tokensSet.get("DELIMITERS").includes(data[i]))) {
                this.tokensSet.get("DELIMITERS").push(data[i]);
              };
            }
            // It is a commentary, it is ignored
            else if (isCommentary){
              // console.log("isComment");
              i = indexComentary;
              let definition = "";
              while (!(data[indexComentary]==="(" && data[indexComentary+1]==="*")){
                definition=data[indexComentary]+definition
                indexComentary--;
              }
              definition=data[indexComentary]+definition;
              this.tokensSet.get("COMMENTARY").push(definition);
            }
            // Another rule section starts so this is the only way to change the rule name back to null and set false
            else if (data[i]==="|" && canStartNewRuleSection) {
              // console.log("START ANOTHER RULE SECTION!!!!")
              // console.log(data.slice(i, data.length - 1));
              insideRuleDefinition = false;
              ruleName = null;
              canStartNewRuleSection = false;
            }
            // It is a rule name and should not be inside a rule definition
            else if (isRuleName && !insideRuleDefinition) {
              // console.log("RULENAME");
              // console.log(insideRuleDefinition);
              i = indexRuleName;
              insideRuleDefinition = true;
              ruleName = null;
              ruleName = "";
              indexRuleName--;
              while (data[indexRuleName]!==" ") {
                ruleName = data[indexRuleName] + ruleName;
                indexRuleName--;
              }
              // A new set is created
              if (!this.rulesSet.has(ruleName)){
                this.rulesSet.set(ruleName.trim(), "");
              }
              // Here i must create a error if already has a ruleName
              else{
                throw Error(`Invalid yalex in position ${i}, character ${data[i]}, the rule ${ruleName} already has a return value`);
              }
              canStartNewRuleSection = true;
            }
            // Is a rule body, must be inside a rule definition and rule name must not be null
            else if (isRuleBody && insideRuleDefinition && ruleName !== null) {
              // console.log("RULEBODY");
              i = indexRuleBody;
              let return_ = "";
              // Ignore the }
              indexRuleBody--;
              // Ignore the spaces between } and everything else
              while (data[indexRuleBody]===" "){
                indexRuleBody--;
              }
              while (data[indexRuleBody]!==" ") {
                return_= data[indexRuleBody] + return_;
                indexRuleBody--;
              }
              // Must have just one return so it must be empty
              if (this.rulesSet.get(ruleName)===""){
                this.rulesSet.set(ruleName,return_.trim());
              }
              // Any other type doesn't belong and it is treated as an error
              else{
                throw Error(`Invalid yalex in position ${i}, character ${data[i]}`);
              }
              // Here I gotta create an error handling
            }
            else{
              throw Error(`Invalid yalex in position ${i}, character ${data[i]}`);
            }
          }
        }
        // Any other type doesn't belong and it is treated as an error
        else{
          throw Error(`Invalid yalex in position ${i}, character ${data[i]}`);
        }
      }
  };
  isOperator(element) {
    return ["|", ".", "?", "*", "+", "(", ")"].includes(element);
  }
  insertDotsInRegexTokenizedWithWords(dfaArray, regex) {
    // se necesita la regex a recorrer, y un postfix vacio a construir
    let tokens = [];
    let token = null;
    let isWordChar = false;
    let index = 0;
    let S = null;
    let isWord = false;
    let indexTemp = 0
    // recorrer cada caracter para construir la regex con puntos
    for (let c = 0; c < regex.length; c++) {
      const element = regex[c];
      for (let n = 0; n<dfaArray.length; n++){
        let currentDfa = dfaArray[n];
        [isWord, indexTemp, S] = currentDfa.yalexSimulate(regex, c);
        if (isWord && indexTemp>index){
          isWordChar = isWord;
          index = indexTemp; 
        };
      };
      if (isWordChar){
        let newWord = regex.slice(c, index+1);
        let newToken = new Token(newWord, -2);
        tokens.push(newToken);
        c = index;
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
  analyzeTokens(){
    // FIRST, GET AFDS TO CHECK IF THEY ARE SOME DEFINITION
    let keys = Array.from(this.tokensSet.keys());
    let afds = []
    this.regex = new Regex(keys[2]);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    // let superdfa = ast.generateDirectDFATokens()
    // The first 2 will be ommited bc they are Commentaries and Delimiters
    for (let i = 2; i<keys.length; i++){
      this.regex = new Regex(keys[i]);
      this.tokenTree = this.regex.constructTokenTree();
      this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
      afds.push(this.ast.generateDirectDFATokens());
      // superdfa.addAnotherDfa(ast.generateDirectDFATokens());
    }
    // console.log(superdfa);
    // console.log(afds);
    // deep copy
    this.analyzedTokens = new Map();
    this.tokenChange = new Map();
    for (let l = 2; l < keys.length; l++){
      this.analyzedTokens.set(keys[l],[...this.tokensSet.get(keys[l])])
    }    
    for (let j = 2; j < keys.length; j++){
      let key = keys[j];
      let tokensToEvaluate = this.tokensSet.get(key);
      for (let k = 0; k < tokensToEvaluate.length; k++){
        let token = tokensToEvaluate[k];
        token = token.replace(".", "("+YalexTokens.CHARACTER+")")
        token = token.replace("_", "("+YalexTokens.SYMBOLS.join("|")+")")
        let isValid = this.regex.isValid(token);
        // console.log(`${token} is valid?`);
        // console.log(isValid);
        // console.log("Token is:"+token);
        if (isValid) {
          let originalLength = token.length;
          // console.log(originalLength)
          for (let i = 0; i < originalLength; i++){
            let c = token[i];
            if (c==="["){
              let oldIndex = i;
              let newToken = null;
              let newIndex = 0;
              [newToken, newIndex] = this.handleBrackets(token, i);
              i = newIndex;
              token = token.replace(token.slice(oldIndex, i+1), "("+newToken+")");
            } else if (c === "'") {
              if ( token[i+1]==="+" || token[i+1] === "*"){
                token = token.replace(token.slice(i, i+3), "(\\"+token[i+1]+")");
              }
              else{
                token = token.replace(token.slice(i, i+3), "("+token[i+1]+")");
              }
            }
            this.tokenChange.set(key, token);
          };
        }
        // Reemplazo del old token
        this.analyzedTokens.get(key)[k]=this.insertDotsInRegexTokenizedWithWords(afds,token)
      };
    };
  };
  handleBrackets(token, i){
    // pass the [
    i++;
    let c = token[i];
    let tokens = []
    let antiTokens = []
    if (c === "^"){
      i++;
      c = token[i];
      while (c!=="]"){
        // console.log(`char to be analyzed:${c}`);
        if (c === "'"){
          if (token[i+1]==="\\"){
            antiTokens.push(token[i+1]+token[i+2]);
            i+=3;
          }
          else{
            if (token[i+1]==="+" || token[i+1]==="*") {
              antiTokens.push("\\"+token[i+1]);
            } else{
              antiTokens.push(token[i+1]);
            }          
            i+=2;
          }
        } else if (c==="-"){
          let initTokenAscii = token[i-2];
          let finTokenAscii = token[i+2];
          initTokenAscii = initTokenAscii.charCodeAt(0);
          finTokenAscii = finTokenAscii.charCodeAt(0);
          // console.log(`initToken:${token[i-2]} finToken:${token[i+2]}`);
          // console.log(`initToken:${initTokenAscii} finToken:${finTokenAscii}`);
          if (initTokenAscii<finTokenAscii){
            // It is +1 because we already appended the first token ascii
            for (let m = initTokenAscii+1; m <= finTokenAscii; m++){
              antiTokens.push(String.fromCharCode(m));
            };
          }
          // The else must handle errors because cant exist some 9-2 range or 2-2
          else{
            throw new Error(`Error: invalid range [${token[i-2]}-${token[i+2]}]`);
          }
          i+=3;
        } else if (c === "\""){
          i++;
          c = token[i];
          // Handling to throw error because can't be just alone
          if (c === "\""){
            throw new Error(`Error in position '+${i}+': empty declaration ${token}`);
          }
          while (c!=="\""){
            antiTokens.push(c);
            i++;
            c=token[i];
          }
        }
        if (token[i]==="]"){
          break;
        }
        i++;
        c = token[i];
      }
      for (let n = 0; n < YalexTokens.SYMBOLS.length; n++) {
        let val = YalexTokens.SYMBOLS[n];
        if (antiTokens.indexOf(val) === -1){
          tokens.push(val);
        };
      };
    }
    else {
      while (c!=="]"){
        // console.log(`char to be analyzed:${c}`);
        if (c === "'"){
          if (token[i+1]==="\\"){
            tokens.push(token[i+1]+token[i+2]);
            i+=3;
          }
          else{
            if (token[i+1]==="+" || token[i+1]==="*" || token[i+1]==="(" || token[i+1]===")") {
              tokens.push("\\"+token[i+1]);
            } else{
              tokens.push(token[i+1]);
            }          
            i+=2;
          }
        } else if (c==="-"){
          let initTokenAscii = token[i-2];
          let finTokenAscii = token[i+2];
          initTokenAscii = initTokenAscii.charCodeAt(0);
          finTokenAscii = finTokenAscii.charCodeAt(0);
          // console.log(`initToken:${token[i-2]} finToken:${token[i+2]}`);
          // console.log(`initToken:${initTokenAscii} finToken:${finTokenAscii}`);
          if (initTokenAscii<finTokenAscii){
            // It is +1 because we already appended the first token ascii
            for (let m = initTokenAscii+1; m <= finTokenAscii; m++){
              tokens.push(String.fromCharCode(m));
            };
          }
          // The else must handle errors because cant exist some 9-2 range or 2-2
          else {
            throw new Error(`Error in position '+${i}+': invalid range [${token[i-2]}-${token[i+2]}]`);
          };
          i+=3;
        } else if (c === "\""){
          i++;
          c = token[i];
          // Handling to throw error because can't be just alone
          if (c === "\""){
            throw new Error(`Error in position '+${i}+': empty declaration ${token}`);
          }
          while (c!=="\""){
            if (c==="\\"){
              let newToken = c + token[i+1];
              tokens.push(newToken);
              i+=2;
              c=token[i];
            } else {
              tokens.push(c);
              i++;
              c=token[i];
            }
          };
        }
        if (token[i]==="]"){
          break;
        }
        i++;
        c = token[i];
      }
    }
    return [tokens.join("|"), i];
  }
  generateTrees(){
    this.treeSet = [];
    this.afdsFinal = []
    // console.log(this.tokensSet);
    let keys = Array.from(this.analyzedTokens.keys());
    for (let i = 0; i<keys.length; i++){
      this.regex.regexWithDots = this.analyzedTokens.get(keys[i])[0];
      this.regex.postfixTokenized = this.regex.infixToPostfixTokenized(this.regex.regexWithDots);
      // console.log(this.regex.postfixTokenized);
      this.tokenTree = this.regex.constructTokenTree();
      this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
      this.treeSet.push(this.ast); 
      // Se aniade el root de la cabeza con el nombre
      this.afdsFinal.push(this.ast.generateDirectDFATokens());
      let newDotNode = new TreeNode(new Token(keys[i], 1),this.treeRoot,null,null);
      this.ast.nodes.push(newDotNode);
      this.ast.treeRoot = newDotNode;
    }
  };
  handleName(token, i){
    let c = token[i];
    let tokens = []
    let antiTokens = []
    if (c === "^"){
      i++;
      c = token[i];
      while (i<token.length){
        // console.log(`char to be analyzed:${c}`);
        if (c === "'"){
          if (token[i+1]==="\\"){
            antiTokens.push(token[i+1]+token[i+2]);
            i+=3;
          }
          else{
            if (token[i+1]==="+" || token[i+1]==="*") {
              antiTokens.push("\\"+token[i+1]);
            } else{
              antiTokens.push(token[i+1]);
            }          
            i+=2;
          }
        } else if (c === "\""){
          i++;
          c = token[i];
          // Handling to throw error because can't be just alone
          if (c === "\""){
            throw new Error(`Error in position '+${i}+': empty declaration ${token}`);
          }
          while (c!=="\""){
            antiTokens.push(c);
            i++;
            c=token[i];
          }
        } else if (c==="["){
          let oldIndex = i;
          let newToken = null;
          let newIndex = 0;
          [newToken, newIndex] = this.handleBrackets(token, i);
          i = newIndex;
          token = token.replace(token.slice(oldIndex, i+1), "("+newToken+")");
        } 
        i++;
        c = token[i];
      }
      for (let n = 0; n < YalexTokens.SYMBOLS.length; n++) {
        let val = YalexTokens.SYMBOLS[n];
        if (antiTokens.indexOf(val) === -1){
          tokens.push(val);
        };
      };
    }
    else {
      while (i<token.length){
        console.log(`char to be analyzed:${c}`);
        if (c === "'"){
          if (token[i+1]==="\\"){
            tokens.push(token[i+1]+token[i+2]);
            i+=3;
          }
          else{
            if (token[i+1]==="+" || token[i+1]==="*" || token[i+1]==="(" || token[i+1]===")" || token[i+1]===".") {
              tokens.push("\\"+token[i+1]);
            } else{
              tokens.push(token[i+1]);
            }          
            i+=2;
          }
        } else if (c === "\""){
          i++;
          c = token[i];
          // Handling to throw error because can't be just alone
          if (c === "\""){
            throw new Error(`Error in position '+${i}+': empty declaration ${token}`);
          }
          while (c!=="\""){
            if (c==="\\"){
              let newToken = c + token[i+1];
              tokens.push(newToken);
              i+=2;
              c=token[i];
            } else {
              tokens.push(c);
              i++;
              c=token[i];
            }
          };
        } else if (c==="["){
          let oldIndex = i;
          let newToken = null;
          let newIndex = 0;
          [newToken, newIndex] = this.handleBrackets(token, i);
          i = newIndex;
          token = token.replace(token.slice(oldIndex, i+1), "("+newToken+")");
        }
        i++;
        c = token[i];
      }
    }
    return [tokens.join("|"), i];
  }
  createBigTree(){
    // Get the general regex
    let keys = Array.from(this.rulesSet.keys());
    this.generalRegex = "("
    for (let i = 0; i < keys.length; i++){
      let regex = this.tokensSet.get(keys[i]);
      if (regex !== undefined){
        this.generalRegex += "("+this.tokensSet.get(keys[i])+")"
      }
      else{
        this.generalRegex += "("+keys[i]+")"
      }
      if (i !== keys.length-1){
        this.generalRegex += "|";
      }
    };
    this.generalRegex.slice(0, this.generalRegex.length-2);
    this.generalRegex += ")";
    console.log(this.generalRegex)
    // Get the afds of the symbols that cause recursion
    keys = Array.from(this.tokensSet.keys());
    let afds = []
    this.regex = new Regex(keys[2]);
    this.tokenTree = this.regex.constructTokenTree();
    this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
    // The first 2 will be ommited bc they are Commentaries and Delimiters
    for (let i = 2; i<keys.length; i++){
      this.regex = new Regex(keys[i]);
      this.tokenTree = this.regex.constructTokenTree();
      this.ast = new SyntaxTree(this.tokenTree[0], this.tokenTree[1], this.regex, this.tokenTree[2]);
      afds.push(this.ast.generateDirectDFATokens());
    }
    // eliminate recursion
    for (let i = 0; i < this.generalRegex.length; i++){
      let tokens = [];
      let token = null;
      let isWordChar = false;
      let index = 0;
      let S = null;
      let isWord = false;
      let indexTemp = 0;
      let afdIndex = 0;
      // console.log(this.generalRegex[i])
      // Detect if there is a recursion
      // console.log(`original i: ${i}, ${this.generalRegex}`)
      for (let n = 0; n<afds.length; n++){
        let currentDfa = afds[n];
        [isWord, indexTemp, S] = currentDfa.yalexSimulate(this.generalRegex, i);
        if (isWord && indexTemp>index){
          isWordChar = isWord;
          index = indexTemp; 
          afdIndex = n;
        };
      };
      if (isWordChar){
        let array = this.generalRegex.split('');
        // console.log(keys[afdIndex+2])
        // console.log(this.tokensSet.get(keys[afdIndex+2]))
        array[i] = this.tokensSet.get(keys[afdIndex+2]);
        array.splice(i+1, index-i);
        this.generalRegex = array.join('');
        // Esto sirve para analizar el nuevo string para detectar si hay otra recursion a solucionar
        i-=2;
        isWordChar = false;
      };
      // console.log(`final i: ${i}, ${this.generalRegex}`)
    };
    console.log(this.generalRegex)
    this.analyzeTokens2();
  };
  analyzeTokens2(){
  for (let k = 0; k < this.generalRegex.length; k++){
    let token = this.generalRegex[k];
    token = token.replace(".", "("+YalexTokens.CHARACTER+")")
    token = token.replace("_", "("+YalexTokens.SYMBOLS.join("|")+")")
    token = token.replace("'('", "\\(")
    token = token.replace("')'", "\\)")
    token = token.replace("'+'", "\\+")
    token = token.replace("'*'", "\\*")
    // let isValid = this.regex.isValid(token);
    // // console.log(`${token} is valid?`);
    // // console.log(isValid);
    // // console.log("Token is:"+token);
    // if (isValid) {
    //   let originalLength = token.length;
    //   // console.log(originalLength)
    //   for (let i = 0; i < originalLength; i++){
    //     let c = token[i];
    //     if (c==="["){
    //       let oldIndex = i;
    //       let newToken = null;
    //       let newIndex = 0;
    //       [newToken, newIndex] = this.handleBrackets(token, i);
    //       i = newIndex;
    //       token = token.replace(token.slice(oldIndex, i+1), "("+newToken+")");
    //     } else if (c === "'") {
    //     if ( token[i+1]==="+" || token[i+1] === "*"){
    //         token = token.replace(token.slice(i, i+3), "(\\"+token[i+1]+")");
    //       }
    //     else{
    //         token = token.replace(token.slice(i, i+3), "("+token[i+1]+")");
    //       }
    //     }
    //     this.generalRegex = token;
    //   };
    //   }
    };
    console.log(this.generalRegex);
  };
};