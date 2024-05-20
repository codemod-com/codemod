const a = __CODEMOD__("string") + "something";
const isDefaulted = __CODEMOD__(true);
const simpleCaseValue = __CODEMOD__(true);

if(a === "string") {
    
}

const b = a + "other string";


const y = (false || (isDefaulted)) && (x && !!simpleCaseValue);
// const y = (false || (true)) && (x && !!true);
// const y = true && (x && true)
// const y = true && (x)
