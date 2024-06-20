let isDefaulted = useFlag(user, 'simple-case', true);
let simpleCaseValue = __CODEMOD_LITERAL__(false);

let testCase1 = (false || isDefaulted) && simpleCaseValue;
let testCase2 = ((true && false) || (isDefaulted && !simpleCaseValue)) && true;
let testCase3 =
	((false || false) && (true || false)) || (true && (false || true));

let x = true;
let testCase4 =
	((false && x) || (isDefaulted && !!simpleCaseValue)) &&
	(x || !simpleCaseValue);
let testCase5 =
	(true || false) && ((false && true) || (true && false)) && isDefaulted;
let testCase6 = (!false && true) || (!true && false);
let testCase7 = !(true || false) && (!!false || !!true);
