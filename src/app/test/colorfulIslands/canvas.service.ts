import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

enum AreaStatus {
  Sea = 0,
  Land = 1,
  Discovered = 2,
}

export interface ConfigInterface {
  size: number;
  ratio: number;
  color: string;
  sea: string;
  land: string;
  width: number;
  height: number;
}

const INITIAL_SIZE = 50;

@Injectable({providedIn: 'root'})
export class CanvasService {
  public island: number[] = new Array(Math.pow(INITIAL_SIZE, 2));
  public color: string[] = new Array(Math.pow(INITIAL_SIZE, 2));
  public timeGeneration: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public numberOfIslands: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public config: ConfigInterface = {
    color: '#00FF00',
    sea: '#cbe1ff',
    land: '#bbbbbb',
    size: 50,
    ratio: 40,
    width: 800,
    height: 800
  };

  private getInitialColor(value: number): string {
    if (value === AreaStatus.Land) {
      return this.config.land;
    }
    return this.config.sea;
  }

  private setValueAt(row: number, column: number, value: number) {
    this.island[row * this.config.size + column] = value;
  }

  public setSize(event) {
    this.config.size = event.target.value;
    this.island = new Array(Math.pow(event.target['value'], 2));
    this.color = new Array(Math.pow(event.target['value'], 2));
  }

  public getValueAt(row: number, column: number): number {
    return this.island[row * this.config.size + column];
  }

  public setIslandColor(row: number, column: number, value: string) {
    this.color[row * this.config.size + column] = value;
  }

  public getIslandColor(row: number, column: number): string {
    return this.color[row * this.config.size + column];
  }

  public resetNumberOfIslands(): this {
    this.numberOfIslands.next(0);
    return this;
  }

  public generate(): this {
    let state, color;
    for (let row = 0; row < this.config.size; row++) {
      for (let col = 0; col < this.config.size; col++) {
        state = Math.round(Math.random() * 100);
        const area = state >= this.config.ratio ? AreaStatus.Sea : AreaStatus.Land;
        color = this.getInitialColor(area);

        this.setValueAt(row, col, area);
        this.setIslandColor(row, col, color);
      }
    }
    return this;
  }

  public exeFuncAndAnalysePerformance(callback: Function, args?: any[]): this {
    const start = performance.now();
    callback.call(this, ...args);
    const end = performance.now();
    this.timeGeneration.next(Math.floor((end - start) * 100) / 100);
    return this;
  }

  private generateRandomColor(): string {
    // More Shorter & More Faster
    return '#' + ((1 << 24) * Math.random() | 0).toString(16); // I change the key "no-bitwise" to false in tsLint.json file
  }

  public standardizeIslandsColor(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');

    const max = this.island.length / this.config.size;
    const squareWidth = Math.floor(canvas.width / this.config.size);
    const squareHeight = Math.floor(canvas.height / this.config.size);

    for (let line = 0; line < max; line++) {
      for (let column = 0; column < max; column++) {
        if (this.getValueAt(line, column) !== AreaStatus.Sea && this.getIslandColor(line, column) !== this.config.color) {
          ctx.fillStyle = this.config.color;
          this.setIslandColor(line, column, this.config.color);
          ctx.fillRect(column * squareWidth, line * squareHeight, squareWidth, squareHeight);
        }
      }
    }
  }

  public onClick(x: number, y: number, width: number, height: number, context: CanvasRenderingContext2D) {
    const line = Math.floor(y / (height / this.config.size));
    const column = Math.floor(x / (width / this.config.size));

    const max = this.island.length / this.config.size;
    const squareWidth = Math.floor(width / this.config.size);
    const squareHeight = Math.floor(height / this.config.size);
    const actualColor = this.getIslandColor(line, column);

    const recursive = (row: number, col: number): void => {
      if ( // Stop Recursive if the conditions are true
        actualColor !== this.getIslandColor(row, col) ||
        this.getValueAt(row, col) === AreaStatus.Sea ||
        row < 0 || row >= max || col < 0 || col >= max // If statement for borders
      ) {
        return;
      }

      context.fillStyle = this.config.color;
      this.setIslandColor(row, col, this.config.color);

      context.fillRect(col * squareWidth, row * squareHeight, squareWidth, squareHeight);
      context.fillStyle = '#000';

      // Start recursive
      recursive(row - 1, col - 1); // Top Left
      recursive(row - 1, col); // Top Middle
      recursive(row - 1, col + 1); // Top Right
      recursive(row, col - 1); // Left
      recursive(row, col + 1); // Right
      recursive(row + 1, col - 1); // Bottom Left
      recursive(row + 1, col); // Bottom Middle
      recursive(row + 1, col + 1); // Bottom Right
    };

    // If statement for prevent unnecessary changes
    if (actualColor !== this.config.color && this.getValueAt(line, column) !== AreaStatus.Sea) {
      // Start changes
      recursive(line, column);
    }
  }

  public findIslands(): void {
    const max: number = this.island.length / this.config.size;
    let color: string = this.generateRandomColor();

    const recursive = (row: number, col: number): void => {
      if ( // Stop Recursive if the conditions are true
        this.getValueAt(row, col) !== AreaStatus.Land ||
        (row < 0 || row >= max || col < 0 || col >= max) // If statement for borders
      ) {
        return;
      }

      this.setIslandColor(row, col, color);
      this.setValueAt(row, col, AreaStatus.Discovered);

      recursive(row - 1, col - 1); // Top Left
      recursive(row - 1, col); // Top Middle
      recursive(row - 1, col + 1); // Top Right
      recursive(row, col - 1); // Left
      recursive(row, col + 1); // Right
      recursive(row + 1, col - 1); // Bottom Left
      recursive(row + 1, col); // Bottom Middle
      recursive(row + 1, col + 1); // Bottom Right
    };

    let acc = 0;
    for (let line = 0; line < max; line++) {
      for (let column = 0; column < max; column++) {

        if (this.getValueAt(line, column) === AreaStatus.Land) {
          acc++;
          recursive(line, column);
        } else {
          color = this.generateRandomColor();
        }

      }
    }
    this.numberOfIslands.next(acc);
  }

}
