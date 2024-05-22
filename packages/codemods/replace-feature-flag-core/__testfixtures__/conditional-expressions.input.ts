const isDefaulted = useFlag(user, 'simple-case', true);

const var1 = isDefaulted ? b : c;
const var2 = isDefaulted && ( false || true) ? b : c;
const var3 = isDefaulted && "string" ? b : c;