import { calculateEconomyParameters, economyLayersMap, EconomyParameters } from '@solargis/prospect-detail-calc';
import { AnnualDataMap } from '@solargis/types/dataset';
import { EconomyInput } from '@solargis/types/economy';
import { SystemConfig } from '@solargis/types/pvlib';
import { Unit } from '@solargis/units';

export type EconomyInputsRow = {
  value: number;
  unit: Unit;
  label: string;
};

export function economyInputsRows(
  inputs: EconomyInput,
  annualPvCalcData: AnnualDataMap,
  system: SystemConfig
): (string | EconomyInputsRow)[] {
  const calcParams: EconomyParameters = calculateEconomyParameters(inputs, system.pvInstalledPower);
  const unit = (key: string): Unit => {
    const layer = economyLayersMap.get(key);
    return layer && layer.unit;
  };

  const loanRows = [
    {value: inputs.loan, unit: unit('loan'), label: 'projectDetail.economy.form.loan'},
    {value: calcParams.loanEquity, unit: unit('loanEquity'), label: 'projectDetail.economy.form.loanEquity'},
    {value: calcParams.loanDebtToEquity, unit: unit('loanDebtToEquity'), label: 'projectDetail.economy.layer.loanDebtToEquity.name'},
    {value: inputs.loanInterestRate, unit: unit('loanInterestRate'), label: 'projectDetail.economy.form.interestRate'},
    {value: inputs.loanPeriod, unit: unit('loanPeriod'), label: 'projectDetail.economy.form.loanPeriod'},
    {value: calcParams.loanLinearPayment, unit: unit('loanLinearPayment'), label: 'projectDetail.economy.layer.loanLinearPayment.name'},
  ];

  return [
    // PRICE OF ELECTRICITY
    'projectDetail.economy.form.priceOfElectricity',
    {value: inputs.tariff, unit: unit('tariff'), label: 'projectDetail.economy.layer.tariff.name'},
    {
      value: inputs.tariffIndexationRate,
      unit: unit('tariffIndexationRate'),
      label: 'projectDetail.economy.layer.tariffIndexationRate.name'
    },

    // SYSTEM INSTALLATION COSTS
    'projectDetail.economy.form.installationCost',
    {value: system.pvInstalledPower, unit: unit('installedPower'), label: 'pvConfig.params.systemSize.capacity'},
    {value: inputs.installationCosts, unit: unit('installationCosts'), label: 'projectDetail.economy.form.installationCost'},
    {value: calcParams.unitSystemCosts, unit: unit('unitSystemCosts'), label: 'projectDetail.economy.layer.unitSystemCosts.name'},
    {value: inputs.incentiveOrRebate, unit: unit('incentiveOrRebate'), label: 'projectDetail.economy.layer.incentiveOrRebate.name'},
    {value: calcParams.CAPEX, unit: unit('CAPEX'), label: 'projectDetail.economy.layer.CAPEX.name'},
    ...(inputs.hasLoan ? loanRows : []),

    // OPERATIONAL COSTS
    'projectDetail.economy.form.annualOperationalCost',
    {value: inputs.annualOperationalCost, unit: unit('annualOperationalCost'), label: 'projectDetail.economy.form.annualOperationalCost'},
    {value: inputs.maintenanceReserve, unit: unit('maintenanceReserve'), label: 'projectDetail.economy.layer.maintenanceReserve.name'},
    {
      value: inputs.inverterReplacementYear,
      unit: unit('inverterReplacementYear'),
      label: 'projectDetail.economy.layer.inverterReplacementYear.name'
    },
    {value: calcParams.OPEX, unit: unit('OPEX'), label: 'projectDetail.economy.layer.OPEX.name'},
    {value: inputs.OPEXInflationRate, unit: unit('OPEXInflationRate'), label: 'projectDetail.economy.layer.OPEXInflationRate.name'},

    // ACCOUNTING INFO
    'projectDetail.economy.form.accountingInfo',
    {value: inputs.discountRate, unit: unit('discountRate'), label: 'projectDetail.economy.layer.discountRate.name'},
    {value: inputs.taxesOnProfit, unit: unit('taxesOnProfit'), label: 'projectDetail.economy.layer.taxesOnProfit.name'},
    {value: inputs.linearDeprecationPeriod, unit: unit('linearDeprecationPeriod'), label: 'projectDetail.economy.form.linearDeprecation'},

    // PV CONFIGURATION
    'projectDetail.pvConfig.pvConfiguration',
    {value: inputs.yearsOfOperation, unit: unit('yearsOfOperation'), label: 'projectDetail.economy.form.yearsOfOperation'},
    {value: system.pvAvailabilityYearly, unit: unit('systemAvailability'), label: 'pvConfig.params.systemAvailability.headline'},
    {value: annualPvCalcData.PVOUT_total, unit: unit('PVOUT_total'), label: 'projectDetail.economy.form.totalYield'},
    {value: system.pvModuleDegradationFirstYear, unit: unit('degradation'), label: 'projectDetail.economy.form.degradationFirst'},
    {value: system.pvModuleDegradation, unit: unit('degradation'), label: 'projectDetail.economy.form.degradationNext'},
  ];
}
