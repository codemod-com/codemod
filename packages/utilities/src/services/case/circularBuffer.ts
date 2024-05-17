type Callback = (buffer: Buffer) => void;

export class CircularBuffer {
	protected _buffer: Buffer;
	protected _start = 0;
	protected _end = 0;
	protected _currentByteLength = 0;
	protected _requestedByteLength = 0;

	public constructor(
		protected readonly _MAX_BYTE_LENGTH: number,
		protected readonly _callback: Callback,
	) {
		this._buffer = Buffer.alloc(_MAX_BYTE_LENGTH);
	}

	public requireByteLength(byteLength: number): void {
		this._requestedByteLength = byteLength;

		this.__readConditionally();
	}

	public getFreeByteLength(): number {
		return this._MAX_BYTE_LENGTH - this._currentByteLength;
	}

	public write(buffer: Buffer, byteLength: number): void {
		if (byteLength === 0) {
			throw new Error(
				'You cannot write 0 bytes into the circular buffer',
			);
		}

		let freeByteLength = this.getFreeByteLength();

		if (this.getFreeByteLength() < byteLength) {
			throw new Error(
				`You cannot write ${byteLength} byte(s) when only ${freeByteLength} is/are available`,
			);
		}

		if (this._start <= this._end) {
			let freeRightByteLength = this._MAX_BYTE_LENGTH - this._end;

			let firstSourceStart = 0;
			let firstSourceEnd = Math.min(freeRightByteLength, byteLength);

			if (firstSourceEnd !== 0) {
				buffer.copy(
					this._buffer,
					this._end,
					firstSourceStart,
					firstSourceEnd,
				);
			}

			let secondSourceStart = firstSourceEnd;
			let secondSourceEnd = byteLength;

			if (firstSourceEnd !== byteLength) {
				buffer.copy(
					this._buffer,
					0,
					secondSourceStart,
					secondSourceEnd,
				);
			}
		} else {
			// end < start
			buffer.copy(this._buffer, this._end, 0, byteLength);
		}

		let overflownEnd = this._end + byteLength;

		this._end =
			overflownEnd >= this._MAX_BYTE_LENGTH
				? overflownEnd - this._MAX_BYTE_LENGTH
				: overflownEnd;

		this._currentByteLength += byteLength;

		this.__readConditionally();
	}

	private __readConditionally() {
		if (this._requestedByteLength === 0 || this._callback === null) {
			return;
		}

		if (this._currentByteLength < this._requestedByteLength) {
			return;
		}

		let targetBuffer = Buffer.alloc(this._requestedByteLength);

		if (this._start < this._end) {
			this._buffer.copy(
				targetBuffer,
				0,
				this._start,
				this._start + this._requestedByteLength,
			);
		} else {
			// start >= end
			let firstSourceStart = this._start;
			let firstSourceEnd = Math.min(
				this._start + this._requestedByteLength,
				this._MAX_BYTE_LENGTH,
			);

			this._buffer.copy(
				targetBuffer,
				0,
				firstSourceStart,
				firstSourceEnd,
			);

			let secondSourceStart = 0;
			let secondSourceEnd =
				this._requestedByteLength > this._MAX_BYTE_LENGTH - this._start
					? this._requestedByteLength -
						(this._MAX_BYTE_LENGTH - this._start)
					: 0;

			let targetStart = firstSourceEnd - firstSourceStart;

			if (secondSourceEnd !== 0) {
				this._buffer.copy(
					targetBuffer,
					targetStart,
					secondSourceStart,
					secondSourceEnd,
				);
			}
		}

		let overflownStart = this._start + this._requestedByteLength;

		this._start =
			overflownStart >= this._MAX_BYTE_LENGTH
				? overflownStart - this._MAX_BYTE_LENGTH
				: overflownStart;

		this._currentByteLength -= this._requestedByteLength;

		this._requestedByteLength = 0;

		process.nextTick(() => this._callback(targetBuffer));
	}
}
