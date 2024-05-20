
const isDefaulted = __CODEMOD__(true);
const simpleCaseValue = __CODEMOD__(false);

const testCase2 = ((true && false) || (isDefaulted && !simpleCaseValue)) && true;
