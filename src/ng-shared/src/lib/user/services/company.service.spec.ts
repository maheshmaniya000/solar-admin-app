import { of } from 'rxjs';

import { VatCountryRef } from '@solargis/types/customer';

import { runMarbleTest } from 'components/utils/test';
import { Config } from 'ng-shared/config';

import { FUPHttpClientService } from '../../fup/services/fup-http-client.service';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  describe('validateVatId', () => {
    let service: CompanyService;
    const configStub = { api: { customerUrl: '' } } as Config;
    const validInputs = {
      SK2022962766: true,
      NL810157895B01: true
    };
    const skCountry: VatCountryRef = { vatPrefix: 'SK' };
    const nlCountry: VatCountryRef = { vatPrefix: 'NL' };

    const http: Partial<FUPHttpClientService> = {
      get: jest.fn((route: string) => {
        const routeParts = route.split('/');
        const vatId = routeParts.length && routeParts[routeParts.length - 1];
        return of(!!validInputs[vatId]);
      })
    };

    const testOutput = (vatId: string, country: VatCountryRef, expectedResult: boolean): void => {
      runMarbleTest(
        service.validateVatId(country, vatId)
      ).andExpectToEmit('(a|)', { a: expectedResult });
    };

    beforeEach(() => (service = new CompanyService(http as FUPHttpClientService, configStub)));

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
    it('should return false when the vatId is invalid with valid prefix', () => {
      testOutput('SK1234567890', skCountry, false);
    });
    it('should return false when the vatId doesnt have two letter prefix', () => {
      testOutput('K1234567890', skCountry, false);
    });
    it('should return false when the vatId has shorter length', () => {
      testOutput('1234', skCountry, false);
    });
    it('should return false when the vatId is empty string', () => {
      testOutput('', skCountry, false);
    });
    it('should return false when the vatId is null', () => {
      testOutput(null, skCountry, false);
    });
    it('should return false when the vatId is undefined', () => {
      testOutput(undefined, skCountry, false);
    });
    it('should return false when the valid vatId has a space before', () => {
      testOutput(' SK2022962766', skCountry, false);
    });
    it('should return false when the valid vatId has a space after', () => {
      testOutput('SK2022962766 ', skCountry, false);
    });
    it('should return false when the valid vatId has a space inbetween', () => {
      testOutput('SK2 022962766', skCountry, false);
    });
    it('should return false when the vatId is valid but without the prefix', () => {
      testOutput('2022962766', skCountry, false);
    });
    it('should return false when the vatId is valid but not for the appropriate country', () => {
      testOutput('SK2022962766', nlCountry, false);
    });
    it('should return true when the vatId is valid and for the appropriate country', () => {
      testOutput('SK2022962766', skCountry, true);
      testOutput('NL810157895B01', nlCountry, true);
    });
  });
});
