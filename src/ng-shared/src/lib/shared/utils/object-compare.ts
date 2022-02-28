// FIXME why not using lodash.isEqual?

export function checkIfAContainB(A, B, opt = {checkTypes: false, maxLevel: 5}, level = 0): boolean {
  if (level > opt.maxLevel) {return true;}

  for (const i in B) {
    if (B[i] === A[i]) {continue;}

    const a = A[i] === 0 ? '0' : A[i];
    const b = B[i] === 0 ? '0' : B[i];

    if (B[i] && typeof B[i] === 'object') {
      if (!A[i] || typeof A[i] !== 'object') {return false;}

      if (!checkIfAContainB(A[i], B[i], opt, level + 1)) {return false;}

    } else if (opt.checkTypes && A[i] !== B[i]) {return false;}

    // tslint:disable-next-line:triple-equals
    else if (!opt.checkTypes && a !== b && !!b) {return false;}
  }
  return true;
}

/**
 * Function compare two objects.
 *
 * @param Object A
 * @param Object B
 * @param opt Default: {checkTypes: false, maxLevel: 5}
 * @return boolean
 */
 export function objectsAreEqual(A, B, opt = {checkTypes: false, maxLevel: 5}): boolean {
  return checkIfAContainB(A, B, opt) && checkIfAContainB(B, A, opt);
};
