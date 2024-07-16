import { PortableTextInput, type PortableTextInputProps } from "sanity";

const onPaste: PortableTextInputProps["onPaste"] = (data) => {
  const text = data.event.clipboardData.getData("text/plain") || "";

  function isTable(data) {
    if (!data || typeof data !== "string") return false;
    const rows = data?.split("\n");
    if (Number(rows?.length) < 2) return false;
    const columns = rows?.[0]?.split("\t");
    if (!columns || columns.length < 2) return false;
    return rows.slice(1).every((row) => {
      return row.split("\t").length === columns.length;
    });
  }
  try {
    if (isTable(text)) {
      return Promise.resolve({
        insert: [
          {
            _type: "ptTable",
            table: {
              rows: text.split("\n").map((line) => {
                return {
                  cells: line.split("\t"),
                  _type: "tableRow",
                };
              }),
            },
          },
        ],
      });
    }
    return undefined;
  } catch (_) {
    return undefined;
  }
};

const CustomPTEditor = (props: PortableTextInputProps) => {
  return <PortableTextInput {...props} onPaste={onPaste} />;
};

export default CustomPTEditor;
