import { Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

export function createTestScheduler(): TestScheduler {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}

export function runMarbleTest<T = any>(
  testObservable: Observable<T>,
  ...hotConfigs: {
    fn: () => void;
    marbles: string;
  }[]
): {
  andExpectToEmit: (expectedMarbles: string, expectedValues?: { [k: string]: T }) => void;
} {
  return {
    andExpectToEmit: (expectedMarbles: string, expectedValues?: { [k: string]: T }) =>
      createTestScheduler().run(({ expectObservable, hot }) => {
        hotConfigs?.forEach(config => hot(config.marbles).subscribe(config.fn));
        expectObservable(testObservable).toBe(expectedMarbles, expectedValues);
      })
  };
}
