all:
	uglifyjs axis.js util.js poly_chart.js bar_chart.js area_chart.js dot_plot.js line_plot.js legend.js tooltip.js adapter.js -b -o micropolar.js
	uglifyjs axis.js util.js poly_chart.js bar_chart.js area_chart.js dot_plot.js line_plot.js legend.js tooltip.js adapter.js -o micropolar.min.js -c -m
	cp micropolar.js ../micropolar-v0.2.2.js
	cp micropolar.min.js ../micropolar-v0.2.2.min.js
