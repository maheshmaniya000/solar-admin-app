export function insertAfter(newChild: Element, refChild: Element): void {
  refChild.parentNode.insertBefore(newChild, refChild.nextSibling);
}
