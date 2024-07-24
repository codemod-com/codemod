import { deepStrictEqual } from "node:assert";
import type { UnifiedFileSystem } from "@codemod-com/filemod";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import tsmorph from "ts-morph";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);
  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi<{
    tsmorph: typeof tsmorph;
    unifiedFileSystem: UnifiedFileSystem;
  }>(
    unifiedFileSystem,
    () => ({
      tsmorph,
      unifiedFileSystem,
    }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", {}, {});
};

describe("i18n remove unused translations", () => {
  it("should support t('translationKey')", async () => {
    const A_CONTENT = `
		import { useLocale } from "@calcom/lib/hooks/useLocale";
		
		export default function A() {
			const { t } = useLocale();
			
			return <>
			<p>{t('key_1')}</p>
			<p>{t( a ? 'key_2' : 'key_3')}</p>
			</>
		}
	`;

    const LOCALE_CONTENT = `
	{
		"key_1": "key1",
		"key_2": "key2",
		"key_3": "key3",
		"key_4": "key4",
	}	
	`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
		{
			"key_1": "key1",
			"key_2": "key2",
			"key_3": "key3",
		}	
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support props.language('translationKey')", async () => {
    const A_CONTENT = `
		import { useLocale } from "@calcom/lib/hooks/useLocale";
		
		export default function A(props) {
			return <p>{props.language('key_1')}</p>
		}
	`;

    const LOCALE_CONTENT = `
	{
		"key_1": "key1",
		"key_2": "key2"
	}	
	`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
		{
			"key_1": "key1"
		}	
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support this.getTextBody('translationKey1', 'translationText2')", async () => {
    const A_CONTENT = `
		import { useLocale } from "@calcom/lib/hooks/useLocale";
		
		export default class A extends B {
			protected c() {
				return {
					text: this.getTextBody("key_1", "key_2"),
				};
			}
		}
	`;

    const LOCALE_CONTENT = `
	{
		"key_1": "key1",
		"key_2": "key2", 
		"key_3": "key3,
	}	
	`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
		{
			"key_1": "key1",
			"key_2": "key2",
		}	
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support a.translate('translationKey')", async () => {
    const A_CONTENT = `
		import { useLocale } from "@calcom/lib/hooks/useLocale";
		
		export default function A(props) {
			return <p>{props.a.b.c.translate('key_1')}</p>
		}
	`;

    const LOCALE_CONTENT = `
	{
		"key_1": "key1",
		"key_2": "key2"
	}	
	`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
		{
			"key_1": "key1"
		}	
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support <Trans i18nKey='translationKey'>", async () => {
    const A_CONTENT = `
		import { Trans } from "next-i18next";
		
		export default function A() {
			return <Trans i18nKey="key_1"></Trans>
		}
	`;

    const LOCALE_CONTENT = `
	{
		"key_1": "key1",
		"key_2": "key2"
	}	
	`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
		{
			"key_1": "key1"
		}	
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support <Trans i18nKey={`key${variable}`}>", async () => {
    const A_CONTENT = `
			import { Trans } from "next-i18next";
			
			const variable1 = "1";
			const variable2 = "2";
			
			export default function A() {
				return <>
				<Trans i18nKey={\`key_\${variable1}\`} ></Trans>
				<p>{t(\`key_\${variable2}\`)}</p>
				</>
			}
		`;

    const LOCALE_CONTENT = `
			{
				"aaakey": "aaakey",
				"key_1": "key1",
				"key_2": "key2"
			}
		`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
			{
				"key_1": "key1",
				"key_2": "key2"
			}
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support <Trans i18nKey={`${variable}_tail`}>", async () => {
    const A_CONTENT = `
			import { Trans } from "next-i18next";
			
			const variable = "1";
			
			export default function A() {
				return <>
					<Trans i18nKey={\`\${variable}_tail\`} ></Trans>
				</>
			}
		`;

    const LOCALE_CONTENT = `
			{
				"unused_key": "",
				"key_tail": "",
			}
		`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
			{
				"key_tail": "",
			}
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should support t(`${variable}_tail`)", async () => {
    const A_CONTENT = `
			t(\`\${variable2}_tail\`);
		`;

    const LOCALE_CONTENT = `
			{
				"unused_key": "",
				"key_tail": "",
			}
		`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
			{
				"key_tail": "",
			}
		`;
    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });

  it("should consider snake_case component props i18n keys>", async () => {
    const A_CONTENT = `			
			export default function Component() {
				return <Component a='key_1' b='key_2' c='name' />
			}
		`;

    const LOCALE_CONTENT = `
			{
				"unused_key": "",
				"key_1": "",
				"key_2": "",
			}
		`;

    const [upsertDataCommand] = await transform({
      "/opt/project/components/A.tsx": A_CONTENT,
      "/opt/project/public/static/locales/en/common.json": LOCALE_CONTENT,
    });

    const expectedResult = `
			{
				"key_1": "",
				"key_2": "",
			}
		`;

    deepStrictEqual(upsertDataCommand?.kind, "upsertFile");

    deepStrictEqual(
      upsertDataCommand.path,
      "/opt/project/public/static/locales/en/common.json",
    );

    deepStrictEqual(
      upsertDataCommand.newData.replace(/\W/gm, ""),
      expectedResult.replace(/\W/gm, ""),
    );
  });
});
