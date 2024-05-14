import path from 'path';
import { Configuration } from 'webpack';
import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MonacoEditorPlugin from "monaco-editor-webpack-plugin";
import tailwindConfig from '../../../tailwind.config';
import webpack from 'webpack';

global.process.env = {
		NODE_ENV: 'development'
	}
console.log('__dirname', __dirname)
const basePath = path.resolve(__dirname, '../../../');
const config: Configuration = {
	mode: 'development',
	entry: './app/(website)/studio/index.tsx',
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'bundle.js',
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									// new webpack.ProvidePlugin({
									// 	process: 'process/browser',  // Ensures `process` is available globally
									// }),
									new Dotenv({ path: path.resolve(basePath,'./.env') }),
									tailwindConfig,
									require('autoprefixer'),
								],
							},
						},
					},
				],
			},
			{
				test: /\.txt$/i,
				use: 'raw-loader',
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		alias: {
			"@": basePath,
			"@studio/main":  path.resolve(basePath, './app/(website)/studio/main'),
			"@studio":  path.resolve(basePath,'./app/(website)/studio/src'),
			"@chatbot":  path.resolve(basePath,'./app/(website)/studio/main/modGPT'),
			"tslib":  path.resolve(basePath,'node_modules/tslib'),
			"ts-morph":  path.resolve(basePath,'node_modules/ts-morph'),
			"@utils":  path.resolve(basePath,'./utils'),
			"@context": path.resolve(basePath, './app/context'),
			"@auth":  path.resolve(basePath,'./app/auth'),
			"be-types":  path.resolve(basePath,'../backend/types'),
		},
		fallback: {
			fs: false,
			crypto: false,
			buffer: false,
			stream: false,
			child_process: false,
			process: require.resolve('process/browser'),
		},
	},
	plugins: [
		new MonacoEditorPlugin({
			languages: ["typescript", "html", "css", "json"],
			filename: 'static/[name].worker.js',
			publicPath: '/',
		}),
		new HtmlWebpackPlugin({
			template: './app/(website)/studio/index.html',
		}),
	],
};

export default config;
