/* eslint-disable @typescript-eslint/naming-convention */
import { VersionedDatasetData } from '@solargis/types/dataset';

export const lta: VersionedDatasetData = {
  annual: {
    data: {},
    metadata: {
      version: {
        data: '0.98',
        modules: {
          '@solargis/prospect-service': '9.7.0'
        }
      },
      ts: 1621344535021,
      source: {
        ncbinBaseUri: 's3://ncbin-lambda-prod/V2_SG2_MAPDATA_COMPLETE_2019-09-24/MAPDATA'
      },
      layers: {
        AZI: {
          method: 'Data processing',
          sources: [
            'ELE (Solargis)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: '°'
        },
        DNI_season: {
          method: 'Data processing',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'DNI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        ELE: {
          method: 'Data merging, cleaning, processing',
          sources: [
            'SRTM v4.1 (CGIAR CSI)',
            'Viewfinder Panoramas (Jonathan de Ferranti BA)',
            'GEBCO_2014 Grid (GEBCO)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: 'm'
        },
        GHI_season: {
          method: 'Data processing',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        LANDC: {
          method: 'Post-processing',
          sources: [
            'Land Cover CCI, v2.0.7 (ESA CCI)'
          ],
          updated: '2017-11-01',
          version: '2.1.13'
        },
        OPTA: {
          method: 'PV simulation model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI, DNI, ALBEDO (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: '°'
        },
        POPUL: {
          method: 'Data processing',
          sources: [
            'GPWv4 (CIESIN)'
          ],
          updated: '2017-11-01',
          version: '2.1.13',
          unit: 'inh./km2'
        },
        REGION: {
          sources: [
            'Solargis (Solargis)'
          ],
          updated: '2019-01-01',
          version: '2.1.26'
        },
        SLO: {
          method: 'Data processing',
          sources: [
            'ELE (Solargis)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: '°'
        },
        ALB: {
          method: 'Data merging, cleaning, processing',
          period: {
            from: '2006',
            to: '2015'
          },
          sources: [
            'Modis MCD43GF (NASA and LP DAAC)',
            'ERA5 (ECMWF)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        CDD: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'TEMP (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: '° days'
        },
        D2G: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI, DNI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        DIF: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'Solargis solar model (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        DNI: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'Solargis solar model (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        GHI: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'Solargis solar model (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        GTI_opta: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'DNI, GHI, OPTA, ALBEDO, ELE (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        HDD: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'TEMP (Solargis)'
          ],
          updated: '2019-02-01',
          version: '2.1.28',
          unit: '° days'
        },
        PREC: {
          method: 'Data processing',
          period: {
            from: '1891',
            to: '2018'
          },
          sources: [
            'GPCC database (DWD)'
          ],
          updated: '2018-06-01',
          version: '2.1.19',
          unit: 'mm'
        },
        PVOUT_csi: {
          method: 'PV simulation model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI, DNI, TEMP, OPTA, ALBEDO, ELE (Solargis)'
          ],
          updated: '2019-04-01',
          version: '2.1.29',
          unit: 'kWh/kWp'
        },
        PWAT: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'CFSR and CFSv2 models (NOAA)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: 'kg/m2'
        },
        RH: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'MERRA-2 model (NASA)',
            'CDFv2 model (NOAA)'
          ],
          updated: '2019-01-15',
          version: '2.1.27',
          unit: '%'
        },
        SNOWD: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'CFSR and CFSv2 models (NOAA)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: 'days'
        },
        TEMP: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'ERA (ECMWF)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: '°C'
        },
        WS: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'MERRA-2 model (NASA)',
            'CDFv2 model (NOAA)'
          ],
          updated: '2019-01-15',
          version: '2.1.26',
          unit: 'm/s'
        }
      }
    }
  },
};

export const pvcalcDetails: VersionedDatasetData = {
  annual: {
    data: {},
    metadata: {
      ts: 1621344597090,
      version: {
        data: '0.98',
        modules: {
          '@solargis/pvlib': '2.1.6',
          '@solargis/pvout-calc': '2.3.0',
          '@solargis/prospect-service': '9.7.0'
        }
      },
      source: {
        ncbinBaseUri: 's3://ncbin-lambda-prod/V2_SG2_PVCALC_COMPLETE_2019-09-24/PVCALC'
      },
      layers: {
        GHI: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'Solargis solar model (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        DNI: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'Solargis solar model (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        DIF: {
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI DNI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        D2G: {
          method: 'Solar model',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI, DNI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        GHI_season: {
          method: 'Data processing',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        DNI_season: {
          method: 'Data processing',
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'DNI (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28'
        },
        TEMP: {
          method: 'Data processing',
          period: {
            from: '1994',
            to: '2018'
          },
          sources: [
            'ERA5 (ECMWF)'
          ],
          updated: '2019-02-01',
          version: '2.1.27',
          unit: '°C'
        }
      }
    }
  }
};

export const pvcalc: VersionedDatasetData = {
  annual: {
    data: {},
    metadata: {
      ts: 1621344597090,
      version: {
        data: '0.98',
        modules: {
          '@solargis/pvlib': '2.1.6',
          '@solargis/pvout-calc': '2.3.0',
          '@solargis/prospect-service': '9.7.0'
        }
      },
      source: {
        ncbinBaseUri: 's3://ncbin-lambda-prod/V2_SG2_PVCALC_COMPLETE_2019-09-24/PVCALC'
      },
      layers: {
        PVOUT_specific: {
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GTI TEMP PWAT ELE (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/kWp'
        },
        PVOUT_total: {
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'PVOUT_specific (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh'
        },
        PR: {
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GTI PVOUT_specific (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: '%'
        },
        GTI: {
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI DNI ALB HORIZON (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        },
        GTI_theoretical: {
          period: {
            from: 'satregion',
            to: '2018'
          },
          sources: [
            'GHI DNI ALB (Solargis)'
          ],
          updated: '2019-03-01',
          version: '2.1.28',
          unit: 'kWh/m2'
        }
      }
    }
  }
};
