<img src="https://raw.github.com/biovisualize/micropolar/gh-pages/micropolar_black.png" width="250"/><br />

#micropolar
A tiny polar charts library made with D3.js. See it in action [here](http://micropolar.org/).

##Usage
Download it or link to it:

```html
<script type='text/javascript' src="http://micropolar.org/micropolar.js"></script>
```

You can use the factory function that will provide defaults for everything:

```js
micropolar.factory.linePlot();
```
Or you can pass a config object:

```js
micropolar.factory.dotPlot({
	data: [[60, 5], [180, 2], [270, 3], [360, 4]], 
	containerSelector: '.container',
	size: 300
});
```
Every chart is composed of a very configurable axis and a geometry module. The current chart types are linePlot, dotPlot, barChart, areaChart and clock. You can easily extend micropolar with new chart types, or gain full control over every parameters, by looking at these factory implementations. 

##Roadmap
* Live examples
* Test suite
* Minified version
* API Documentation
* More chart types (circular heatmap, radar chart, radviz)
