
export type AreaBBox = {
  west: number;
  north: number;
  east: number;
  south: number;
};

export type ReportMapType = 'site' | 'cover';

export type CircleOptions = { radius: number; fillColor?: string; borderColor?: string; borderWidth?: number };
