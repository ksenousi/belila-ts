import { HtmlNode, AttrMap, ElementNode, TextNode } from './dom';
import assert from './shared/assert';

export default function parseHtml(source: String): HtmlNode {
  const nodes = new Parser(0, source).parseNodes();
  if (nodes.length === 1) {
    return nodes[0];
  } else {
    return new ElementNode('html', new Map(), nodes);
  }
}

class Parser {
  constructor(private pos: number, private input: String) {}

  parseNodes(): HtmlNode[] {
    let nodes: HtmlNode[] = [];
    while (true) {
      this.consumeWhitespace();
      if (this.eof || this.startsWith('</')) {
        break;
      }
      nodes.push(this.parseNode());
    }
    return nodes;
  }

  parseNode(): HtmlNode {
    if (this.nextChar() === '<') {
      return this.parseElement();
    } else {
      return this.parseText();
    }
  }

  parseElement(): HtmlNode {
    assert(this.consumeChar() == '<');

    const tagName = this.parseTagName();
    const attrs = this.parseAttributes();
    assert(this.consumeChar() == '>');

    const children = this.parseNodes();

    assert(this.consumeChar() == '<');
    assert(this.consumeChar() == '/');
    assert(this.parseTagName() == tagName);
    assert(this.consumeChar() == '>');

    return new ElementNode(tagName, attrs, children);
  }

  parseText(): HtmlNode {
    const text = this.consumeWhile((x: string) => x !== '<');
    return new TextNode(text);
  }

  parseTagName(): string {
    return this.consumeWhile((x: string) => /^\w+$/.test(x));
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
    while (true) {
      this.consumeWhitespace();
      if (this.nextChar() === '>') {
        break;
      }
      const [name, value] = this.parseAttr();
      attributes.set(name, value);
    }
    return attributes;
  }

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
}
