function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export type LockerDialog = {
  path: string;
  section: string;
  image: string;
  title: string;
  text: string;
  bulletPoints: [] | string[];
};

export const lockerDialogContent = {
    'solar-meteo': {
      path: 'solar-meteo',
      section: '',
      image: `assets/img/content-locked-dialog/solar-meteo-${randomNumber(1, 4)}.png`,
      title: 'projectDetail.unlockDialog.title.solarMeteo',
      text: 'projectDetail.unlockDialog.text.solarMeteo',
      bulletPoints: []
    },
    'pv-electricity': {
      path: 'pv-electricity',
      section: '',
      image: 'assets/img/content-locked-dialog/pv-electricity.png',
      title: 'projectDetail.unlockDialog.title.pvElectricity',
      text: 'projectDetail.unlockDialog.text.pvElectricity',
      bulletPoints: []
    },
    'pv-performance': {
      path: 'pv-performance',
      section: '',
      image: 'assets/img/content-locked-dialog/pv-performance.png',
      title: 'projectDetail.unlockDialog.title.pvPerformance',
      text: 'projectDetail.unlockDialog.text.pvPerformance',
      bulletPoints: []
    },
    finance: {
      path: 'finance',
      section: '',
      image: 'assets/img/content-locked-dialog/economy.png',
      title: 'projectDetail.unlockDialog.title.finance',
      text: 'projectDetail.unlockDialog.text.finance',
      bulletPoints: [
        'projectDetail.unlockDialog.bulletPoints.economyCalculator.project',
        'projectDetail.unlockDialog.bulletPoints.economyCalculator.equity',
        'projectDetail.unlockDialog.bulletPoints.economyCalculator.ROI',
        'projectDetail.unlockDialog.bulletPoints.economyCalculator.LCOE',
      ]
    },
    reports: {
      path: 'reports',
      section: '',
      image: 'assets/img/content-locked-dialog/reports.png',
      title: 'projectDetail.unlockDialog.title.reports',
      text: 'projectDetail.unlockDialog.text.reports',
      bulletPoints: []
    },
    'download-data': {
      path: 'download-data',
      section: '',
      image: 'assets/img/content-locked-dialog/download.png',
      title: 'projectDetail.unlockDialog.title.download',
      text: 'projectDetail.unlockDialog.text.download',
      bulletPoints: []
    },
    compareTool: {
      path: '',
      section: 'compare-tool',
      image: 'assets/img/content-locked-dialog/compare.png',
      title: 'projectDetail.unlockDialog.title.compareTool',
      text: 'projectDetail.unlockDialog.text.compareTool',
      bulletPoints: []
    },
    pvConfig: {
      path: '',
      section: 'pvConfig',
      image: '',
      title: '',
      text: 'pvConfig.error.missing',
      bulletPoints: []
    }
  };
