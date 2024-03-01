import { Token, TokenTypes } from "./Token";

const YalexTokens = {
  NUMBER: /^[0-9]+/,
  IDENTIFIER:  /^[a-zA-Z]+[0-9]*[a-zA-Z]/,
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
        this.regex = this.readFile(data);
        this.definitions = {}
    };
    // Use an async function to wait for the data
    readFile(data) {
            let commentaryToken = "";
            let isCommentary = false;
            let tokensSet = []
            let newTokensSet = []
            for (let line of data.split('\n')){
              // The spaces are removed
              line = line.trim();
                for (let i = 0; i < line.length; ++i){
                    let c = line[i];
                    let new_token = "";
                    // Start commentary
                    if (c === '(' && line[i+1] === '*'){
                        while (i<line.length){
                            new_token += line[i];
                            if (line[i]===')' ){
                                if (line[i-1]==='*' ){
                                    i++
                                    tokensSet.push(new Token(new_token, "COMMENTARY"));
                                    break; 
                                }
                            }
                            i++;
                        }
                    };
                    // If is a definition "let "+something
                    if (c === 'l' && line[i+1]==='e' && line[i+2]==='t' && line[i+3]===' '){
                      i=i+3;
                      // It will ignore all the spaces
                      while (line[i]===' '){
                        i++;
                      }
                      // It will try to get the equal to get the name;
                      if (line[i] === '='){
                        // It will ignore all the spaces
                        while (line[i]===' '){
                          i++;
                        }
                        // It will enter in the function that defines the definition
                        this.definition(line, i);
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