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
Se ejecuta con:
* node ./src/YalexAnalyzer.js ./yalexFiles/slr-1.yal