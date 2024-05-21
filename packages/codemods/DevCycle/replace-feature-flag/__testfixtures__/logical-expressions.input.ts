const isDefaulted = __CODEMOD_LITERAL__(true);
const simpleCaseValue = __CODEMOD_LITERAL__(false);

const testCase1 = (false || isDefaulted) && simpleCaseValue;
const testCase2 = ((true && false) || (isDefaulted && !simpleCaseValue)) && true;
const testCase3 = ((false || false) && (true || false)) || (true && (false || true));

const x = true;
const testCase4 = ((false && x) || (isDefaulted && !!simpleCaseValue)) && (x || !simpleCaseValue);
const testCase5 = (true || false) && ((false && true) || (true && false)) && isDefaulted;
const testCase6 = (!false && true) || (!true && false);
const testCase7 = (!(true || false) && (!!false || !!true));
