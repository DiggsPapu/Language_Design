import { NFA } from "./NFA";
import { Regex } from "./Regex";
import { SyntaxTree } from "./SyntaxTree";
import { ThompsonToken } from "./ThompsonToken";
import { Token, TokenTypes } from "./Token";

const YalexTokens = {
  NUMBER: "0|1|2|3|4|5|6|7|8|9",
  CHARACTER: "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z",
  BACKSLASH: "\\",
  TERMINAL: "((\n)|(\t)|(\r)|( ))",
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
      let regex = new Regex("\\(\\* *("+YalexTokens.TILDES+"|"+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"| |\\.|\\+|\\||\\*|,|\\.)* *\\*\\)");      
      let tokenTree = regex.constructTokenTree();
      let ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.commentaryDFA = ast.generateDirectDFATokens();
      // Create the afd for delimiters
      regex = new Regex("( |\n|\r|\t)*");
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.delimDFA = ast.generateDirectDFATokens();
      // Create afd's for the definition
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
      // regex = new Regex(" *[(('("+YalexTokens.CHARACTER+")')*)|((\"("+YalexTokens.NUMBER+")+\")*)|(('("+YalexTokens.CHARACTER+")'-'("+YalexTokens.CHARACTER+")')*)|(('("+YalexTokens.NUMBER+")'-'("+YalexTokens.NUMBER+")')*)]");
      // "([((\""+YalexTokens.CHARACTER+"("+YalexTokens.CHARACTER+")+\")|(\""+YalexTokens.NUMBER+"("+YalexTokens.NUMBER+")+\"))])"
      // regex = new Regex(" *([('(( )|(\\t)|(\\n))')+])")
      // regex = new Regex(" *[(('("+YalexTokens.CHARACTER+")'-'("+YalexTokens.CHARACTER+")')|('("+YalexTokens.NUMBER+")'-'("+YalexTokens.NUMBER+")'))+]")
      // regex= new Regex(" *([(\"((\\s)|(\\t)|(\\n))+\")])")
      // regex = new Regex(" *("+YalexTokens.CHARACTER+")+((\\+)|(\\*)|(\\?))+((\n)|(\t)|(\r)|( ))");

      // Parentesis
      // regex = new Regex(" *(((("+YalexTokens.CHARACTER+")+((\\+)|(\\*)|(\\?))*)*\\(("+YalexTokens.CHARACTER+")+(\\|("+YalexTokens.CHARACTER+")+)+\\)((\\+)|(\\*)|(\\?))*)|((("+YalexTokens.CHARACTER+")+((\\+)|(\\*)|(\\?))*)+))"+YalexTokens.TERMINAL)
      // regex = new Regex(" *((\\(\\.("+YalexTokens.CHARACTER+")+\\)((\\+)|(\\*)|(\\?))*)|((("+YalexTokens.CHARACTER+")+((\\+)|(\\*)|(\\?))*)*\\(("+YalexTokens.CHARACTER+")+(\\|("+YalexTokens.CHARACTER+")+)+\\)((\\+)|(\\*)|(\\?))*)|((("+YalexTokens.CHARACTER+")+((\\+)|(\\*)|(\\?))*)+))"+YalexTokens.TERMINAL)
      regex = new Regex("( )*(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5|6|7|8|9|\\+|-|\\*|\\?|\\.|\\(|\\)|\\||]|[|_|\\n|\\t|\\r|\\s|\"|'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'X'|'Y'|'Z'|'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|' '|'\\n'|'\\t'|'\\r'|'\\s'|'\\+'|'-'|'\\*'|'\\?'|'\\.'|'\\('|'\\)'|'\\|'|'\"')+"+YalexTokens.TERMINAL)
      // regex = new Regex(" *(\\(\\.("+YalexTokens.CHARACTER+")+\\)((\\+)|(\\*)|(\\?))*)"+YalexTokens.TERMINAL)
      // regex= new Regex(" *(("+YalexTokens.CHARACTER+")+((\\+)|(\\*)|(\\?))*(\\(("+YalexTokens.CHARACTER+")+(\\|("+YalexTokens.CHARACTER+")+\\)+))(\\*)?(\\*)?(\\+)?(\\?)?)");
      // regex = new Regex(" *(([('(( )|(\\t)|(\\n))')+])|([(('("+YalexTokens.CHARACTER+")'-'("+YalexTokens.CHARACTER+")')|('("+YalexTokens.NUMBER+")'-'("+YalexTokens.NUMBER+")'))+])|([((\"(("+YalexTokens.CHARACTER+")("+YalexTokens.CHARACTER+")+)\")|(\"("+YalexTokens.NUMBER+")("+YalexTokens.NUMBER+")+\"))])|([(\"((\\s)|(\\t)|(\\n))+\")]))")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionDefinitionDFA = ast.generateDirectDFATokens();
    };
    // Use an async function to wait for the data
    readFile(data) {
            let commentaryToken = "";
            let isCommentary = false;
            let isDelim = false;
            let isDefName = false;
            let isLet = false;
            let tokensSet = new Map();
            tokensSet.set("COMMENTARY", []);
            tokensSet.set("DELIMITERS", []);
            let newTokensSet = []
            let S = null;
            let lines = data.split('\n');
            // Handle EOF
            lines[lines.length - 2] += '\n';
            console.log(lines[lines.length - 2])
            for (let line of lines){
                for (let i = 0; i < line.length; ++i){
                  let indexComentary = 0;
                  [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(line, i);
                  let indexDelim = 0;
                  [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(line, i);
                  let indexLet = 0;
                  [isLet, indexLet, S] = this.letDFA.yalexSimulate(line, i);
                  // console.log(isCommentary+":"+indexComentary+"|"+isDelim+":"+indexDelim+"|"+isDefinition+":"+indexDefinition);                    
                  // It is a space or some kinda symbol, it is ignored
                  if (isDelim){
                    console.log("isDelim");
                    i = indexDelim;
                    if (!(tokensSet.get("DELIMITERS").includes(line[i]))) {
                      tokensSet.get("DELIMITERS").push(line[i]);
                    };
                  }
                  // It is a commentary, it is ignored
                  else if (isCommentary){
                    console.log("isComment");
                    i = indexComentary;
                    let definition = "";
                    while (!(line[indexComentary]==="(" && line[indexComentary+1]==="*")){
                      definition=line[indexComentary]+definition
                      indexComentary--;
                    }
                    definition=line[indexComentary]+definition;
                    tokensSet.get("COMMENTARY").push(definition);
                  }
                  else if (isLet){
                    i = indexLet;
                    console.log(`indexLet:${indexLet}->${line[indexLet]}`);
                    console.log(line[indexLet+1])
                    // If is definition, erase the spaces and the = symbols
                    let tokenName = "";
                    let isDefinitionName = false;
                    let indexDefinitionName = indexLet;
                    [isDefinitionName, indexDefinitionName, S] = this.definitionNameDFA.yalexSimulate(line, indexLet);
                    console.log(`indexLet:${indexDefinitionName}->${line[indexDefinitionName]}`);
                    console.log(line[indexDefinitionName])
                    console.log(isDefinitionName)
                    console.log(S)
                    i = indexDefinitionName;
                    if (isDefinitionName){
                      while (line[indexDefinitionName]==="="||line[indexDefinitionName]===" "||line[indexDefinitionName]==="["){
                        indexDefinitionName--;
                      }
                      while (line[indexDefinitionName]!==" "){
                        tokenName = line[indexDefinitionName]+tokenName;
                        indexDefinitionName--;
                      }
                      // A new set is created
                      if (!tokensSet.has(tokenName)){
                        tokensSet.set(tokenName, []);
                      }
                      let isDefinitionDefinition = false;
                      let indexDefinitionDefinition = 0;
                      // For passing =
                      i++;
                      console.log("Start definition");
                      // console.log(this.definitionDefinitionDFA)      
                      [isDefinitionDefinition, indexDefinitionDefinition, S] = this.definitionDefinitionDFA.yalexSimulate(line, i);
                      console.log(this.definitionDefinitionDFA)
                      // The minus one its bc we dont care about the ]
                      i = indexDefinitionDefinition;
                      if (isDefinitionDefinition){
                        let definition = ""
                        console.log(line[indexDefinitionDefinition])
                        while (line[indexDefinitionDefinition-1]!=="="){
                          definition=line[indexDefinitionDefinition]+definition
                          indexDefinitionDefinition--;
                          console.log(line[indexDefinitionDefinition])
                        }
                        definition=line[indexDefinitionDefinition]+definition;
                        definition = definition.trim();
                        if (!(tokensSet.get(tokenName).includes(definition))) {
                          tokensSet.get(tokenName).push(definition);
                        };
                      };
                      console.log(line[i]);
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