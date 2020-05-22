# Plot.js

`Plot.js`: Simple and small (47kb minified) library which can *plot graphs of functions and various simple charts* and can render to **Canvas**, **SVG** and **plain HTML**

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
