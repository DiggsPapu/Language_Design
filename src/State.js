/**
 * Clase para modelar estados del AFN/AFD
 *
 * tiene:
 *
 * - label
 * - un mapa (diccionario) con transiciones
 *
 */

export class State {
  constructor(label, transitions) {
    this.label = label;
    this.transitions = transitions;
  }
}
