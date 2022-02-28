
export function findParentElement(elm: HTMLElement, tagName: string): HTMLElement {
  let testElm = elm;

  while (testElm) {
    if (testElm.tagName.toUpperCase() === tagName.toUpperCase()) {return testElm;}
    testElm = testElm.parentElement;
  }
  return null;
}
