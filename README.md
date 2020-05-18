# Plot.js

`Plot.js`: Simple and small (45 Kb minified) *shape sketching* and *chart / functional graph plotting* library which can render to **Canvas**, **SVG** and **plain HTML**


[![Plot.js function graph](/screenshot.png)](https://foo123.github.io/examples/plot/graphs.html)

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


[![Plot.js bar chart](/bar-chart.png)](https://foo123.github.io/examples/plot/charts.html)


```javascript
let htmlPlot = Plot(Plot.Renderer.Html(document.getElementById('container-html')), {
background: {
        color: '#ffffff'
    },
    line: {
        size: 1,
        color: '#ff0000'
    },
    text:{
        size: 14
    },
    label:{
        padding:{
            top: 20,
            right: 10,
            bottom: 20,
            left: 10
        }
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

htmlPlot
    .chart('vbar', data, {colors:colors, labels:labels})
    .label({x:'right',y:'top'},{x:200,y:'auto'}, text, {label:{fill:'rgba(255,255,255,0.7)'}})
;
```


[![Plot.js shapes](/shapes.png)](https://foo123.github.io/examples/plot/shapes.html)
