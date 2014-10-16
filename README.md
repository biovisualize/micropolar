<img src="https://raw.github.com/biovisualize/micropolar/gh-pages/micropolar_black.png" width="250"/><br />

#micropolar
A tiny polar charts library made with D3.js. See it in action [here](http://micropolar.org/).

##Usage
Download and use it. Current version is 0.1.1, so the API is still moving. Use at your own risk until the v1.0.0 release:

```
	<script type='text/javascript' src="./micropolar.js"></script>

```

You can use the presets that will provide defaults for everything:

```
	micropolar.preset.linePlot();

```

Or you can pass a config object to the presets:

```
	micropolar.preset.dotPlot({
		data: [[60, 5], [180, 2], [270, 3], [360, 4]], 
		containerSelector: '.container',
		size: 300
	});
```

Or build your own chart with full control. Just look at the presets and the examples for how to do it:

```
	var polarPlot = micropolar.DotPlot();
    var config = {
        geometry: polarPlot,
        data: [[0, 500], [1, 1000], [3, 2000]],
        height: 250, 
        width: 250, 
        angularDomain: [0, 2000],
        angularTicksStep: 400,
        minorTicks: 1,
        flip: false,
        originTheta: 0,
        radialAxisTheta: -15,
        containerSelector: 'body'
    };
    var polarAxis = micropolar.Axis().config(config);
    polarAxis();
```

Every chart is composed of a very configurable axis and one or more geometry modules. The current chart types are linePlot, dotPlot, barChart, areaChart and clock. 

##Roadmap
* <s>Minified version</s>
* <s>Multiple geometry per axis</s>
* Titles, legends
* Stabilize the API
* Live examples
* Test suite
* API Documentation
* More chart types (circular heatmap, radar chart, radviz)
