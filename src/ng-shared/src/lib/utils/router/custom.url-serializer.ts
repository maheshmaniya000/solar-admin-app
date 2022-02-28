import { Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

@Injectable()
export class CustomUrlSerializer extends DefaultUrlSerializer {

  serialize(tree: UrlTree): string {
    const serialized = super.serialize(tree);
    return serialized.replace(/%2c/gi, ','); // brute force
  }

}
