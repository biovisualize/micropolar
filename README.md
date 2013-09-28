<img src="https://raw.github.com/biovisualize/micropolar/gh-pages/micropolar_black.png" width="250"/><br />

#micropolar
A tiny polar charts library made with D3.js. See it in action [here](http://micropolar.org/).

##Usage
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
The current chart types are linePlot, dotPlot, barChart, areaChart and clock. You can easily extend micropolar with new chart types, or gain full control over every parameters, by looking at the factory implementations. Every chart is composed of very configurable axis composed with a geometry module.

```js
 var config = {
 	data:[[60, 5], [180, 2], [270, 3], [360, 4]],
    height: 250, width: 250, 
    angularDomain: [0, 1000, 50], 
    flip: false,
    originTheta: 0,
    radialAxisTheta: 0,
    minorTicks: 1,
    containerSelector: 'body'
 };

var radialAxis = micropolar.chart.RadialAxis().config(config);

var radialDotPlot = micropolar.chart.RadialDotPlot()
	.config({
		axis: radialAxis, 
		containerSelector: config.containerSelector, 
		dotRadius: 3
	});
radialDotPlot(config.data);
```

##Roadmap
* More examples
* Test suite
* Documentation
* More chart types (circular heatmap, radar chart, radviz)
