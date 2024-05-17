import { EventEmitter } from 'node:events';
import { describe, expect, it } from 'vitest';
import { CircularBuffer } from './circularBuffer.js';

interface TestEventEmitter extends EventEmitter {
	emit(event: 'buffer', buffer: Buffer): boolean;
	once(event: 'buffer', listener: (buffer: Buffer) => void): this;
}

class TestEventEmitter extends EventEmitter {}

class TestCircularBuffer extends CircularBuffer {
	protected _eventEmitter: TestEventEmitter;

	public constructor(_MAX_BYTE_LENGTH: number) {
		let eventEmitter = new TestEventEmitter();

		super(_MAX_BYTE_LENGTH, (buffer) => {
			eventEmitter.emit('buffer', buffer);
		});

		this._eventEmitter = eventEmitter;
	}

	public requireBytes(byteLength: number): () => Promise<Buffer> {
		return () =>
			new Promise<Buffer>((resolve) => {
				this._eventEmitter.once('buffer', (buffer) => {
					resolve(buffer);
				});
				this.requireByteLength(byteLength);
			});
	}

	public getBuffer(): Buffer {
		let buffer = Buffer.alloc(this._buffer.byteLength);
		this._buffer.copy(buffer);

		return buffer;
	}

	public getStart(): number {
		return this._start;
	}

	public getEnd(): number {
		return this._end;
	}
}

describe('CircularBuffer', () => {
	it('should call the requireByteLength callback if it contains enough bytes already', async () => {
		let circularBuffer = new TestCircularBuffer(1);

		circularBuffer.write(Buffer.from([1]), 1);

		expect(circularBuffer.getFreeByteLength()).equal(0);

		let buffer = await circularBuffer.requireBytes(1)();

		expect(buffer).toStrictEqual(Buffer.from([1]));

		expect(circularBuffer.getFreeByteLength()).toEqual(1);
	});

	it('should call the requireByteLength callback when it contains enough bytes', async () => {
		let circularBuffer = new TestCircularBuffer(1);

		expect(circularBuffer.getFreeByteLength()).toEqual(1);

		let callback = circularBuffer.requireBytes(1);

		circularBuffer.write(Buffer.from([1]), 1);

		let buffer = await callback();

		expect(buffer).toStrictEqual(Buffer.from([1]));

		expect(circularBuffer.getFreeByteLength()).toEqual(1);
	});

	it('should read and write without overflowing the buffer', async () => {
		let circularBuffer = new TestCircularBuffer(3);
		circularBuffer.write(Buffer.from([1, 2]), 2);

		expect(circularBuffer.getBuffer()).toStrictEqual(
			Buffer.from([1, 2, 0]),
		);
		expect(circularBuffer.getStart()).toEqual(0);
		expect(circularBuffer.getEnd()).toEqual(2);
		expect(circularBuffer.getFreeByteLength()).toEqual(1);
		expect(await circularBuffer.requireBytes(1)()).toStrictEqual(
			Buffer.from([1]),
		);

		expect(circularBuffer.getStart()).toEqual(1);
		expect(circularBuffer.getEnd()).toEqual(2);
		expect(circularBuffer.getFreeByteLength()).toEqual(2);
		circularBuffer.write(Buffer.from([3, 4]), 2);

		expect(circularBuffer.getBuffer()).toStrictEqual(
			Buffer.from([4, 2, 3]),
		);
		expect(circularBuffer.getStart()).toEqual(1);
		expect(circularBuffer.getEnd()).toEqual(1);
		expect(circularBuffer.getFreeByteLength()).toEqual(0);
		expect(await circularBuffer.requireBytes(2)()).toStrictEqual(
			Buffer.from([2, 3]),
		);
		expect(circularBuffer.getStart()).toEqual(0);
		expect(circularBuffer.getEnd()).toEqual(1);
		expect(circularBuffer.getFreeByteLength()).toEqual(2);
		expect(await circularBuffer.requireBytes(1)()).toStrictEqual(
			Buffer.from([4]),
		);

		expect(circularBuffer.getStart()).toEqual(1);
		expect(circularBuffer.getEnd()).toEqual(1);
		expect(circularBuffer.getFreeByteLength()).toEqual(3);
		circularBuffer.write(Buffer.from([5, 6, 7]), 3);

		expect(circularBuffer.getBuffer()).toStrictEqual(
			Buffer.from([7, 5, 6]),
		);
		expect(circularBuffer.getStart()).toEqual(1);
		expect(circularBuffer.getEnd()).toEqual(1);
		expect(circularBuffer.getFreeByteLength()).toEqual(0);
		expect(await circularBuffer.requireBytes(3)()).toStrictEqual(
			Buffer.from([5, 6, 7]),
		);

		expect(circularBuffer.getStart()).toEqual(1);
		expect(circularBuffer.getEnd()).toEqual(1);
		expect(circularBuffer.getFreeByteLength()).toEqual(3);
	});

	it('should not allow for writing zero bytes', () => {
		let circularBuffer = new TestCircularBuffer(1);

		expect(() => circularBuffer.write(Buffer.from([]), 0)).throw(
			'You cannot write 0 bytes into the circular buffer',
		);
	});

	it('should not allow for writing more bytes than available', () => {
		let circularBuffer = new TestCircularBuffer(1);

		expect(() => circularBuffer.write(Buffer.from([1, 2]), 2)).throw(
			'You cannot write 2 byte(s) when only 1 is/are available',
		);
	});

	it('should writing bytes if the end mark is lower than the start mark', async () => {
		let circularBuffer = new TestCircularBuffer(3);

		circularBuffer.write(Buffer.from([1, 2]), 2);

		await circularBuffer.requireBytes(1)();

		circularBuffer.write(Buffer.from([3, 4]), 2);

		await circularBuffer.requireBytes(1)();

		expect(circularBuffer.getBuffer()).toStrictEqual(
			Buffer.from([4, 2, 3]),
		);
		expect(circularBuffer.getStart()).toEqual(2);
		expect(circularBuffer.getEnd()).toEqual(1);
		expect(circularBuffer.getFreeByteLength()).toEqual(1);

		circularBuffer.write(Buffer.from([5]), 1);

		expect(circularBuffer.getBuffer()).toStrictEqual(
			Buffer.from([4, 5, 3]),
		);
		expect(circularBuffer.getStart()).toEqual(2);
		expect(circularBuffer.getEnd()).toEqual(2);
		expect(circularBuffer.getFreeByteLength()).toEqual(0);
	});
});
