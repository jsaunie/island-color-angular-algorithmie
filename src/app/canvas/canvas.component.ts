import {Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {CanvasService, ConfigInterface} from '../test/colorfulIslands/canvas.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, OnDestroy {
  private timeGeneration$: Subscription;
  private numberOfIslands$: Subscription;
  public timeGeneration = 0;
  public numberOfIslands = 0;
  public config: ConfigInterface;

  @ViewChild('canvasElement') public canvasEl: ElementRef;

  constructor(private renderer: Renderer2, protected canvasService: CanvasService) {
  }

  public ngOnInit() {
    this.canvasService
      .generate()
      .resetNumberOfIslands()
      .exeFuncAndAnalysePerformance(this.canvasService.findIslands);

    this.timeGeneration$ = this.canvasService.timeGeneration.subscribe((time: number) => this.timeGeneration = time);
    this.numberOfIslands$ = this.canvasService.numberOfIslands.subscribe((n: number) => this.numberOfIslands = n);

    this.attachEventListeners();
    this.render();
  }

  /**
   * render the island into the canvas Element
   */
  private render(): void {
    const canvas = this.canvasEl.nativeElement;
    canvas.width = this.canvasService.config.width;
    canvas.height = this.canvasService.config.height;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    const squareWidth = Math.floor(canvas.width / this.canvasService.config.size);
    const squareHeight = Math.floor(canvas.height / this.canvasService.config.size);

    for (let row = 0; row < this.canvasService.config.size; row++) {
      for (let col = 0; col < this.canvasService.config.size; col++) {
        ctx.fillStyle = this.canvasService.getIslandColor(row, col);
        ctx.fillRect(col * squareWidth, row * squareHeight, squareWidth, squareHeight);
        ctx.fillStyle = '#000';
      }
    }
  }

  public reRender(): void {
    this.canvasService
      .generate()
      .exeFuncAndAnalysePerformance(this.canvasService.findIslands);

    this.render();
  }

  public standardizeIslandsColor(): void {
    const canvas: HTMLCanvasElement = this.canvasEl.nativeElement;
    this.canvasService.exeFuncAndAnalysePerformance(this.canvasService.standardizeIslandsColor, [canvas]);
  }

  private attachEventListeners() {
    const canvas: HTMLCanvasElement = this.canvasEl.nativeElement;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    this.renderer.listen(canvas, 'click', (event) => {
      this.canvasService.exeFuncAndAnalysePerformance(
        this.canvasService.onClick,
        [event.offsetX, event.offsetY, canvas.width, canvas.height, ctx]
      );
    });
  }

  ngOnDestroy() {
    this.timeGeneration$.unsubscribe();
    this.numberOfIslands$.unsubscribe();
  }

}
