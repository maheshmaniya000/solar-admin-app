import moment from 'moment';
import { of } from 'rxjs';

import { availableDateFormats } from '../models';
import { DatepickerFormatAdapter } from './date-picker-format-adapter';

describe('CustomDateFormatService', () => {
  const timestamp = new Date(2021, 2, 5).valueOf();
  const formatted = [
    '05.03.2021',
    '03.05.2021',
    '2021.03.05',
    '05/03/2021',
    '03/05/2021',
    '2021/03/05',
    '05-03-2021',
    '03-05-2021',
    '2021-03-05'
  ];

  availableDateFormats
    .map(({ format }) => format)
    .forEach((format, index) => {
      describe(`for format ${format}`, () => {
        let dateAdapter: DatepickerFormatAdapter;
        beforeEach(() => {
          const serviceMock = { selectDateTimeFormat: jest.fn() };
          serviceMock.selectDateTimeFormat.mockReturnValue(
            of({
              dateFormat: format
            })
          );
          dateAdapter = new DatepickerFormatAdapter(serviceMock as any, 'en');
        });

        describe(`format`, () => {
          it('should return correctly formatted string', () => {
            expect(dateAdapter.format(moment(timestamp), undefined)).toEqual(formatted[index]);
          });
        });

        describe(`parse`, () => {
          it('should return correctly parsed moment/timestamp', () => {
            expect(dateAdapter.parse(formatted[index], undefined).valueOf()).toEqual(timestamp);
          });
        });
      });
    });
});
