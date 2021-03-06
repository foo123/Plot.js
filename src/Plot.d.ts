declare class Plot {
    constructor(renderer: any, opts: any);
    boundingBox(points: any): any;
    chart(type: any, data: any, opts: any): any;
    clear(): any;
    defaultOpts(): any;
    dispose(): any;
    ellipse(center: any, radius: any, rotation: any, opts: any, ...args: any[]): any;
    graph(f: any, x0: any, x1: any, opts: any): any;
    height(): any;
    label(pos: any, size: any, text: any, opts: any): any;
    line(points: any, opts: any): any;
    point(points: any, opts: any): any;
    rectangle(center: any, side: any, rotation: any, opts: any, ...args: any[]): any;
    resize(): any;
    sample(f: any, x0: any, x1: any, opts: any): any;
    sector(center: any, radius: any, startAngle: any, endAngle: any, opts: any, ...args: any[]): any;
    text(pos: any, text: any, opts: any): any;
    width(): any;
    static VERSION: string;
}

declare namespace Plot {
    class Matrix {
        constructor(v: any);
        dispose(): any;
        eq(other: any): any;
        mul(other: any): any;
        rotate(theta: any): any;
        scale(sx: any, sy: any, ...args: any[]): any;
        skew(sx: any, sy: any): any;
        transform(point: any): any;
        translate(tx: any, ty: any): any;
    }
    class Point {
        constructor(x: any, y: any);
        apply(fx: any, fy: any): any;
        dispose(): any;
        dist(p1: any, p2: any): any;
        eq(other: any, eps: any, ...args: any[]): any;
        static isFinite(pt: any): any;
    }
    class Renderer {
        constructor(container: any, opts: any);
        background(): void;
        clear(): void;
        defaultOpts(): any;
        dispose(): any;
        drawEllipse(): void;
        drawLabel(): void;
        drawLine(): void;
        drawPoint(): void;
        drawRect(): void;
        drawSector(): void;
        drawText(): void;
        height(): any;
        init(): void;
        objAt(): void;
        resize(): any;
        width(): any;
        static handler(evt: any): void;
    }
    namespace Renderer {
        class Canvas {
            constructor(container: any, opts: any);
            background(background: any): any;
            clear(): any;
            createText(str: any, textSize: any, textColor: any, maxWidth: any, lineHeight: any): any;
            dispose(): any;
            drawEllipse(center: any, radius: any, rotation: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawLabel(pos: any, size: any, txt: any, opts: any): any;
            drawLine(p1: any, p2: any, lineSize: any, lineColor: any, lineStyle: any, extra: any): any;
            drawPoint(p: any, pointSize: any, pointColor: any, extra: any): any;
            drawRect(center: any, side: any, rotation: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawSector(center: any, radius: any, a0: any, a1: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawText(p: any, txt: any, textSize: any, textColor: any, maxWidth: any): any;
            fitText(text: any, metricCtx: any, maxWidth: any, lineHeight: any): any;
            init(): any;
            objAt(evt: any, pos: any): any;
            resize(): any;
        }
        class Html {
            constructor(container: any, opts: any);
            background(background: any): any;
            clear(): any;
            createText(str: any, textSize: any, textColor: any, maxWidth: any, lineHeight: any): any;
            drawEllipse(center: any, radius: any, rotation: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawLabel(pos: any, size: any, txt: any, opts: any): any;
            drawLine(p1: any, p2: any, lineSize: any, lineColor: any, lineStyle: any, extra: any): any;
            drawPoint(p: any, pointSize: any, pointColor: any, extra: any): any;
            drawRect(center: any, side: any, rotation: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawSector(center: any, radius: any, a0: any, a1: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawText(p: any, txt: any, textSize: any, textColor: any, maxWidth: any): any;
            fitText(text: any, metricObj: any, maxWidth: any, lineHeight: any): any;
            init(): any;
            objAt(evt: any, pos: any): any;
        }
        class Svg {
            constructor(container: any, opts: any);
            background(background: any): any;
            clear(): any;
            createText(str: any, textSize: any, textColor: any, maxWidth: any, lineHeight: any): any;
            drawEllipse(center: any, radius: any, rotation: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawLabel(pos: any, size: any, txt: any, opts: any): any;
            drawLine(p1: any, p2: any, lineSize: any, lineColor: any, lineStyle: any, extra: any): any;
            drawPoint(p: any, pointSize: any, pointColor: any, extra: any): any;
            drawRect(center: any, side: any, rotation: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawSector(center: any, radius: any, a0: any, a1: any, lineSize: any, lineColor: any, lineStyle: any, fill: any, extra: any): any;
            drawText(p: any, txt: any, textSize: any, textColor: any, maxWidth: any): any;
            fitText(text: any, metricObj: any, maxWidth: any, lineHeight: any): any;
            init(): any;
            objAt(evt: any, pos: any): any;
            resize(): any;
        }
    }
    namespace Util {
        function clone(o: any): any;
        function debounce(fn: any, delay: any, ...args: any[]): any;
        function extend(...args: any[]): any;
        function hex2rgb(hex: any): any;
        function hsb2rgb(hsb: any): any;
        function palette(n: any, format: any): any;
        function rgb2hex(rgb: any): any;
        function rgb2hsb(rgb: any): any;
        function subdivide(f: any, l: any, r: any, tolerance: any, depth: any, pl: any, pr: any): any;
    }
}
