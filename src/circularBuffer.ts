import * as fs from 'fs';

export class CircularBuffer {
  private buffer: string[];
  private capacity: number;
  private pointer: number;

  constructor(capacity: number) {
    this.buffer = [];
    this.capacity = capacity;
    this.pointer = 0;
  }

  push(item: string): void {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(item);
    } else {
      this.buffer[this.pointer] = item;
      this.pointer = (this.pointer + 1) % this.capacity;
    }
  }

  contains(item: string): boolean {
    return this.buffer.includes(item);
  }

  toArray(): string[] {
    return this.buffer.slice();
  }
}

export function loadBufferFromFile(filename: string, bufferSize: number): CircularBuffer {
  let bufferContent: string[];

  if (!fs.existsSync(filename)) {
    fs.writeFileSync(filename, JSON.stringify([]));
  }

  try {
    bufferContent = JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (error) {
    console.error(`Error reading buffer file: ${filename}`, error);
    bufferContent = [];
  }

  const buffer = new CircularBuffer(bufferSize);
  bufferContent.forEach((item: string) => buffer.push(item));

  return buffer;
}


export function saveBufferToFile(filename: string, circularBuffer: CircularBuffer): void {
  try {
    fs.writeFileSync(filename, JSON.stringify(circularBuffer.toArray()));
  } catch (error) {
    console.error(`Error writing buffer to file: ${filename}`, error);
  }
}
