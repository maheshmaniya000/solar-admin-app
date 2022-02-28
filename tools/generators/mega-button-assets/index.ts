import { generateFiles, joinPathFragments, Tree } from '@nrwl/devkit';
import * as path from 'path';
import { readFileSync } from 'fs';
import * as SVGSpriter from 'svg-sprite';
import { Config } from 'svg-sprite';

const assetBasePath = 'src/ng-shared/src/assets/img/mega-button';
const componentBasePath = 'src/components/src/lib/mega-button';

const svgSpriterConfig: Config = {
  mode: {
    stack: {
      sprite: 'assets/img/mega-button/sprite.svg',
      bust: false
    }
  }
};

const generateIconEnum = (tree: Tree, iconNames: string[]): void =>
  generateFiles(tree, joinPathFragments(__dirname, './template'), componentBasePath, {
    icons: iconNames.map(iconName => `  '${iconName}' = '${iconName}'`).join(',\n'),
    tpl: ''
  });

export default async function (tree: Tree) {
  const icons = tree.children(`${assetBasePath}/icons`);
  const iconNames = icons.map(icon => path.parse(icon).name);
  generateIconEnum(tree, iconNames);
  const spriter = new SVGSpriter(svgSpriterConfig);
  icons
    .map(icon => joinPathFragments(`${assetBasePath}/icons`, icon))
    .forEach(iconPath => spriter.add(path.resolve(iconPath), path.parse(iconPath).base, readFileSync(iconPath, { encoding: 'utf-8' })));

  await new Promise<void>((resolve, reject) =>
    spriter.compile((error, result) => {
      if(error) {
        reject(error);
      } else {
        tree.write(joinPathFragments(assetBasePath, path.parse(result.stack.sprite.path).base), result.stack.sprite.contents);
        resolve();
      }
    })
  );
}
