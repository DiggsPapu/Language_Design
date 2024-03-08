export const YalexTokens = {
    NUMBER: "0|1|2|3|4|5|6|7|8|9",
    CHARACTER: "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z",
    SYMBOLS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z','0', '1', '2', '3', '4', '5', '6', '7', '8', '9','=', ':', ';', '\\+', '-', '\\*', '\\?', '\\.', '\\(', '\\)'],
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

export class asciiUniverses {
  constructor() {
    this.getUniverse();
  }
  getUniverse(){
    this.MAYUS= []
    this.MINUS=[]
    this.NUMBER = []
    this.UNIVERSE = []
    this.TERMINAL = "((\n)|(\t)|(\r)|( ))"
    this.TILDES = ["á","é","í","ó","ú","Á","É","Í","Ó","Ú"]
    this.MATH = ["\\+", "-", "\\*", "/", "^", "\\(", "\\)", "\\.", "=", ">", "<"]
    this.BRACKETS = ["[","]"]
    this.PARENTHESIS = ["\\(","\\)"]
    this.OPERATORS = ["\\+", "\\*", "\\(","\\)", "\\.", "\\|", "\\?"]
    this.ESCAPE_CHARACTERS = ["\\n", "\\t", "\\r", "\\b", "\\f", "\\s"]
    this.PUNCTUATION = [";","\\.",":", ",", "!", "\\?" ]
    for (let i = 0; i<=255; i++){
      this.UNIVERSE.push(String.fromCharCode(i));
      if (i>=65 && i<=90) this.MAYUS.push(String.fromCharCode(i));
      if (i>=97 && i<=122) this.MINUS.push(String.fromCharCode(i));
      if (i>=48 && i<=58) this.NUMBER.push(String.fromCharCode(i));
    }
    this.RANGES = [...this.MAYUS, ...this.MINUS, ...this.NUMBER];
    this.DOUBLE_QUOTES = ["\"(", this.RANGES.join("|"),"|", this.MATH.join("|"), "|",this.PUNCTUATION.join("|"), "|", this.ESCAPE_CHARACTERS.join("|"),"| )+\""].join("");
    console.log(this.DOUBLE_QUOTES);
    this.SIMPLE_QUOTES = ["'(", this.RANGES.join("|"), "|", this.MATH.join("|"), "|", this.ESCAPE_CHARACTERS.join("|"),"|", this.PUNCTUATION.join("|"), "| )'"].join("");
    console.log(this.SIMPLE_QUOTES);
    this.DEFINITION_DEFINITION = ["( )*(",this.RANGES.join("|"), this.MATH.join("|"), "|", this.DOUBLE_QUOTES, "|", this.SIMPLE_QUOTES, "|", this.OPERATORS.join("|"), "|", this.BRACKETS.join("|"),"|_)+", this.TERMINAL ].join("")
    console.log(this.DEFINITION_DEFINITION)
  }
}