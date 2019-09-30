import parse from './html';
import parseCss from './css';

const tree = parse('<p class="para">hello</p>');

const cssTree = parseCss('h3 { margin: auto; color: #cc000000; } .main {color: blue;}');
console.log(JSON.stringify(cssTree, null, 2));
