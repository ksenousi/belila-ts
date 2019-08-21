export type AttrMap = Map<String, String>;
type NodeType = string | ElementData;

export class HtmlNode {
  constructor(private node_type: NodeType, private children: HtmlNode[]) {}
}

export class ElementData {
  constructor(private tag_name: string, private attributes: AttrMap) {}
}

export function createTextNode(text: string): HtmlNode {
  return new HtmlNode(text, []);
}

export function createElementNode(name: string, attrs: AttrMap, children: HtmlNode[]): HtmlNode {
  const elementData = new ElementData(name, attrs);
  return new HtmlNode(elementData, children);
}
