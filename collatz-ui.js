$(function() {
  var timer = null,
      level = 0,
      min = 1,
      max = 18,
      speed = 1,
      duration = 1000,
      r = 720 / 2,
      collatz = reverseCollatz(r, max);

  var vis = d3.select("#vis")
    .append("svg")
      .attr("width", r * 4)
      .attr("height", r * 4)
    .append("g")
      .attr("transform", "translate(" + r + "," + r + ")");

  var normal = { dark: '#fa750d', light: '#ffe48a' }; 
  var error = { dark: '#d85133', light: '#fa750d'};
  var errorMode = false;

  $('#error').change(function(e){
    errorMode = e.target.checked;
    colorize(errorMode);
    animate();
  })

  function plotLevel(duration) {
      $('#level').slider({value: level});
      $('#level-val').text(level);
      vis.call(collatz(level, duration, errorMode));
      colorize(errorMode);
  }

  function colorize(errorMode) {
    var o = errorMode ? error : normal;
    var nodes = d3.selectAll(".node");
    nodes.selectAll('text').style("fill", o.dark);
    nodes.selectAll('circle').style("fill", o.dark);
    nodes.selectAll('circle').style("stroke", o.light);
    d3.selectAll('.link').selectAll("line").style("stroke", o.light);
  }

  $('#level').slider({
    value: level, min: 1, max: max, slide: function(e, ui) {
      level = ui.value;
      colorize(errorMode);
      plotLevel(1000);
    }
  });

  function normalAnimation() {
      if (level > max || level < min) speed = -speed;
      if (level > max) level = max;
      if (level < min) level = min;
      level += speed;
      plotLevel(1000);
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

    console.log(from,to);
    var next = rand(from,to);
//    console.log(min,max, next);

    level = next;

    plotLevel(0);
  }

  function animate() {
    if (timer) clearInterval(timer);
    if (errorMode) startError();
    else startNormal();
    $(this).hide();
    $('#stop').show();
  }

  function startNormal() {
    timer = setInterval(normalAnimation, duration);
    normalAnimation();
  }

  function startError() {
    timer = setTimeout(startError, Math.random()*200); 
    errorAnimation();
  }

  $('#play').click(animate);

  $('#stop').click(function() {
    if (timer) clearInterval(timer);
    $(this).hide();
    $('#play').show();
  });
});
