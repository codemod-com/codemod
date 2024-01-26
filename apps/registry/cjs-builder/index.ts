#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import esbuild from 'esbuild';

// list of packages that should be bundled to the codemod (e.g codemod internal utils)
const EXTERNAL_DEPENDENCIES = ['jscodeshift', 'ts-morph'];

export const buildCjs = async () => {
	const relativeInputFilePath = process.argv.at(2);

	if (relativeInputFilePath === undefined) {
		throw new Error(
			'You must provide the relativeInputFileName to build the CJS bundle file',
		);
	}

	const relativeOutputFilePath = './dist/index.cjs';
	const absoluteOutputFilePath = join(process.cwd(), relativeOutputFilePath);

	let licenseBuffer: string;

	try {
		licenseBuffer = (await readFile('./LICENSE', 'utf8'))
			.replace(/\/\*/gm, '\\/*')
			.replace(/\*\//gm, '*\\/');
	} catch {
		licenseBuffer = '';
	}

	const options: Parameters<typeof esbuild.build>[0] = {
		entryPoints: [relativeInputFilePath],
		bundle: true,
		external: EXTERNAL_DEPENDENCIES,
		platform: 'node',
		minify: true,
		minifyWhitespace: true,
		format: 'cjs',
		legalComments: 'inline',
		outfile: relativeOutputFilePath,
		write: false, // to the in-memory file system
	};

	const { outputFiles } = await esbuild.build(options);

	const contents =
		outputFiles?.find((file) => file.path === absoluteOutputFilePath)
			?.contents ?? null;

	if (contents === null) {
		throw new Error(
			`Could not find ${absoluteOutputFilePath} in output files`,
		);
	}

	const buffer = Buffer.concat([
		Buffer.from('/*! @license\n'),
		Buffer.from(licenseBuffer),
		Buffer.from('*/\n'),
		contents,
	]);

	await mkdir(dirname(absoluteOutputFilePath), { recursive: true });

	await writeFile(absoluteOutputFilePath, buffer);

	return {
		absoluteOutputFilePath,
	};
};

buildCjs()
	.then(({ absoluteOutputFilePath }) => {
		console.log(
			'The bundled CommonJS contents have been written into %s',
			absoluteOutputFilePath,
		);
	})
	.catch((error) => {
		console.error(error);
	});
