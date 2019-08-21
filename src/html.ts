import { HtmlNode, createTextNode, createElementNode, AttrMap } from 'dom';

class Parser {
  constructor(private pos: number, private input: String) {}

  nextChar(): string {
    return this.input[this.pos];
  }

  startsWith(s: string): boolean {
    return this.input[this.pos].startsWith(s);
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
    while (this.eof() && test(this.nextChar())) {
      result += this.consumeChar();
    }
    return result;
  }

  consumeWhitespace() {
    this.consumeWhile((x: string) => x !== ' ');
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
    assert!(this.consumeChar() == '<');

    let tag_name = this.parseTagName();
    let attrs = this.parseAttributes();
    assert!(this.consumeChar() == '>');

    let children = this.parseNodes();

    assert!(this.consumeChar() == '<');
    assert!(this.consumeChar() == '/');
    assert!(this.parseTagName() == tag_name);
    assert!(this.consumeChar() == '>');

    return createElementNode(tag_name, attrs, children);
  }

  parseAttr(): [string, string] {
    const name = this.parseTagName();
    assert!(this.consumeChar() === '=');
    const value = this.parseAttrValue();
    return [name, value];
  }

  parseAttrValue(): string {
    const openQuote = this.consumeChar();
    assert!(openQuote == '"' || openQuote == "'");
    const value = this.consumeWhile((c: string) => c !== openQuote);
    assert!(this.consumeChar() === openQuote);
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

  parseNodes(): HtmlNode[] {
    let nodes: HtmlNode[] = [];
    while (true) {
      this.consumeWhitespace();
      if (this.eof() || this.startsWith('</')) {
        break;
      }
      nodes.push(this.parseNode());
    }
    return nodes;
  }
}

export function parse(source: String): HtmlNode {
  const nodes = new Parser(0, source).parseNodes();
  if (nodes.length === 1) {

  } else {
    
  }
}
//   // If the document contains a root element, just return it. Otherwise, create one.
//   if nodes.len() == 1 {
//       nodes.swap_remove(0)
//   } else {
//       dom::elem("html".to_string(), HashMap::new(), nodes)
//   }
// }

function assert(condition: boolean, message?: string) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}
