import * as fs from "node:fs/promises";
import { formatText } from "@codemod-com/utilities";
import MagicString from "magic-string";
import { clc } from "../helpers.js";
import { Context } from "./Context.js";

export type FileContextData = { file: string };

export class FileContext extends Context<FileContextData> {
  private _contents: string | undefined = undefined;
  private _magicString: MagicString | undefined = undefined;
  private _contentsChanged = false;
  public importsUpdates: { type: "add" | "remove"; import: string }[] = [];

  get file() {
    return this.get("file");
  }

  async contents() {
    if (typeof this._contents === "undefined") {
      this._contents = await fs.readFile(this.file, { encoding: "utf-8" });
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
  }: { start: number; end: number; replacement: string }) {
    const magicString = await this.magicString();
    magicString.update(start, end, replacement);
  }

  async save({ skipFormat }: { skipFormat?: boolean } = {}) {
    let contents: string | undefined;
    if (this._magicString?.hasChanged()) {
      contents = this._magicString.toString();
    } else if (this._contentsChanged) {
      contents = this._contents;
    }
    if (typeof contents === "string") {
      await fs.writeFile(
        this.file,
        skipFormat ? contents : await formatText(this.file, contents, true),
      );
      this._contents = undefined;
      this._magicString = undefined;
      this._contentsChanged = false;
      console.log(`${clc.blueBright("FILE")} ${this.file}`);
    }
  }

  get extension() {
    return this.file.split(".").pop();
  }
}
