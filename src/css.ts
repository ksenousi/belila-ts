import assert from './shared/assert';
import isValidIdentifier from './shared/is-valid-identifier';

export interface Stylesheet {
  rules: Rule[];
}

export interface Rule {
  selectors: Selector[];
  declarations: Declaration[];
}

interface Declaration {
  name: string;
  value: Value;
}

export type Value =
  | { value: number; unit: Unit }
  | { keyword: string }
  | { color: Color };

enum Unit {
  Px = 'px',
}

interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export type Specificity = [number, number, number];

export class Selector {
  constructor(
    public tagName: string,
    public id: string,
    public classNames: string[]
  ) {}

  getSpecificity(): Specificity {
    return [this.id.length, this.classNames.length, this.tagName.length];
  }
}

export default function parseCss(source: string): Stylesheet {
  const parser = new Parser(0, source);
  return { rules: parser.parseRules() };
}

class Parser {
  constructor(private pos: number, private input: string) {}

  parseRules(): Rule[] {
    const rules: Rule[] = [];
    while (true) {
      this.consumeWhitespace();
      if (this.eof()) {
        break;
      }
      rules.push(this.parseRule());
    }
    return rules;
  }

  parseRule(): Rule {
    const selectors: Selector[] = this.parseSelectors();
    const declarations: Declaration[] = this.parseDeclarations();
    return { selectors, declarations };
  }

  parseDeclarations(): Declaration[] {
    assert(this.consumeChar() === '{');
    const declarations = [];
    while (true) {
      this.consumeWhitespace();
      if (this.nextChar() === '}') {
        this.consumeChar();
        break;
      }
      const declaration = this.parseDeclaration();
      declarations.push(declaration);
    }
    return declarations;
  }

  parseDeclaration(): Declaration {
    const name = this.parseIndentifier();
    this.consumeWhitespace();
    assert(this.consumeChar() === ':');
    this.consumeWhitespace();
    const value = this.parseValue();
    this.consumeWhitespace();
    assert(this.consumeChar() === ';');
    return { name, value };
  }

  parseValue(): Value {
    const nextChar = this.nextChar();

    if (/^[0-9]+$/.test(nextChar)) {
      return this.parseLength();
    } else if (nextChar === '#') {
      return this.parseColor();
    } else {
      const identifier = this.parseIndentifier();
      return { keyword: identifier };
    }
  }

  parseColor(): Value {
    assert(this.consumeChar() === '#');
    const color: Color = {
      r: this.parseHexPair(),
      g: this.parseHexPair(),
      b: this.parseHexPair(),
      a: this.parseHexPair(),
    };
    return { color };
  }

  parseHexPair(): number {
    const s = this.input.slice(this.pos, this.pos + 2);
    this.pos += 2;
    return parseInt(s, 16);
  }

  parseLength(): Value {
    return { value: this.parseNumber(), unit: this.parseUnit() };
  }

  parseUnit(): Unit {
    const identifier = this.parseIndentifier();
    if (identifier.toLowerCase() === 'px') {
      return Unit.Px;
    } else {
      throw new Error('unrecognized unit');
    }
  }

  parseNumber(): number {
    const str: string = this.consumeWhile((char: string) =>
      /^[0-9,\.]+$/.test(char)
    );
    return Number(str);
  }

  parseSelectors(): Selector[] {
    const selectors: Selector[] = [];
    while (true) {
      selectors.push(this.parseSelector());
      this.consumeWhitespace();
      if (this.nextChar() === ',') {
        this.consumeChar();
        this.consumeWhitespace();
      } else if (this.nextChar() === '{') {
        break;
      } else {
        throw new Error(`unexpected '${this.nextChar()}' in selector list`);
      }
    }
    selectors.sort((a, b) =>
      compareSpecificity(a.getSpecificity(), b.getSpecificity())
    );
    return selectors;
  }

  parseSelector(): Selector {
    const selector = new Selector(undefined, undefined, []);
    parseLoop: while (!this.eof()) {
      switch (this.nextChar()) {
        case '#':
          this.consumeChar();
          selector.id = this.parseIndentifier();
          break parseLoop;
        case '.':
          this.consumeChar();
          selector.classNames.push(this.parseIndentifier());
          break parseLoop;
        case '*':
          this.consumeChar();
          break parseLoop;
        default:
          if (isValidIdentifier(this.nextChar())) {
            selector.tagName = this.parseIndentifier();
            break parseLoop;
          }
      }
    }
    return selector;
  }

  parseIndentifier(): string {
    return this.consumeWhile(isValidIdentifier);
  }

  consumeWhitespace() {
    this.consumeWhile((char: string) => char === ' ');
  }

  consumeWhile(test: (char: string) => boolean) {
    let result = '';
    while (!this.eof() && test(this.nextChar())) {
      result += this.consumeChar();
    }
    return result;
  }

  nextChar(): string {
    return this.input[this.pos];
  }

  consumeChar(): string {
    const currentValue = this.input[this.pos];
    this.pos++;
    return currentValue;
  }

  eof(): boolean {
    return this.pos >= this.input.length;
  }
}

function compareSpecificity(a: number[], b: number[]): number {
  const maxLength: number = Math.max(a.length, b.length);
  for (let i = 0; i < maxLength; i++) {
    const diff: number = a[i] - b[i];
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}
