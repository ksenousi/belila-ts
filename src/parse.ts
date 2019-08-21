import { HtmlNode, createTextNode, createElementNode, AttrMap } from './dom';

export default function parse(source: String): HtmlNode {
  const nodes = new Parser(0, source).parseNodes();
  if (nodes.length === 1) {
    return nodes[0];
  } else {
    return createElementNode('html', new Map(), nodes);
  }
}

class Parser {
  constructor(private pos: number, private input: String) {}

  nextChar(): string {
    return this.input[this.pos];
  }

  startsWith(str: string): boolean {
    return this.input.slice(this.pos).startsWith(str);
  }

  eof(): boolean {
    return this.pos >= this.input.length;
  }

  consumeChar(): string {
    const currentChar = this.input[this.pos];
    this.pos++;
    return currentChar;
  }

  consumeWhile(test: Function): string {
    let result = '';
    while (!this.eof() && test(this.nextChar())) {
      result += this.consumeChar();
    }
    return result;
  }

  consumeWhitespace() {
    this.consumeWhile((x: string) => x === ' ');
  }

  parseTagName(): string {
    return this.consumeWhile((x: string) => /^\w+$/.test(x));
  }

  parseNode(): HtmlNode {
    if (this.nextChar() === '<') {
      return this.parseElement();
    } else {
      return this.parseText();
    }
  }

  parseText(): HtmlNode {
    const text = this.consumeWhile((x: string) => x !== '<');
    return createTextNode(text);
  }

  parseElement(): HtmlNode {
    assert(this.consumeChar() == '<');

    const tag_name = this.parseTagName();
    const attrs = this.parseAttributes();
    assert(this.consumeChar() == '>');

    const children = this.parseNodes();

    assert(this.consumeChar() == '<');
    assert(this.consumeChar() == '/');
    assert(this.parseTagName() == tag_name);
    assert(this.consumeChar() == '>');

    return createElementNode(tag_name, attrs, children);
  }

  parseAttr(): [string, string] {
    const name = this.parseTagName();
    assert(this.consumeChar() === '=');
    const value = this.parseAttrValue();
    return [name, value];
  }

  parseAttrValue(): string {
    const openQuote = this.consumeChar();
    assert(openQuote == '"' || openQuote == "'");
    const value = this.consumeWhile((c: string) => c !== openQuote);
    assert(this.consumeChar() === openQuote);
    return value;
  }

  parseAttributes(): AttrMap {
    const attributes: AttrMap = new Map<string, string>();
    while (this.nextChar() !== '>') {
      this.consumeWhitespace();
      const [name, value] = this.parseAttr();
      attributes.set(name, value);
    }
    return attributes;
  }

  parseNodes(): HtmlNode[] {
    let nodes: HtmlNode[] = [];
    while (!this.eof() && !this.startsWith('</')) {
      this.consumeWhitespace();
      nodes.push(this.parseNode());
    }
    return nodes;
  }
}

function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
