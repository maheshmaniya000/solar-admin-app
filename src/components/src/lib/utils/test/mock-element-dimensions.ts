import spyOn = jest.spyOn;

export function mockElementDimensions(
  element: HTMLElement,
  width: number,
  height: number
): void {
  spyOn(element, 'offsetWidth', 'get').mockImplementation(() => width);
  spyOn(element, 'offsetHeight', 'get').mockImplementation(() => height);
}
