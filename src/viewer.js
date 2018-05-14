/* Copyright (c) 2017, Art Compiler LLC */
/* @flow */
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "react";
import * as d3 from "d3";
window.gcexports.viewer = (() => {
  function capture(el) {
    return null;
  }
  function draw(data) {
    let title, values;
    if (!data.title && !data.values) {
      // Backward compat.
      title = "";
      values = data;
    } else {
      title = data.title;
      values = data.values;
    }
    let size = 0;
    values.forEach((v) => {
      size += +v.count;
    });
    if (size < +data.size) {
      values.push({
        name: "",
        count: data.size - size,
        color: "#DDD",
      });
    }
    let totalCount = 30;
    let width = 540,
    height = 540,
    radius = 200;
    let arc = d3.arc()
    	.outerRadius(radius - 10)
    	.innerRadius(100);
    let pie = d3.pie()
      .sort(null)
      .value((d) => {
	return d.count;
      });
    let svg = d3.select('#chart').append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr('font-size', '2em')
      .attr("dy", ".50em")
      .text(data.title);
    let g = svg.selectAll(".arc")
      .data(pie(values))
      .enter().append("g");
    g.append("path")
      .attr("d", arc)
      .style("fill", (d,i) => {
      	return d.data.color;
      });
    g.append("text")
      .attr("transform", (d) => {
        let _d = arc.centroid(d);
        _d[0] *= 1.5;	//multiply by a constant factor
        _d[1] *= 1.5;	//multiply by a constant factor
        return "translate(" + _d + ")";
      })
      .attr("alignment-baseline", (d) => {
        let _d = arc.centroid(d);
        return _d[1] < 0 ? "baseline" : "hanging";
      })
      .attr("dy", ".50em")
      .style("text-anchor", (d) => {
        let _d = arc.centroid(d);
        return _d[0] < 0 ? "end" : "start";
      })
      .text((d) => {
        return d.data.name;
      });
    g.append("text")
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.name ? d.data.count + data.unit : ""; });
    g.selectAll("text")
      .call(wrap, 30);
  }

  function wrap(text, width) {
    text.each(function() {
      var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 0.5, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }

  // Graffiticode looks for this React class named Viewer. The compiled code is
  // passed via props in the renderer.
  let Viewer = React.createClass({
    componentDidMount: function() {
      draw(this.props.data);
    },
    render: function () {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      let data = this.props.obj.data;
      return (
        <div>
          <link rel="stylesheet" href="https://l116.artcompiler.com/style.css" />
          <div className="L126 viewer">
          <div id="chart" className="chart-container" data={data} />
          </div>
        </div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

