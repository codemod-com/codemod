import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 replace-param-prop", () => {
  it('should replace "params" prop with "match.params" ', async () => {
    const input = `
		const PostEdit = ({ params }) => {
			return <div>
				<h1>Post {params.id}</h1>
			</div>
		}
		`;

    const output = `
		const PostEdit = ({ match }) => {
			const { params } = match;
			return <div>
				<h1>Post {params.id}</h1>
			</div>
		}
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });

  it('should replace "params" prop with "match.params" in mapStateToProps', async () => {
    const input = `
		const PostEdit = () => {
			return null;
		}

		const mapStateToProps = (state, { params }) => {

			return {
				a: params.a
			}
		}

		`;

    const output = `
		const PostEdit = () => {
			return null;
		}

		const mapStateToProps = (state, { match }) => {
			const { params } = match;
			return {
				a: params.a
			}
		}
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("js"), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });
});
