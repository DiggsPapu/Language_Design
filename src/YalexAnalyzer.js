import { NFA } from "./NFA";
import { Regex } from "./Regex";
import { SyntaxTree } from "./SyntaxTree";
import { ThompsonToken } from "./ThompsonToken";
import { Token, TokenTypes } from "./Token";

const YalexTokens = {
  NUMBER: "0|1|2|3|4|5|6|7|8|9",
  CHARACTER: "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z",
  IDENTIFIER: " /^[a-zA-Z]+[0-9]*[a-zA-Z]/",
  TILDES: "á|é|í|ó|ú",
  ADDITION: /\+/,
  SUBTRACTION: /-/,
  MULTIPLICATION: /\*/,
  DIVISION: /\//,
  EXPONENTIATION: /\^/,
  PARENTHESIS_LEFT: /\(/,
  PARENTHESIS_RIGHT: /\)/,
  SPACE: / +/,
  ENTER: /\n|\r/,  
  START_DEFINITION: /^/,
  DEFINITION: /^[a-zA-Z]+[0-9]*[a-zA-Z]/,
  COMENTARY: /(\*[a-zA-Z0-9_.-]*\*)/,
  LET: /let += +/,
};
export class YalexAnalyzer{
    constructor(data){
        this.loadAfdCheckers();
        this.regex = this.readFile(data);
        this.definitions = {}
    };
    loadAfdCheckers(){
      // Create the afd for commentaries
      let regex = new Regex("\\(\\* *("+YalexTokens.TILDES+"|"+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"| |\\.|\\+|\\||\\*)* *\\*\\)");
      let tokenTree = regex.constructTokenTree();
      let ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.commentaryDFA = ast.generateDirectDFATokens();
      // Create the afd for delimiters
      regex = new Regex("( |\n|\r|\t)*");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.delimDFA = ast.generateDirectDFATokens();
      // Create afd's for the definition
      // Let + definition_name afd
      regex = new Regex("let +(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)+ *=");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionNameDFA = ast.generateDirectDFATokens();
      console.log(this.definitionNameDFA)
      // definition definition afd
      // regex = new Regex("("+YalexTokens.CHARACTER+")("+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"|_|\\+)+");
      // tokenTree = regex.constructTokenTree();
      // ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      // this.definitionNameDFA = ast.generateDirectDFATokens();
      
    };
    // Use an async function to wait for the data
    readFile(data) {
            let commentaryToken = "";
            let isCommentary = false;
            let isDelim = false;
            let isDefName = false;
            let isDefinition = false;
            let tokensSet = new Map();
            let newTokensSet = []
            for (let line of data.split('\n')){
                for (let i = 0; i < line.length; ++i){
                  let indexComentary = 0;
                  [isCommentary, indexComentary] = this.commentaryDFA.yalexSimulate(line, i);
                  let indexDelim = 0;
                  [isDelim, indexDelim] = this.delimDFA.yalexSimulate(line, i);
                  let indexDefName = 0;
                  [isDefName, indexDefName] = this.definitionNameDFA.yalexSimulate(line, i);
                  // console.log(isCommentary+":"+indexComentary+"|"+isDelim+":"+indexDelim+"|"+isDefinition+":"+indexDefinition);                    
                  // It is a space or some kinda symbol, it is ignored
                  if (isDelim){
                    console.log("isDelim");
                    i = indexDelim;
                  }
                  // It is a commentary, it is ignored
                  else if (isCommentary){
                    console.log("isComment");
                    i = indexComentary;
                  }
                  else if (isDefName){
                    i = indexDefName;
                    console.log(`indexLet:${indexDefName}->${line[indexDefName]}`);
                    // If is definition, erase the spaces and the = symbols
                    let tokenName = ""
                    while (line[indexDefName]==="="||line[indexDefName]===" "){
                      console.log(line[indexDefName])
                      indexDefName--;
                    }
                    while (line[indexDefName]!==" "){
                      console.log(line[indexDefName])
                      tokenName = line[indexDefName]+tokenName;
                      indexDefName--;
                    }
                    // A new set is created
                    if (!tokensSet.has(tokenName)){
                      tokensSet.set(tokenName, []);
                    }
                  }
                }
            }
            console.log(tokensSet);
        };
        definition(line, i){
          let startDef = false;
          let newDefinition = "";
          while (i<line.length) {
            if (line[i] === ' ' && startDef){
              break;
            }
            else{
              newDefinition+=line[i];
            };
            i++;
          }
          console.log(newDefinition.match(TokenTypes.DEFINITION))
        }
    processLines(line, isCommentary, commentaryToken){
        let i = 0
        if (isCommentary){
            while (i<line.length && line[i]!==')' && line[i-1]!=='*'){
                commentaryToken+=line[i]
                console.log(commentaryToken)
                i++;
            }
            // It gets out of the commentary type
            if (line[i]!==')' && line[i-1]!=='*'){
                isCommentary = false;
            }
        }
        let tokensSet = []
        for (i; i<line.length;i++){
            let c = line[i]
            if (c === '(' && line[i+1] === '*'){
                isCommentary = true;
                return [tokensSet, isCommentary, commentaryToken];
            }
        };
        return [tokensSet, isCommentary, commentaryToken];
    };
};