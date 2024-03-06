import { NFA } from "./NFA";
import { Regex } from "./Regex";
import { SyntaxTree } from "./SyntaxTree";
import { ThompsonToken } from "./ThompsonToken";
import { Token, TokenTypes } from "./Token";

const YalexTokens = {
  NUMBER: "0|1|2|3|4|5|6|7|8|9",
  CHARACTER: "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z",
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
      // AFD FOR THE COMMENTARIES
      let regex = new Regex("\\(\\* *("+YalexTokens.TILDES+"|"+YalexTokens.CHARACTER+"|"+YalexTokens.NUMBER+"| |\\.|\\+|\\||\\*|,|\\.)* *\\*\\)");      
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
      regex = new Regex("( )*(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5|6|7|8|9|=|:|;|\\+|-|\\*|\\?|\\.|\\(|\\)|\\||]|[|_|\\n|\\t|\\r|\\s|\"|'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'|'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|' '|'\\n'|'\\t'|'\\r'|'\\s'|'\\+'|'-'|'\\*'|'\\?'|'\\.'|'\\('|'\\)'|'\\|'|'\"'|';'|':'|'=')+"+YalexTokens.TERMINAL)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.definitionDefinitionDFA = ast.generateDirectDFATokens();
      // AFD FOR THE RULES
      regex = new Regex("rule tokens( )*=( )*")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.startRuleDFA = ast.generateDirectDFATokens();
      // rule name
      regex = new Regex("( )*(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|0|1|2|3|4|5|6|7|8|9|\\+|-|\\*|\\?|\\.|\\(|\\)|\\||]|[|_|\\n|\\t|\\r|\\s|\"|'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L'|'M'|'N'|'O'|'P'|'Q'|'R'|'S'|'T'|'U'|'V'|'W'|'X'|'Y'|'Z'|'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|'v'|'w'|'x'|'y'|'z'|'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|' '|'\\n'|'\\t'|'\\r'|'\\s'|'\\+'|'-'|'\\*'|'\\?'|'\\.'|'\\('|'\\)'|'\\|'|'\"'|';'|':'|'='|\":=\")+"+YalexTokens.TERMINAL)
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleNameDFA = ast.generateDirectDFATokens();
      // rule body
      regex = new Regex("{( )*return( )+(_|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)+( )*}")
      tokenTree = regex.constructTokenTree();
      ast = new SyntaxTree(tokenTree[0], tokenTree[1], regex, tokenTree[2]);
      this.ruleBodyDFA = ast.generateDirectDFATokens();
      console.log(this.ruleBodyDFA)
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
            let tokensSet = new Map();
            tokensSet.set("COMMENTARY", []);
            tokensSet.set("DELIMITERS", []);
            let rulesSet = new Map();
            let S = null;
            // Handle EOF
            data+="\n";
            for (let i = 0; i<data.length; i++){
              [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(data, i);
              [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(data, i);
              [isLet, indexLet, S] = this.letDFA.yalexSimulate(data, i);
              [startRuleSection, indexStartRule, S] = this.startRuleDFA.yalexSimulate(data, i);
              // It is a space or some kinda symbol
              if (isDelim){
                console.log("isDelim");
                i = indexDelim;
                if (!(tokensSet.get("DELIMITERS").includes(data[i]))) {
                  tokensSet.get("DELIMITERS").push(data[i]);
                };
              }
              // It is a commentary, it is ignored
              else if (isCommentary){
                console.log("isComment");
                i = indexComentary;
                let definition = "";
                while (!(data[indexComentary]==="(" && data[indexComentary+1]==="*")){
                  definition=data[indexComentary]+definition
                  indexComentary--;
                }
                definition=data[indexComentary]+definition;
                tokensSet.get("COMMENTARY").push(definition);
              }
              else if (isLet){
                i = indexLet;
                console.log(`indexLet:${indexLet}->${data[indexLet]}`);
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
                  if (!tokensSet.has(tokenName)){
                    tokensSet.set(tokenName, []);
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
                    if (!(tokensSet.get(tokenName).includes(definition))) {
                      tokensSet.get(tokenName).push(definition);
                    };
                  };
                  // console.log(data[i]);
                }              
              }
              // From this point to what is left it will proceed processing
              // the rest of the file because we can't return to let section over here
              else if (startRuleSection){
                let isRuleName = false;
                let indexRuleName = 0;
                let isRuleBody = false;
                let indexRuleBody = 0;
                let insideRuleDefinition = false;
                let ruleName = null;
                for (i=indexStartRule; i < data.length; i++){
                  [isCommentary, indexComentary, S] = this.commentaryDFA.yalexSimulate(data, i);
                  [isDelim, indexDelim, S] = this.delimDFA.yalexSimulate(data, i);
                  [isRuleName, indexRuleName, S] = this.ruleNameDFA.yalexSimulate(data, i);
                  console.log("tryRuleBody");
                  [isRuleBody, indexRuleBody, S] = this.ruleBodyDFA.yalexSimulate(data, i);
                  // It is a space or some kinda symbol
                  if (isDelim){
                    console.log("isDelim");
                    i = indexDelim;
                    if (!(tokensSet.get("DELIMITERS").includes(data[i]))) {
                      tokensSet.get("DELIMITERS").push(data[i]);
                    };
                    if (data[i]==="\n"){
                      insideRuleDefinition = false;
                    }
                  }
                  // It is a commentary, it is ignored
                  else if (isCommentary){
                    console.log("isComment");
                    i = indexComentary;
                    let definition = "";
                    while (!(data[indexComentary]==="(" && data[indexComentary+1]==="*")){
                      definition=data[indexComentary]+definition
                      indexComentary--;
                    }
                    definition=data[indexComentary]+definition;
                    tokensSet.get("COMMENTARY").push(definition);
                  }
                  // Another rule section starts
                  else if (data[i]==="|") {
                    console.log("START ANOTHER RULE SECTION!!!!")
                    console.log(data.slice(i, data.length - 1));
                    insideRuleDefinition = false;
                    ruleName = null;
                  }
                  // It is a rule name and should not be inside a rule definition
                  else if (isRuleName && !insideRuleDefinition) {
                    console.log("RULENAME");
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
                    if (!rulesSet.has(ruleName)){
                      rulesSet.set(ruleName.trim(), "");
                    }
                    // Here i must create a error if already has a ruleName
                  }
                  // Is a rule body, must be inside a rule definition and rule name must not be null
                  else if (isRuleBody && insideRuleDefinition && ruleName !== null) {
                    console.log("RULEBODY");
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
                    if (rulesSet.get(ruleName)===""){
                      rulesSet.set(ruleName,return_.trim());
                      insideRuleDefinition = false;
                      ruleName = null;
                    }
                    // Here I gotta create an error handling
                  }
                }
              };
            }
            console.log(tokensSet);
            console.log(rulesSet);
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