$(function() {

  var RiftGraphParams = function() {
    this.stopped = true;
    this.mode = 0;
    this.BPM = 60;
    this.spanFrom = 100;
    this.spanTo = 200;
  };


  var params = window.params =  new RiftGraphParams();
  var gui = new dat.GUI();
  var stopped = gui.add(params, 'stopped');
  var mode = gui.add(params,'mode', {'Normal':0, 'Error':1});

  var normalModeFolder = gui.addFolder("Normal Mode");
  var BPM = normalModeFolder.add(params, 'BPM', 0, 140);
  var errorModeFolder = gui.addFolder("Error Mode");
  var spanFrom = errorModeFolder.add(params, 'spanFrom', 0, 1000);
  var spanTo = errorModeFolder.add(params, 'spanTo', 0, 1000);

  normalModeFolder.open();
  errorModeFolder.open();

  var timer = null,
      level = 0,
      min = 1,
      max = 18,
      speed = 1,
      d = 720,
      collatz = reverseCollatz(d/2, max);

  var vis = d3.select("#vis")
    .append("svg")
      .attr("width", d * 2)
      .attr("height", d * 2)
    .append("g")
      .attr("transform", "translate(" + d/2 + "," + d/2 + ")");

  var colors = [{ dark: '#fa750d', light: '#ffe48a' },{ dark: '#d85133', light: '#fa750d'}];

  function plotLevel(d) {
      vis.call(collatz(level, d, [false,true][params.mode]));
      colorize();
  }

  function colorize() {
    var o = colors[params.mode];
    var nodes = d3.selectAll(".node");
    nodes.selectAll('text').style("fill", o.dark);
    nodes.selectAll('circle').style("fill", o.dark);
    nodes.selectAll('circle').style("stroke", o.light);
    d3.selectAll('.link').selectAll("line").style("stroke", o.light);
  }

  function normalAnimation() {
      if (level > max || level < min) speed = -speed;
      if (level > max) level = max;
      if (level < min) level = min;
      level += speed;
      plotLevel(60000/params.BPM);
  }

  function rand(from,to) {
    return Math.round(Math.random()*(to - from))+from;
  }

  function errorAnimation() {
    // 1. + || -
    // 2. level + 2 > max -
    var dir = Math.random() > .5 ? 1 : -1;

    var from = level + 2 * dir;

    if (from > max || from < min) {
      dir = -dir;
      from = level + 2 * dir;
    };

    var to = dir > 0 ? max : min;

    var next = rand(from,to);
//    console.log(min,max, next);

    level = next;

    plotLevel(0);
  }

  function animate() {
    console.log("!")
    if (timer) {
      if (params.mode) clearTimeout(timer);
      else clearInterval(timer);
    }
    [startNormal, startError][params.mode]();
  }

  function startNormal() {
    timer = setInterval(normalAnimation, 60000/params.BPM);
    normalAnimation();
  }

  function startError() {
    var span = params.spanTo - params.spanFrom
    timer = setTimeout(startError, Math.random()*span + params.spanFrom); 
    errorAnimation();
  }

  mode.onChange(function(v){ 
    colorize();
    if (!params.stopped) animate();
  });

  stopped.onChange(function(v) {
    playing = !v;
    if (v) {
      if (timer) {
        if (params.mode) clearTimeout(timer);
        else clearInterval(timer);
      }
    } else animate();
  })

  BPM.onChange(function(v){
    if (!params.mode && !params.stopped) animate(); 
  })

  spanFrom.onChange(function(v) {
      if (v > params.spanTo) spanTo.setValue(v);
  });

  spanTo.onChange(function(v){
      if (v < params.spanFrom) spanFrom.setValue(v);
  });


});
