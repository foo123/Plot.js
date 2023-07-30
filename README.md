# Plot.js

**Plot.js**: simple chart and function graph plotting library which can render to **Canvas**, **SVG** or **plain HTML**

**46 kB minified**


![Plot.js](/plot.jpg)


[![Plot.js function graph](/function-graph.png)](https://foo123.github.io/examples/plot/)

```javascript
let canvasPlot = Plot(Plot.Renderer.Canvas(document.getElementById('container-canvas')), {
    background: {
        color: '#ffffff'
    },
    line:{
        size: 3,
        color: '#ff0000'
    },
    axes: {
        x: {
            color: '#000000',
            ticks: {color: 'rgba(0,0,0,0.5)', step: 0.5}
        },
        y: {
            color: '#000000',
            ticks: {color: 'rgba(0,0,0,0.5)', step: 0.5}
        }
    }
});

canvasPlot
    .graph((x)=>Math.sin(4*x)/x, -3, 3)
    .label({x:'right',y:'top'},{x:'auto',y:'auto'}, 'f(x) = sin(4*x)/x', {label:{border:{size:0},fill:'rgba(255,255,255,0.7)',text:{size:20}}})
;
```


[![Plot.js bar chart](/bar-chart.png)](https://foo123.github.io/examples/plot/)


```javascript
let htmlPlot = Plot(Plot.Renderer.Html(document.getElementById('container-html')), {
background: {
        color: '#ffffff'
    },
    axes: {
            x: {
                color: '#000000',
                ticks: {color: 'rgba(0,0,0,0.2)', step: 10}
            },
            y: {
                color: '#000000',
                ticks: {color: 'rgba(0,0,0,0.2)', step: 10}
            }
        }
});

htmlPlot.chart('vbar', data, {colors:colors, labels:labels});
```

[![Plot.js pie chart](/pie-chart.png)](https://foo123.github.io/examples/plot/)


```javascript
let svgPlot = Plot(Plot.Renderer.Svg(document.getElementById('container-svg')), {
background: {
        color: '#ffffff'
    }
});

svgPlot.chart('pie', data, {colors:colors, labels:labels});
```
**see also:**

* [Abacus](https://github.com/foo123/Abacus) advanced Combinatorics and Algebraic Number Theory Symbolic Computation library for JavaScript, Python
* [MOD3](https://github.com/foo123/MOD3) 3D Modifier Library in JavaScript
* [Geometrize](https://github.com/foo123/Geometrize) Computational Geometry and Rendering Library for JavaScript
* [Plot.js](https://github.com/foo123/Plot.js) simple and small library which can plot graphs of functions and various simple charts and can render to Canvas, SVG and plain HTML
* [HAAR.js](https://github.com/foo123/HAAR.js) image feature detection based on Haar Cascades in JavaScript (Viola-Jones-Lienhart et al Algorithm)
* [HAARPHP](https://github.com/foo123/HAARPHP) image feature detection based on Haar Cascades in PHP (Viola-Jones-Lienhart et al Algorithm)
* [FILTER.js](https://github.com/foo123/FILTER.js) video and image processing and computer vision Library in pure JavaScript (browser and node)
* [Xpresion](https://github.com/foo123/Xpresion) a simple and flexible eXpression parser engine (with custom functions and variables support), based on [GrammarTemplate](https://github.com/foo123/GrammarTemplate), for PHP, JavaScript, Python
* [Regex Analyzer/Composer](https://github.com/foo123/RegexAnalyzer) Regular Expression Analyzer and Composer for PHP, JavaScript, Python
* [GrammarTemplate](https://github.com/foo123/GrammarTemplate) grammar-based templating for PHP, JavaScript, Python
* [codemirror-grammar](https://github.com/foo123/codemirror-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for CodeMirror editor
* [ace-grammar](https://github.com/foo123/ace-grammar) transform a formal grammar in JSON format into a syntax-highlight parser for ACE editor
* [prism-grammar](https://github.com/foo123/prism-grammar) transform a formal grammar in JSON format into a syntax-highlighter for Prism code highlighter
* [highlightjs-grammar](https://github.com/foo123/highlightjs-grammar) transform a formal grammar in JSON format into a syntax-highlight mode for Highlight.js code highlighter
* [syntaxhighlighter-grammar](https://github.com/foo123/syntaxhighlighter-grammar) transform a formal grammar in JSON format to a highlight brush for SyntaxHighlighter code highlighter
* [SortingAlgorithms](https://github.com/foo123/SortingAlgorithms) implementations of Sorting Algorithms in JavaScript
* [PatternMatchingAlgorithms](https://github.com/foo123/PatternMatchingAlgorithms) implementations of Pattern Matching Algorithms in JavaScript
* [CanvasLite](https://github.com/foo123/CanvasLite) an html canvas implementation in pure JavaScript
* [Rasterizer](https://github.com/foo123/Rasterizer) stroke and fill lines, rectangles, curves and paths, without canvaσ
* [Gradient](https://github.com/foo123/Gradient) create linear, radial, conic and elliptic gradients and image patterns without canvas
* [css-color](https://github.com/foo123/css-color) simple class to parse and manipulate colors in various formats
