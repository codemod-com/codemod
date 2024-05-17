let promptRule = (errorMessage: string) => (value: string) =>
  value.indexOf("$BEFORE") !== -1 && value.indexOf("$AFTER") !== -1
    ? ""
    : errorMessage;

let promptErrorMessage =
  'Prompt should contain "$BEFORE" and "$AFTER" literals';

export { promptRule, promptErrorMessage };
