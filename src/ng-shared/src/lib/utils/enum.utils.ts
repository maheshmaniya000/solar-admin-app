
function enumMembers(ofType: 'string' | 'number'): any {
  return enumVal => Object.keys(enumVal).map(k => enumVal[k]).filter(v => typeof v === ofType);
}

export function enumValues(enumVal): any {
  return enumMembers('number')(enumVal);
}

export function enumKeys(enumVal): any {
  return enumMembers('string')(enumVal);
}


