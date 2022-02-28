type TableOfContentsItem = {
  id: string;
  title: string;
  subtitle?: string;
};

export type TableOfContents = TableOfContentsItem[];

// TODO - refactoring according to https://medium.com/@pofider/generate-pdf-with-toc-using-chrome-c3b44f924ff9
export const BASIC_PV = (economy = false): number[] => economy ?
  [ 1, 2, 4, 5, 8, 10, 12, 14, 15, 17, 19, 20 ] : [ 1, 2, 4, 5, 8, 10, 12, 14, 15, 17, 18 ];

export const BASIC_NOPV = [ 1, 2, 4, 7, 10, 12, 13 ];

export const PRO_PV = (economy = false): number[] => economy ?
  [ 1, 2, 4, 5, 9, 11, 13, 15, 16, 18, 20, 21 ] : [ 1, 2, 4, 5, 9, 11, 13, 15, 16, 18, 19 ];

export const PRO_NOPV = [ 1, 2, 4, 8, 11, 13, 14 ];
