# Language_Design
Es el repositorio de diseño de lenguajes de programación, tiene el código de todo el curso.

## Regex a probar
- (a*|b*)c
- (b|b)*abb(a|b)*
- (a|ε)b(a+)c?
- (a|ε)b(a+)c?
- (a|b)*a(a|b)(a|b)
- b*ab?
- b+abc+
- ab*ab*
- 0(0|1)*0
- ((ε|0)1*)*
- (0|1)*0(0|1)(0|1)
- (00)*(11)*
- (0|1)1*(0|1)
- 0?(1|ε)?0*
- ((1?)*)*
- (01)*(10)*

## Yalex
let delim = [' ''\t''\n']
let letter = ['A'-'Z''a'-'z']
let digit = ['0'-'9']
let digit = ["0123456789"]
let delim = ["\s\t\n"]

let digits = digit+
let ws = delim+
let id = letter(letter|digit)*
let number = digits(.digits)?('E'['+''-']?digits)?
let digits = digit+ (* Cambie por una acción válida, que devuelva el token *)
let digits = digit+
let ws = delim+?
let id = (letter|digit)*



                 let delim = [' ''\t''\n']
let ws = delim+
let letter = ['A'-'Z''a'-'z']
let str = (_)*
let digit = ['0'-'9']
let digits = digit+
let id = letter(letter|str|digit)*
let number = digits(.digits)?('E'['+''-']?digits)?
let delim = [' ''\t''\n']
let ws = delim+
let digit = ["0123456789"]
let digits = digit+
let number = digits(.digits)?('E'['+''-']?digits)?
let delim = [' ''\t''\n']
let ws = delim+
let letter = ['A'-'Z''a'-'z']
let digit = ['0'-'9']
let id = letter(letter|digit)*
let delim = [' ''\t''\n']
let ws = delim+
let letter = ['A'-'Z''a'-'z']
let digit = ['0'-'9']
let id = letter(letter|digit)*
let delim = ["\s\t\n"]
let ws = delim+
let letter = ['A'-'Z''a'-'z']
let digit = ['0'-'9']
let digits = digit+
let id = letter(letter|digit)*
let number = digits(.digits)?('E'['+''-']?digits)?