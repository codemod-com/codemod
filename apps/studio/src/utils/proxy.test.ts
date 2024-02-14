import assert from 'assert';
import jscodeshift from 'jscodeshift';
import sinon from 'sinon';
import { describe, it } from 'vitest';
import { Event } from '../schemata/eventSchemata';
import { EventManager } from './eventManager';
import { proxifyJSCodeshift } from './proxy';

describe('proxy', () => {
	it('should report the correct number of proxy events', () => {
		const eventManager = new EventManager();
		const proxyEvents: Event[] = [];

		const onProxifiedCollectionSpy = sinon.spy();
		const onProxifiedPathSpy = sinon.spy();

		const j = proxifyJSCodeshift(
			jscodeshift.withParser('tsx'),
			eventManager,
			onProxifiedCollectionSpy,
			onProxifiedPathSpy,
		);

		const fileCollection = j('const i = j;\nlet k = 3;');

		const identifierCollection = fileCollection.find(j.Identifier);

		identifierCollection.replaceWith(() => j.identifier('t'));

		const variableDeclaratorCollection = fileCollection.find(
			j.VariableDeclarator,
		);

		variableDeclaratorCollection.remove();

		const source = fileCollection.toSource();

		assert.equal(source, '');
		assert.equal(proxyEvents.length, 0);
		assert.equal(onProxifiedCollectionSpy.calledOnce, true);
		assert.equal(onProxifiedPathSpy.calledOnce, false);
	});
});
