import * as fs from "node:fs/promises";
import { formatText } from "@codemod-com/utilities";
import { convertChangesToDMP, diffLines } from "diff";
import MagicString from "magic-string";
import { clc } from "../helpers.js";
import { Context } from "./Context.js";

const formatByDefault = process.argv.includes("--format");

export type FileContextData = { file: string };

export class FileContext extends Context<FileContextData> {
  private _contents: string | undefined = undefined;
  private _magicString: MagicString | undefined = undefined;
  private _contentsChanged = false;
  private _oldContents: string | undefined = undefined;
  public importsUpdates: { type: "add" | "remove"; import: string }[] = [];

  get file() {
    return this.get("file");
  }

  async contents() {
    if (typeof this._contents === "undefined") {
      this._contents = await fs.readFile(this.file, { encoding: "utf-8" });
      this._oldContents = this._contents;
    }
    if (typeof this._magicString !== "undefined") {
      return this._magicString.toString();
    }
    return this._contents;
  }

  setContents(contents: string) {
    this._contents = contents;
    this._magicString = undefined;
    this._contentsChanged = true;
  }

  async magicString() {
    if (typeof this._magicString === "undefined") {
      this._magicString = new MagicString(await this.contents());
    }
    return this._magicString;
  }

  async update({
    start,
    end,
    replacement,
  }: {
    start: number;
    end: number;
    replacement: string;
  }) {
    const magicString = await this.magicString();
    magicString.update(start, end, replacement);
  }

  async save({ format }: { format?: boolean } = {}) {
    let contents: string | undefined;
    if (this._magicString?.hasChanged()) {
      contents = this._magicString.toString();
    } else if (this._contentsChanged) {
      contents = this._contents;
    }
    if (typeof contents === "string") {
      const oldContents = this._oldContents;
      const newContents = format
        ? await formatText(this.file, contents)
        : contents;
      await fs.writeFile(this.file, newContents);
      this._oldContents = undefined;
      this._contents = undefined;
      this._magicString = undefined;
      this._contentsChanged = false;
      console.error(`${clc.blueBright("FILE")} ${this.file}`);
      // @TODO improve diffs
      const changes = convertChangesToDMP(
        diffLines(oldContents ?? newContents, newContents),
      );
      for (const [type, code] of changes) {
        switch (type) {
          // case 0:
          //   process.stdout.write(code);
          //   break;
          case -1:
            process.stdout.write(clc.red(code));
            break;
          case 1:
            process.stdout.write(clc.green(code));
            break;
        }
      }
      process.stdout.write("\n");
    }
  }

  get extension() {
    return this.file.split(".").pop();
  }
}
