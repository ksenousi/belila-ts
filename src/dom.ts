export type AttrMap = Map<string, string>;
type NodeBody = string | ElementData;

export interface HtmlNode {
  body: NodeBody;
  children: HtmlNode[];
}

export class ElementData {
  constructor(public tag_name: string, public attributes: AttrMap) {}
  id(): string | undefined {
    return this.attributes.get('id');
  }

  classes(): Set<string> {
    const classlist: string | undefined = this.attributes.get('class');
    return classlist ? new Set(classlist.split(' ')) : new Set();
  }
}

export class TextNode implements HtmlNode {
  public children: HtmlNode[] = [];
  constructor(public body: string) {}
}

export class ElementNode implements HtmlNode {
  body: ElementData;

  constructor(name: string, attrs: AttrMap, public children: HtmlNode[]) {
    this.body = new ElementData(name, attrs);
  }
}
