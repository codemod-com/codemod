let isDefaulted = useFlag(user, 'simple-case', true);

let var1 = isDefaulted ? b : c;
let var2 = isDefaulted && (false || true) ? b : c;
let var3 = isDefaulted && 'string' ? b : c;
