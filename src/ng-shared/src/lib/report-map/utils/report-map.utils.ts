import { BBox } from 'geojson';

import { LatLng } from '@solargis/types/site';

import { AreaBBox, CircleOptions } from 'ng-shared/report-map/types';

function isInsideBBox(point: LatLng, bbox: AreaBBox): boolean {
  return (
    point?.lat < bbox?.south &&
    point?.lat > bbox?.north &&
    point?.lng > bbox?.west &&
    point?.lng < bbox?.east
  );
}

function convertAreaBBox(bbox: AreaBBox): BBox {
  return [bbox.west, bbox.east, bbox.south, bbox.north];
}

function renderMapCanvas(
  canvas: HTMLCanvasElement,
  imagePath: string,
  point: LatLng,
  bbox: BBox = [-180, 180, 90, -90],
  circleOpts: CircleOptions = { radius: 20, fillColor: 'black', borderColor: 'white', borderWidth: 5 }
): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  const image = new Image();

  let [west, east] = bbox;
  const [north, south] = bbox;

  image.src = imagePath;
  image.onload = () => {
    canvas.height = canvas.width * (image.height / image.width); // set size proportional to image
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

    if (point) {
      if (west > 180) { west -= 360; }
      if (east < -180) { east += 360; }

      const x = (canvas.width * (point.lng - west)) / (east - west);
      const y = (canvas.height * (north - point.lat)) / (north - south);
      const half = circleOpts.radius * 0.5;

      ctx.arc(x - half, y - half, circleOpts.radius, 0, 2 * Math.PI, true);

      if (circleOpts.fillColor) {
        ctx.fillStyle = circleOpts.fillColor;
        ctx.fill();
      }

      if (circleOpts.borderWidth > 0) {
        ctx.strokeStyle = circleOpts.borderColor;
        ctx.lineWidth = circleOpts.borderWidth;
        ctx.stroke();
      }
    }
  };

  return ctx;
}

export function generateSiteMap(
  assetsUrl: string,
  bboxes: { [key: string]: AreaBBox },
  element: HTMLCanvasElement,
  point?: LatLng,
  countryCode?: string
): CanvasRenderingContext2D {
  const continents = [
    'africa',
    'europe',
    'middle-east',
    'asia',
    'australia-oceania',
    'north-america',
    'central-america',
    'south-america'
  ];
  const world = 'world';

  const imageDir = `${assetsUrl}/country-maps/`;

  let imagePath: string;
  let bbox: AreaBBox;

  if (countryCode && point) {
    countryCode = countryCode.toUpperCase();
    const countryBBox = bboxes[countryCode];
    if (isInsideBBox(point, countryBBox)) {
      const countryImagePath = `${imageDir}${countryCode}.png`;
      imagePath = countryImagePath;
      bbox = countryBBox;
    }
  }

  // failover to a continent
  if (!imagePath && point) {
    const lowestCenterDistance = 1000;
    for (const continent of continents) {
      const continentBBox = bboxes[continent];
      if (isInsideBBox(point, continentBBox)) {
        const centerDistance = Math.sqrt(
          Math.pow((continentBBox.west - continentBBox.east) / 2 - point.lng, 2) +
          Math.pow((continentBBox.south - continentBBox.north) / 2 - point.lat, 2)
        );
        if (centerDistance < lowestCenterDistance) {
          imagePath = `${imageDir}${continent}.png`;
          bbox = continentBBox;
        }
      }
    }
  }

  // ultimate failover to "World"
  if (!imagePath) {
    imagePath = `${imageDir}${world}.png`;
    const worldBBox = bboxes[world];
    bbox = worldBBox;
  }

  const circleOpts = { radius: 50, fillColor: 'black', borderColor: 'white', borderWidth: 5 };

  return renderMapCanvas(element, imagePath, point, convertAreaBBox(bbox), circleOpts);
}

export function generateCoverMap(assetsUrl: string, element: HTMLCanvasElement, point?: LatLng): CanvasRenderingContext2D {
  const worldMapBBox: BBox = [-180, 180, 65, -60];
  const circleOpts = { radius: 20, borderColor: 'black', borderWidth: 12 };

  return renderMapCanvas(element, `${assetsUrl}/report-cover.png`, point, worldMapBBox, circleOpts);
}

