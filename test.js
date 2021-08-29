// 55
Math.randomSeed(13);

var BOX_X = 15;
var BOX_Y = 22;
var anim_dur = "0.5s";
var font_family = "avenir, sans-serif";

var FOREGROUNDS = {
  m: "#C8C8C8", // AE
  0: "#F15E5E",
  1: "#0167FF",
  2: "#24B04B",
  3: "#B04BB0",
};

var BACKGROUNDS = {
  m: "#F5F5F580", // EF
  0: "#FFEFEBA0",
  1: "#C5E8FFA0",
  2: "#CAE9CFA0",
  3: "#E9CFE9A0",
};

var top_grid = document.createElement("div");
document.body.append(top_grid);
top_grid.style.display = "grid";
top_grid.style["grid-template-columns"] = "auto auto";
var left = document.createElement("div");
top_grid.append(left);
var right = document.createElement("div");
top_grid.append(right);
var visdiv;

function create_line(x1, y1, x2, y2, stroke, dasharray) {
  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.style["stroke-width"] = 1;
  line.setAttribute("stroke", stroke);
  if (dasharray) line.setAttribute("stroke-dasharray", dasharray);
  return line;
}

function create_rect(x, y, w, h, stroke) {
  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", w);
  rect.setAttribute("height", h);
  rect.style["stroke-width"] = 1;
  rect.style.stroke = stroke;
  rect.style.fill = "#FFFFFF80";
  return rect;
}

function create_char(x, y, text, fill, bold) {
  var char = document.createElementNS("http://www.w3.org/2000/svg", "text");
  char.style.fill = fill;
  char.style.fontSize = (BOX_Y / 30) * 19;
  char.style.fontFamily = font_family;
  if (bold) char.style.fontWeight = "bold";
  char.setAttribute("x", x);
  char.setAttribute("y", y);
  char.setAttribute("text-anchor", "middle");
  char.setAttribute("alignment-baseline", "alphabetic");
  char.appendChild(document.createTextNode(text));
  return char;
}

function anim(attr, from, to, dur) {
  var anim = document.createElementNS("http://www.w3.org/2000/svg", "animate");
  anim.setAttribute("attributeType", "XML");
  anim.setAttribute("attributeName", attr);
  anim.setAttribute("from", from);
  anim.setAttribute("to", to);
  anim.setAttribute("dur", dur);
  return anim;
}

var space_dag_div = null;
function update_space_dag(merge_info) {
  if (!space_dag_div || !braidvis.contains(space_dag_div)) {
    space_dag_div = document.createElement("div");
    space_dag_div.style.marginTop = 30;
    braidvis.append(space_dag_div);
  }

  space_dag_div.innerHTML = "";
  svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  space_dag_div.append(svg);
  svg.setAttribute("width", 1000);
  svg.setAttribute("height", BOX_Y * 3);

  var size = BOX_Y;

  svg.append(create_line(size + 0.5, size, size + 0.5, size * 2, "black"));
  svg.append(
    create_line(size, size * 1.5 + 0.5, size * 2, size * 1.5 + 0.5, "black")
  );

  function draw_char_box(x, y, char, deleted) {
    svg.append(
      create_char(
        x + size / 2,
        y + size * 0.75,
        char,
        deleted ? FOREGROUNDS.m : "black",
        false
      )
    );
  }

  function draw_char_boxes(x, y, text, deleted) {
    svg.append(create_rect(x, y, size * text.length, size, "black"));
    for (var i = 0; i < text.length; i++) {
      draw_char_box(x + i * size, y, text[i], deleted);
    }
  }

  var next_top_x = size * 2;
  var next_bottom_x = size * 2;
  var last_top_was_middle = true;
  var last_bottom_was_middle = true;
  var very_first = true;

  var on_a = true;
  var ai = 0;
  var bi = 0;
  var a_text = merge_info.a_text;
  var b_text = merge_info.b_text;
  var a_regions = merge_info.a_regions;
  var b_regions = merge_info.b_regions;
  var max_x = 0;
  function draw_t(r, t, deleted, middle) {
    if (middle) {
      var x = Math.max(next_top_x, next_bottom_x);
      if (!last_top_was_middle) {
        if (next_top_x < x)
          svg.append(
            create_line(next_top_x, size * 0.75, x, size * 0.75, "black")
          );
        svg.append(
          create_line(
            x,
            size * 0.75,
            x + size / 2 + 0.5,
            size * 1.5 + 0.5,
            "black"
          )
        );
      }
      if (!last_bottom_was_middle) {
        if (next_bottom_x < x)
          svg.append(
            create_line(next_bottom_x, size * 2.25, x, size * 2.25, "black")
          );
        svg.append(
          create_line(
            x,
            size * 2.25,
            x + size / 2 + 0.5,
            size * 1.5 + 0.5,
            "black"
          )
        );
      }
      if (!last_top_was_middle || !last_bottom_was_middle) x += size / 2;
      if (last_top_was_middle && last_bottom_was_middle && t && !very_first) {
        svg.append(
          create_line(
            x,
            size * 1.5 + 0.5,
            x + size / 2 + 0.5,
            size * 1.5 + 0.5,
            "black"
          )
        );
        x += size / 2;
      }

      if (t == "") {
        svg.append(
          create_line(x, size * 1.5 + 0.5, x + size, size * 1.5 + 0.5, "black")
        );
        svg.append(
          create_line(x + size + 0.5, size, x + size + 0.5, size * 2, "black")
        );
        max_x = x + size + 0.5;
      } else {
        draw_char_boxes(x + 0.5, size + 0.5, t, deleted);
      }
      next_top_x = next_bottom_x = x + t.length * size;
      last_top_was_middle = true;
      last_bottom_was_middle = true;
    } else if (on_a) {
      var x = next_top_x;
      if (last_top_was_middle) {
        svg.append(
          create_line(
            next_top_x,
            size * 1.5 + 0.5,
            x + size / 2 + 0.5,
            size * 0.75,
            "black"
          )
        );
      } else {
        if (r[5] >= 0 && b_regions[r[5]][6] && b_regions[r[5]][6] > x)
          x = b_regions[r[5]][6];
        svg.append(
          create_line(
            next_top_x,
            size * 0.75,
            x + size / 2 + 0.5,
            size * 0.75,
            "black"
          )
        );
        if (r[5] >= 0 && b_regions[r[5]][6]) {
          svg.append(
            create_line(
              b_regions[r[5]][6],
              size * 2.25,
              x + size / 2 + 0.5,
              size * 0.75,
              "black"
            )
          );
        }
      }
      draw_char_boxes(x + size / 2 + 0.5, size * 0.25, t, deleted);
      next_top_x = x + size / 2 + t.length * size;
      r[6] = next_top_x;
      last_top_was_middle = false;
    } else {
      var x = next_bottom_x;
      if (last_bottom_was_middle) {
        svg.append(
          create_line(
            next_bottom_x,
            size * 1.5 + 0.5,
            x + size / 2 + 0.5,
            size * 2.25,
            "black"
          )
        );
      } else {
        if (r[5] >= 0 && a_regions[r[5]][6] && a_regions[r[5]][6] > x)
          x = a_regions[r[5]][6];
        svg.append(
          create_line(
            next_bottom_x,
            size * 2.25,
            x + size / 2 + 0.5,
            size * 2.25,
            "black"
          )
        );
        if (r[5] >= 0 && a_regions[r[5]][6]) {
          svg.append(
            create_line(
              a_regions[r[5]][6],
              size * 0.75,
              x + size / 2 + 0.5,
              size * 2.25,
              "black"
            )
          );
        }
      }
      draw_char_boxes(x + size / 2 + 0.5, size * 1.75, t, deleted);
      next_bottom_x = x + size / 2 + t.length * size;
      r[6] = next_bottom_x;
      last_bottom_was_middle = false;
    }
    very_first = false;
  }

  while (true) {
    var aa = a_regions[ai];
    var bb = b_regions[bi];
    if (!aa && !bb) break;
    if (!aa) on_a = false;
    if (!bb) on_a = true;

    var ci = on_a ? ai : bi;
    var di = on_a ? bi : ai;
    var cc = on_a ? aa : bb;
    var dd = on_a ? bb : aa;
    var c_text = on_a ? a_text : b_text;
    var d_text = on_a ? b_text : a_text;

    if (cc[5] < di) {
      var t = c_text.substr(cc[0], cc[1]);
      if (cc[2]) {
        if (cc[3] < di) {
          draw_t(cc, t, true);
        } else if (cc[3] == di) {
          draw_t(cc, t, false, true);
          if (on_a) {
            bi++;
          } else {
            ai++;
          }
        } else {
          draw_t(cc, t);
        }
      } else {
        draw_t(cc, t);
      }
      if (on_a) {
        ai++;
      } else {
        bi++;
      }
    } else if (dd && dd[5] < ci) {
      on_a = !on_a;
    } else {
      throw "failure";
    }
  }
  draw_t(null, "", false, true);
  max_x += size;
  svg.setAttribute("width", max_x);
  var W = fancy_dag_svg.my_width;
  var w = max_x;
  svg.style.marginLeft = (W - w) / 2 + "px";
  svg.style.marginRight = -w + "px";
}

// work here
var old_info = {};

function sync7_create_simple_dag(s7) {
  var selected = {};

  var d = document.createElement("div");

  var header = document.createElement("div");
  header.textContent = "Time DAG";
  header.style.fontFamily = font_family;
  header.style.color = "#777";
  d.append(header);

  var svg_div = document.createElement("div");
  svg_div.style.cursor = "pointer";
  d.append(svg_div);

  // function get_arrow_offsets2(x1, y1, x2, y2) {
  //     var start = vec3.fromValues(x1, y1, 0)
  //     var end = vec3.fromValues(x2, y2, 0)
  //     var to_end = vec3.subtract(vec3.create(), end, start)
  //     var len = vec3.length(to_end)
  //     return vec3.scale(vec3.create(), to_end, 1.0 / len * (len - 21))
  // }
  function get_arrow_offsets(x1, y1, x2, y2) {
    var z = [x2 - x1, y2 - y1];
    var len = Math.sqrt(z[0] * z[0] + z[1] * z[1]);
    var scale = (1 / len) * (len - 21);
    return [scale * z[0], scale * z[1]];
  }

  function create_arrow(x1, y1, x2, y2, stroke, dasharray, uid) {
    var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var arrow = get_arrow_offsets(x1, y1, x2, y2);

    line.setAttribute("marker-end", "url(#marker_id_" + uid + ")");

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x1 + arrow[0]);
    line.setAttribute("y2", y1 + arrow[1]);
    line.style["stroke-width"] = 2;
    line.setAttribute("stroke", stroke);
    if (dasharray) line.setAttribute("stroke-dasharray", dasharray);
    return line;
  }

  function anim_arrow(
    _x1,
    _y1,
    _x2,
    _y2,
    x1,
    y1,
    x2,
    y2,
    stroke,
    dasharray,
    uid
  ) {
    var _arrow = get_arrow_offsets(_x1, _y1, _x2, _y2);
    var arrow = get_arrow_offsets(x1, y1, x2, y2);

    var line = create_arrow(_x1, _y1, _x2, _y2, stroke, dasharray, uid);

    line.append(anim("x1", _x1, x1, anim_dur));
    line.append(anim("y1", _y1, y1, anim_dur));
    line.append(anim("x2", _x1 + _arrow[0], x1 + arrow[0], anim_dur));
    line.append(anim("y2", _y1 + _arrow[1], y1 + arrow[1], anim_dur));

    setTimeout(() => {
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x1 + arrow[0]);
      line.setAttribute("y2", y1 + arrow[1]);
    });

    return line;
  }

  var svg = null;
  function redraw(firstTime) {
    if (svg) svg.remove();
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg_div.append(svg);
    svg.setAttribute("width", s7.width);
    svg.setAttribute("height", s7.height);

    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.append(defs);

    each(FOREGROUNDS, function (color, user) {
      var marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker"
      );
      marker.setAttribute("id", "marker_id_" + user);
      marker.setAttribute("orient", "auto");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "10");
      marker.setAttribute("refX", "0");
      marker.setAttribute("refY", "5");
      defs.append(marker);

      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M0,3 L5,5 L0,7 Z");
      path.setAttribute("fill", color);
      marker.append(path);
    });

    each(s7.versions, function (c, id) {
      var parents = Object.keys(c.to_parents).length;
      var merge_node = parents == 0 || parents > 1;
      var uid = merge_node ? "m" : c.uid;
      var foreground = FOREGROUNDS[uid];

      each(c.to_parents, function (d, pid) {
        var old = old_info[pid + "to" + id];
        if (firstTime && old) {
          svg.append(
            anim_arrow(
              old.x1,
              old.y1,
              old.x2,
              old.y2,
              s7.versions[pid].x || 0,
              s7.versions[pid].y || 0,
              c.x || 0,
              c.y || 0,
              foreground,
              null,
              uid
            )
          );
        } else if (firstTime && !old) {
          svg.append(
            anim_arrow(
              s7.versions[pid].x || 0,
              s7.versions[pid].y || 0,
              (s7.versions[pid].x || 0) + 1,
              (s7.versions[pid].y || 0) + 1,
              s7.versions[pid].x || 0,
              s7.versions[pid].y || 0,
              c.x || 0,
              c.y || 0,
              foreground,
              null,
              uid
            )
          );
        } else {
          svg.append(
            create_arrow(
              s7.versions[pid].x || 0,
              s7.versions[pid].y || 0,
              c.x || 0,
              c.y || 0,
              foreground,
              null,
              uid
            )
          );
        }
        old_info[pid + "to" + id] = {
          x1: s7.versions[pid].x || 0,
          y1: s7.versions[pid].y || 0,
          x2: c.x || 0,
          y2: c.y || 0,
        };
      });
    });

    each(s7.versions, function (c, id) {
      var parents = Object.keys(c.to_parents).length;
      var merge_node = parents == 0 || parents > 1;
      var uid = merge_node ? "m" : c.uid;
      var foreground = FOREGROUNDS[uid];

      var dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      dot.style.fill = foreground;
      var old = old_info[id];
      if (firstTime && old) {
        dot.setAttribute("cx", old.x);
        dot.setAttribute("cy", old.y);
        dot.append(anim("cx", old.x, c.x || 0, anim_dur));
        dot.append(anim("cy", old.y, c.y || 0, anim_dur));
        setTimeout(() => {
          dot.setAttribute("cx", c.x || 0);
          dot.setAttribute("cy", c.y || 0);
        }, 0);
        dot.setAttribute("r", BOX_Y / 2);
      } else {
        dot.setAttribute("cx", c.x || 0);
        dot.setAttribute("cy", c.y || 0);
        if (firstTime) {
          dot.setAttribute("r", 0);
          dot.append(anim("r", 0, BOX_Y / 2, anim_dur));
          setTimeout(() => {
            dot.setAttribute("r", BOX_Y / 2);
          }, 0);
        } else {
          dot.setAttribute("r", BOX_Y / 2);
        }
      }
      svg.append(dot);
      old_info[id] = {
        x: c.x,
        y: c.y,
      };

      var radius = BOX_Y / 2 + 4;
      each(s7.column_leaves, function (leaf, column) {
        if (id == leaf) {
          var halo = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          halo.style.fill = "#00000000";
          halo.style.strokeWidth = "2";
          halo.style.stroke = FOREGROUNDS[column];

          var old = old_info["halo" + column];
          if (firstTime && old) {
            halo.setAttribute("cx", old.x);
            halo.setAttribute("cy", old.y);
            halo.setAttribute("r", old.r);
            halo.append(anim("cx", old.x, c.x || 0, anim_dur));
            halo.append(anim("cy", old.y, c.y || 0, anim_dur));
            halo.append(anim("r", old.r, radius, anim_dur));
            var my_radius = radius;
            setTimeout(() => {
              halo.setAttribute("cx", c.x || 0);
              halo.setAttribute("cy", c.y || 0);
              halo.setAttribute("r", my_radius);
            }, 0);
          } else {
            halo.setAttribute("cx", c.x || 0);
            halo.setAttribute("cy", c.y || 0);
            halo.setAttribute("r", radius);
          }
          old_info["halo" + column] = {
            x: c.x || 0,
            y: c.y || 0,
            r: radius,
          };

          svg.append(halo);
          radius += 4;
        }
      });
    });

    header.style.marginLeft =
      (s7.width - measure_text(header.textContent)) / 2 + "px";
  }
  redraw(true);

  svg_div.onmousemove = function (e) {
    var pos = getRelPos(svg_div, e);

    each(s7.versions, function (v, id) {
      if (
        pos.x >= (v.x || 0) - 10 &&
        pos.x < (v.x || 0) + 10 &&
        pos.y >= (v.y || 0) - 10 &&
        pos.y < (v.y || 0) + 10
      ) {
        var version = s7.versions[id];
        if (version.merge_info) {
          selected = {};
          selected[id] = true;
          update_space_dag(version.merge_info);
          redraw();
          return false;
        }
      }
    });
  };

  svg_div.onmousedown = function (e) {
    e.preventDefault();
    var pos = getRelPos(svg_div, e);

    var grabbed = null;
    each(s7.versions, function (v, id) {
      if (
        pos.x >= (v.x || 0) - 10 &&
        pos.x < (v.x || 0) + 10 &&
        pos.y >= (v.y || 0) - 10 &&
        pos.y < (v.y || 0) + 10
      ) {
        grabbed = {
          id: id,
          hot_x: pos.x - (v.x || 0),
          hot_y: pos.y - (v.y || 0),
        };
        return false;
      }
    });
    redraw();

    var oldMove = document.onmousemove;
    document.onmousemove = function (e) {
      var pos = getRelPos(svg_div, e);
      if (grabbed) {
        s7.versions[grabbed.id].x = pos.x - grabbed.hot_x;
        s7.versions[grabbed.id].y = pos.y - grabbed.hot_y;
        redraw();
      }
    };

    var oldUp = document.onmouseup;
    document.onmouseup = function (e) {
      document.onmousemove = oldMove;
      document.onmouseup = oldUp;
    };
  };

  return d;
}

function measure_text(s, fontSize) {
  var d = document.createElement("div");
  d.style.position = "absolute";
  d.style.visibility = "hidden";
  d.style.height = "auto";
  d.style.width = "auto";
  d.style["white-space"] = "nowrap";

  if (fontSize) d.style.fontSize = fontSize;
  d.innerHTML = s.replace(/ /g, "&nbsp;");
  document.body.append(d);
  var x = d.offsetWidth;
  d.remove();
  return x;
}

var fancy_dag_svg;
function sync7_create_fancy_dag(s7) {
  var selected = {};

  var d = (braidvis = document.createElement("div"));

  var header = document.createElement("div");
  header.textContent = "Braid";
  header.style.fontFamily = font_family;
  header.style.color = "#777";
  d.append(header);

  var svg_div = document.createElement("div");
  svg_div.style.cursor = "pointer";
  d.append(svg_div);

  var header2 = document.createElement("div");
  header2.style.marginTop = "30px";
  header2.textContent = "Space DAG";
  header2.style.fontFamily = font_family;
  header2.style.color = "#777";
  d.append(header2);

  function calc_specials(id) {
    var specials = {};
    each(s7.versions[id].to_parents, function (d, p) {
      var offset = 0;
      each(d, function (d) {
        if (typeof d == "number") {
          offset += d;
        } else {
          for (var i = 0; i < d[0].length; i++) {
            specials[offset++] = true;
          }
        }
      });
    });
    return specials;
  }

  function create_char_boxes(
    x,
    y,
    text,
    selected,
    specials,
    merge_node,
    version
  ) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    if (selected) {
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.style.fill = "rgba(255, 255, 0, 0.5)";
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", text.length * BOX_X);
      rect.setAttribute("height", BOX_Y);
      g.append(rect);
    }

    g.append(
      create_line(
        x,
        Math.floor(y + BOX_Y) + 0.5,
        x + BOX_X * text.length,
        Math.floor(y + BOX_Y) + 0.5,
        FOREGROUNDS.m,
        "3"
      )
    );

    for (var i = 0; i < text.length; i++) {
      var uid = merge_node ? "m" : version.uid;
      var foreground = FOREGROUNDS[uid];
      g.append(
        create_char(
          Math.floor(x + i * BOX_X + BOX_X / 2),
          y + BOX_Y * 0.75,
          text[i],
          specials[i] ? foreground : FOREGROUNDS.m,
          specials[i] && !merge_node
        )
      );
    }
    return g;
  }

  function create_polygon(points, fill) {
    var poly = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    poly.style.fill = fill;

    var points_text = [];
    for (var i = 0; i < points.length; i++) {
      points_text.push((i == 0 ? "" : " ") + points[i][0]);
      points_text.push("," + points[i][1]);
    }
    poly.setAttribute("points", points_text.join(""));

    return poly;
  }

  function create_polyline(points, stroke) {
    var poly = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polyline"
    );

    poly.style.fill = "none";
    poly.style.stroke = stroke;
    poly.style["stroke-width"] = 1;

    var points_text = [];
    for (var i = 0; i < points.length; i++) {
      points_text.push((i == 0 ? "" : " ") + points[i][0]);
      points_text.push("," + points[i][1]);
    }
    poly.setAttribute("points", points_text.join(""));

    return poly;
  }

  function create_diff_lines(x1, y1, x2, y2, diff, merge_node, uid) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    for (var pass = 0; pass <= 1; pass++) {
      var child_offset = 0;
      var parent_offset = 0;
      each(diff, function (d) {
        var points = [];
        points.push([x1 + child_offset + 0.5, y1 + BOX_Y]);
        points.push([x1 + child_offset + 0.5, y1]);
        points.push([x2 + parent_offset + 0.5, y2 + BOX_Y]);
        if (typeof d == "number") {
          child_offset += d * BOX_X;
          parent_offset += d * BOX_X;
        } else {
          child_offset += d[0].length * BOX_X;
          parent_offset += d[1].length * BOX_X;
        }
        points.push([x2 + parent_offset + 0.5, y2 + BOX_Y]);
        points.push([x1 + child_offset + 0.5, y1]);
        points.push([x1 + child_offset + 0.5, y1 + BOX_Y]);

        var foreground = null;
        var background = null;
        if (pass == 0 && merge_node && typeof d == "number") {
          foreground = FOREGROUNDS.m;
          background = BACKGROUNDS.m;
        } else if (pass == 1 && !merge_node && typeof d != "number") {
          foreground = FOREGROUNDS[uid];
          background = BACKGROUNDS[uid];
        } else if (pass == 0 && !merge_node && typeof d == "number") {
          foreground = FOREGROUNDS.m;
          background = BACKGROUNDS.m;
        }

        if (foreground) {
          g.append(create_polygon(points, background));
          g.append(create_polyline(points.slice(0, 3), foreground));
          g.append(create_polyline(points.slice(3), foreground));
        }
      });
    }

    return g;
  }

  var svg = null;
  function redraw() {
    if (svg) svg.remove();
    svg = fancy_dag_svg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svg_div.append(svg);
    svg.my_width = s7.width;
    svg.setAttribute("width", s7.width);
    svg.setAttribute("height", s7.height);

    each(s7.versions, function (c, id) {
      var merge_node = Object.keys(c.to_parents).length > 1;
      var uid = merge_node ? "m" : c.uid;
      each(c.to_parents, function (d, pid) {
        svg.append(
          create_diff_lines(
            c.x || 0,
            c.y || 0,
            s7.versions[pid].x || 0,
            s7.versions[pid].y || 0,
            d,
            merge_node,
            uid
          )
        );
      });
    });

    each(s7.versions, function (c, id) {
      var merge_node = Object.keys(c.to_parents).length > 1;
      svg.append(
        create_char_boxes(
          c.x || 0,
          c.y || 0,
          c.text || "",
          selected[id],
          calc_specials(id),
          merge_node,
          c
        )
      );
    });

    if (Object.keys(selected).length == 0) {
      var leaf = s7.column_leaves[0];
      var mi = s7.versions[leaf].merge_info;
      Object.values(s7.column_leaves).forEach((L) => {
        var ancs = sync7_get_ancestors(s7, L);
        var mimi = s7.versions[L].merge_info;
        if (ancs[leaf] || (mimi && !mi)) {
          leaf = L;
          mi = mimi;
        }
      });
      if (mi) update_space_dag(mi);
    }

    header.style.marginLeft =
      (s7.width - measure_text(header.textContent)) / 2 + "px";
    header2.style.marginLeft =
      (s7.width - measure_text(header2.textContent)) / 2 + "px";
  }
  redraw();

  function getPos(e) {
    var x = 0,
      y = 0;
    while (e != null) {
      x += e.offsetLeft;
      y += e.offsetTop;
      e = e.offsetParent;
    }
    return { x: x, y: y };
  }

  function getRelPos(to, positionedObject) {
    var pos = getPos(to);
    return {
      x: positionedObject.pageX - pos.x,
      y: positionedObject.pageY - pos.y,
    };
  }

  svg_div.onmouseleave = function (e) {
    if (Object.keys(selected).length > 0) {
      selected = {};
      redraw();
    }
  };

  svg_div.onmousemove = function (e) {
    var pos = getRelPos(svg_div, e);
    var did_something = false;
    each(s7.versions, function (v, id) {
      if (
        pos.x >= (v.x || 0) &&
        pos.x < (v.x || 0) + (v.text || "Q!?").length * BOX_X &&
        pos.y >= (v.y || 0) - BOX_Y * 2 &&
        pos.y < (v.y || 0) + BOX_Y
      ) {
        var version = s7.versions[id];
        if (version.merge_info) {
          selected = {};
          selected[id] = true;
          update_space_dag(version.merge_info);
          redraw();
          did_something = true;
          return false;
        }
      }
    });
    if (!did_something) {
      if (Object.keys(selected).length > 0) {
        selected = {};
        redraw();
      }
    }
  };
  svg_div.onmousedown = function (e) {
    e.preventDefault();
    var pos = getRelPos(svg_div, e);

    var grabbed = null;
    each(s7.versions, function (v, id) {
      if (
        pos.x >= (v.x || 0) &&
        pos.x < (v.x || 0) + (v.text || "Q!?").length * BOX_X &&
        pos.y >= (v.y || 0) &&
        pos.y < (v.y || 0) + BOX_Y
      ) {
        grabbed = {
          id: id,
          hot_x: pos.x - (v.x || 0),
          hot_y: pos.y - (v.y || 0),
        };
        return false;
      }
    });

    var oldMove = document.onmousemove;
    document.onmousemove = function (e) {
      var pos = getRelPos(svg_div, e);
      if (grabbed) {
        s7.versions[grabbed.id].x = pos.x - grabbed.hot_x;
        s7.versions[grabbed.id].y = pos.y - grabbed.hot_y;
        redraw();
      }
    };

    var oldUp = document.onmouseup;
    document.onmouseup = function (e) {
      document.onmousemove = oldMove;
      document.onmouseup = oldUp;
    };
  };

  return d;
}

var sync7 = {};

sync7.create = function () {
  return {
    versions: {
      root: { to_parents: {}, from_kids: {} },
    },
    waiting_versions: {},
    temp_versions: {},
    real_leaves: ["root"],
    leaf: "root",
    text: "",
  };
};

sync7.commit = function (s7, s) {
  if (s == s7.text) {
    return;
  }

  var cs = s7.temp_versions;
  s7.temp_versions = {};

  var id = guid();
  var to_parents = {};
  s7.versions[s7.leaf].from_kids[id] = to_parents[s7.leaf] = sync7_diff(
    s,
    s7.text
  );

  var a_regions = [];
  var offset = 0;
  to_parents[s7.leaf].forEach((x, i) => {
    if (Array.isArray(x)) {
      a_regions.push([offset, x[0].length, true, i, null, -1]);
      offset += x[0].length;
    } else {
      a_regions.push([offset, x, true, i, null, -1]);
      offset += x;
    }
  });

  s7.versions[id] = cs[id] = {
    to_parents: to_parents,
    from_kids: {},

    merge_info: {
      a_text: s,
      b_text: "",
      a_regions: a_regions,
      b_regions: [],
    },
  };
  s7.leaf = id;
  s7.real_leaves = [id];

  s7.text = s;
  return cs;
};

sync7.merge = function (s7, cs, cursors, custom_merge_func) {
  if (!cursors) cursors = {};
  if (!custom_merge_func) custom_merge_func = default_custom_merge_func;

  each(cs, function (c, id) {
    each(c.to_parents, function (d, p) {
      if (s7.waiting_versions[p]) {
        s7.waiting_versions[p].from_kids[id] = d;
      }
    });
  });
  each(s7.waiting_versions, function (c, id) {
    each(c.to_parents, function (d, p) {
      if (cs[p]) {
        cs[p].from_kids[id] = d;
      }
    });
  });

  var cant_add_these = {};
  function find_version(id) {
    return s7.versions[id] || cs[id] || s7.waiting_versions[id];
  }
  function mark_this_and_kids_as_unaddable(c, id) {
    if (!cant_add_these[id]) {
      cant_add_these[id] = true;
      each(c.from_kids, function (d, kid) {
        var kidc = find_version(kid);
        if (kidc) mark_this_and_kids_as_unaddable(kidc, kid);
      });
    }
  }
  function process_version(c, id) {
    var missing_parent = false;
    each(c.to_parents, function (d, p) {
      if (!find_version(p)) {
        missing_parent = true;
        return false;
      }
    });
    if (missing_parent) mark_this_and_kids_as_unaddable(c, id);
  }
  each(cs, process_version);
  each(s7.waiting_versions, process_version);

  if (
    Object.keys(cs).length +
      Object.keys(s7.waiting_versions).length -
      Object.keys(cant_add_these).length <=
    0
  ) {
    Object.assign(s7.waiting_versions, cs);
    return cursors;
  }

  var projected_cursors = map(cursors, function (cursor) {
    var node = s7.leaf;
    while (s7.temp_versions[node]) {
      var old_node = node;
      each(s7.versions[node].to_parents, function (d, p) {
        var offset = 0;
        var poffset = 0;
        each(d, function (d) {
          if (typeof d == "number") {
            if (cursor <= offset + d) {
              cursor = cursor - offset + poffset;
              node = p;
              return false;
            }
            offset += d;
            poffset += d;
          } else {
            offset += d[0].length;
            poffset += d[1].length;
          }
        });
        if (old_node != node) return false;
      });
      if (old_node == node) throw "failed to project cursor up";
    }
    return [cursor, node];
  });

  function process_version2(c, id) {
    if (cant_add_these[id]) {
      if (cs[id]) s7.waiting_versions[id] = c;
    } else {
      s7.versions[id] = c;
      if (s7.waiting_versions[id]) delete s7.waiting_versions[id];
      each(c.to_parents, function (d, p) {
        if (s7.versions[p]) {
          s7.versions[p].from_kids[id] = d;
        }
      });
    }
  }
  each(cs, process_version2);
  each(s7.waiting_versions, process_version2);

  s7.real_leaves = sync7_get_leaves(s7.versions, s7.temp_versions);
  var leaves = Object.keys(s7.real_leaves).sort();

  var texts = {};
  each(leaves, function (leaf) {
    texts[leaf] = sync7_get_text(s7, leaf);
  });

  each(s7.temp_versions, function (c, k) {
    each(c.to_parents, function (d, p) {
      if (!s7.temp_versions[p]) {
        delete s7.versions[p].from_kids[k];
      }
    });
    delete s7.versions[k];
  });
  s7.temp_versions = {};

  var prev_merge_node = leaves[0];
  var ancestors = sync7_get_ancestors(s7, prev_merge_node);
  for (var i = 1; i < leaves.length; i++) {
    var leaf = leaves[i];
    var i_ancestors = sync7_get_ancestors(s7, leaf);
    var CAs = sync7_intersection(ancestors, i_ancestors);
    var LCAs = sync7_get_leaves(CAs);
    each(i_ancestors, function (v, k) {
      ancestors[k] = v;
    });

    function get_nodes_on_path_to_LCAs(node) {
      var agg = {};
      function helper(x) {
        var hit_LCA = LCAs[x];
        if (!CAs[x]) {
          each(s7.versions[x].to_parents, function (d, p) {
            hit_LCA = helper(p) || hit_LCA;
          });
        }
        if (hit_LCA) {
          agg[x] = true;
          return true;
        }
      }
      helper(node);
      return agg;
    }

    function calc_dividers_and_such_for_node(
      node,
      nodes_on_path_to_LCAs,
      dividers,
      untouched_regions_for_node
    ) {
      untouched_regions_for_node[node] = [[0, texts[node].length, 0]];
      function helper(node) {
        if (untouched_regions_for_node[node])
          return untouched_regions_for_node[node];
        var pur = {};
        each(s7.versions[node].from_kids, function (d, k) {
          if (!nodes_on_path_to_LCAs[k]) {
            return;
          }
          var untouched = helper(k);

          var ui = 0;
          var uo = 0;
          var offset = 0;
          var poffset = 0;
          each(d, function (r) {
            var end_point = offset + (typeof r == "number" ? r : r[0].length);
            while (
              untouched[ui] &&
              end_point >= untouched[ui][2] + untouched[ui][1]
            ) {
              if (typeof r == "number") {
                var x = untouched[ui][2] + uo - offset + poffset;
                pur[x] = [untouched[ui][0] + uo, untouched[ui][1] - uo, x];
              }
              ui++;
              uo = 0;
            }
            if (!untouched[ui]) {
              return false;
            }
            if (end_point > untouched[ui][2] + uo) {
              if (typeof r == "number") {
                var x = untouched[ui][2] + uo - offset + poffset;
                pur[x] = [
                  untouched[ui][0] + uo,
                  end_point - (untouched[ui][2] + uo),
                  x,
                ];
              }
              uo = end_point - untouched[ui][2];
              dividers[untouched[ui][0] + uo] = untouched[ui][0] + uo;
            }
            offset = end_point;
            poffset += typeof r == "number" ? r : r[1].length;
          });
        });
        return (untouched_regions_for_node[node] = Object.values(pur).sort(
          function (a, b) {
            return a[2] - b[2];
          }
        ));
      }
      each(LCAs, function (_, lca) {
        helper(lca);
      });
    }

    var prev_nodes_on_path_to_LCAs = get_nodes_on_path_to_LCAs(prev_merge_node);
    var prev_dividers = {};
    var prev_untouched_regions_for_node = {};
    calc_dividers_and_such_for_node(
      prev_merge_node,
      prev_nodes_on_path_to_LCAs,
      prev_dividers,
      prev_untouched_regions_for_node
    );

    var leaf_nodes_on_path_to_LCAs = get_nodes_on_path_to_LCAs(leaf);
    var leaf_dividers = {};
    var leaf_untouched_regions_for_node = {};
    calc_dividers_and_such_for_node(
      leaf,
      leaf_nodes_on_path_to_LCAs,
      leaf_dividers,
      leaf_untouched_regions_for_node
    );

    each(LCAs, function (_, lca) {
      function do_one_against_the_other(a, b, dividers) {
        var bb,
          bi = 0;
        each(a, function (aa) {
          while ((bb = b[bi]) && bb[2] + bb[1] <= aa[2]) bi++;
          if (bb && bb[2] < aa[2]) {
            var x = aa[2] - bb[2] + bb[0];
            dividers[x] = x;
          }
          while ((bb = b[bi]) && bb[2] + bb[1] <= aa[2] + aa[1]) bi++;
          if (bb && bb[2] < aa[2] + aa[1]) {
            var x = aa[2] + aa[1] - bb[2] + bb[0];
            dividers[x] = x;
          }
        });
      }

      var a = prev_untouched_regions_for_node[lca];
      var b = leaf_untouched_regions_for_node[lca];
      do_one_against_the_other(a, b, leaf_dividers);
      do_one_against_the_other(b, a, prev_dividers);
    });

    function calc_endpoints(dividers, node) {
      var endpoints = [];
      endpoints.push([0, 0, 0]);
      each(
        Object.values(dividers).sort(function (a, b) {
          return a - b;
        }),
        function (offset) {
          endpoints.push([offset, 1, offset]);
          endpoints.push([offset, 0, offset]);
        }
      );
      endpoints.push([texts[node].length, 1, texts[node].length]);

      return endpoints;
    }

    var prev_endpoints = calc_endpoints(prev_dividers, prev_merge_node);
    var leaf_endpoints = calc_endpoints(leaf_dividers, leaf);

    function project_endpoints_to_LCAs(endpoints, node, nodes_on_path_to_LCAs) {
      var endpoints_for_node = {};
      endpoints_for_node[node] = endpoints;

      function helper(node) {
        if (endpoints_for_node[node]) return endpoints_for_node[node];
        var agg = {};
        function add_to_agg(endpoint, projected_pos) {
          var key = "[" + endpoint[0] + "," + endpoint[1] + "]";
          if (endpoint[1] == 0)
            agg[key] = Math.min(agg[key] || Infinity, projected_pos);
          else agg[key] = Math.max(agg[key] || -Infinity, projected_pos);
        }
        each(s7.versions[node].from_kids, function (d, k) {
          if (!nodes_on_path_to_LCAs[k]) {
            return;
          }

          var endpoints = helper(k);
          var ei = 0;

          var offset = 0;
          var poffset = 0;
          each(d, function (d) {
            var end = offset + (typeof d == "number" ? d : d[0].length);
            while (
              endpoints[ei] &&
              (endpoints[ei][2] < end ||
                (endpoints[ei][1] == 1 && endpoints[ei][2] <= end))
            ) {
              if (typeof d == "number") {
                add_to_agg(endpoints[ei], endpoints[ei][2] - offset + poffset);
              } else if (endpoints[ei][1] == 0) {
                add_to_agg(endpoints[ei], poffset);
              } else {
                add_to_agg(endpoints[ei], poffset + d[1].length);
              }
              ei++;
            }
            offset = end;
            poffset += typeof d == "number" ? d : d[1].length;
          });
          while (endpoints[ei]) {
            add_to_agg(endpoints[ei], poffset);
            ei++;
          }
        });

        var endpoints = [];
        each(agg, function (v, k) {
          var kk = eval(k);
          endpoints.push([kk[0], kk[1], v]);
        });

        return (endpoints_for_node[node] = endpoints.sort(function (a, b) {
          if (a[2] != b[2]) return a[2] - b[2];
          return b[1] - a[1];
        }));
      }

      var regions_for_node = {};

      var lookup_by_begin = {};
      var lookup_by_end = {};
      var base_regions = [];
      regions_for_node[node] = base_regions;
      for (var i = 0; i < endpoints.length; i += 2) {
        var e0 = endpoints[i][0];
        var e1 = endpoints[i + 1][0];
        base_regions.push([e0, e1 - e0]);
        lookup_by_begin[e0] = base_regions.length - 1;
        lookup_by_end[e1] = base_regions.length - 1;
      }

      each(LCAs, function (_, lca) {
        var endpoints = helper(lca);
        var regions = [];
        regions_for_node[lca] = regions;
        each(endpoints, function (e) {
          if (e[1] == 0) {
            var i = lookup_by_begin[e[0]];
            (regions[i] = regions[i] || [])[0] = e[2];
          } else {
            var i = lookup_by_end[e[0]];
            (regions[i] = regions[i] || [])[1] = e[2];
          }
        });
        each(regions, function (r) {
          r[1] = r[1] - r[0];
        });
      });

      return regions_for_node;
    }

    var prev_regions_per_node = project_endpoints_to_LCAs(
      prev_endpoints,
      prev_merge_node,
      prev_nodes_on_path_to_LCAs
    );
    var leaf_regions_per_node = project_endpoints_to_LCAs(
      leaf_endpoints,
      leaf,
      leaf_nodes_on_path_to_LCAs
    );

    var prev_regions = prev_regions_per_node[prev_merge_node];
    var leaf_regions = leaf_regions_per_node[leaf];

    var prev_untouched_regions_for_LCA_by_position = {};
    var leaf_untouched_regions_for_LCA_by_position = {};

    each(LCAs, function (_, lca) {
      function process(base, regions, untouched, _by_position) {
        _by_position[lca] = {};
        var ri = 0;
        var r;
        each(untouched, function (u) {
          while ((r = regions[ri]) && r[0] + r[1] <= u[2]) {
            ri++;
          }
          while ((r = regions[ri]) && r[0] < u[2] + u[1]) {
            _by_position[lca][r[0]] = ri;
            base[ri][2] = true;
            r[2] = true;
            ri++;
          }
        });
      }
      process(
        prev_regions_per_node[prev_merge_node],
        prev_regions_per_node[lca],
        prev_untouched_regions_for_node[lca],
        prev_untouched_regions_for_LCA_by_position
      );
      process(
        leaf_regions_per_node[leaf],
        leaf_regions_per_node[lca],
        leaf_untouched_regions_for_node[lca],
        leaf_untouched_regions_for_LCA_by_position
      );
    });

    function mark_deletes_and_more(
      regions_for_node,
      node,
      other_untouched_for_LCA_by_position
    ) {
      each(regions_for_node[node], function (r, ri) {
        r[4] = r[5] = -1; // <-- the "more"
        if (r[2]) {
          r[3] = -1;
          each(LCAs, function (_, lca) {
            var rr = regions_for_node[lca][ri];
            var other_ri = other_untouched_for_LCA_by_position[lca][rr[0]];
            if (rr[2] && typeof other_ri == "number") {
              r[3] = other_ri;
              return false;
            }
          });
        }
      });
    }
    mark_deletes_and_more(
      prev_regions_per_node,
      prev_merge_node,
      leaf_untouched_regions_for_LCA_by_position
    );
    mark_deletes_and_more(
      leaf_regions_per_node,
      leaf,
      prev_untouched_regions_for_LCA_by_position
    );

    function is_definitely_before(
      a_regions,
      a_node,
      ai,
      b_regions,
      b_node,
      bi
    ) {
      var a_before_b = false;
      var b_before_a = false;
      each(LCAs, function (_, lca) {
        var ar = a_regions[lca][ai];
        var br = b_regions[lca][bi];

        if ((ar[1] || br[1]) && ar[0] + ar[1] <= br[0]) a_before_b = true;
        if (!ar[1] && !br[1] && ar[0] < br[0]) a_before_b = true;

        if ((ar[1] || br[1]) && br[0] + br[1] <= ar[0]) b_before_a = true;
        if (!ar[1] && !br[1] && br[0] < ar[0]) b_before_a = true;
      });
      return a_before_b && !b_before_a;
    }

    function calc_known_orderings(a_regions, a_node, b_regions, b_node) {
      var bi = 0;
      each(a_regions[a_node], function (ar, ai) {
        for (; bi < b_regions[b_node].length; bi++) {
          if (
            is_definitely_before(a_regions, a_node, ai, b_regions, b_node, bi)
          ) {
            ar[4] = bi;
            b_regions[b_node][bi][5] = ai;
            return;
          }
        }
      });
    }
    calc_known_orderings(
      prev_regions_per_node,
      prev_merge_node,
      leaf_regions_per_node,
      leaf
    );
    calc_known_orderings(
      leaf_regions_per_node,
      leaf,
      prev_regions_per_node,
      prev_merge_node
    );

    var m = custom_merge_func(
      s7,
      prev_merge_node,
      leaf,
      texts[prev_merge_node],
      texts[leaf],
      prev_regions,
      leaf_regions
    );

    var id = guid();
    var to_parents = {};
    s7.versions[prev_merge_node].from_kids[id] = to_parents[prev_merge_node] =
      m.to_a;
    s7.versions[leaf].from_kids[id] = to_parents[leaf] = m.to_b;
    s7.versions[id] = s7.temp_versions[id] = {
      to_parents: to_parents,
      from_kids: {},

      merge_info: {
        a_text: texts[prev_merge_node],
        b_text: texts[leaf],
        a_regions: prev_regions,
        b_regions: leaf_regions,
      },
    };

    prev_merge_node = id;
    texts[prev_merge_node] = m.text;
  }

  s7.leaf = prev_merge_node;
  s7.text = texts[prev_merge_node];

  return map(projected_cursors, function (cursor) {
    while (cursor[1] != s7.leaf) {
      var old_node = cursor[1];
      var kids = s7.versions[cursor[1]].from_kids;
      var kid = Object.keys(kids)[0];
      var d = kids[kid];

      var offset = 0;
      var poffset = 0;
      each(d, function (d) {
        if (typeof d == "number") {
          if (cursor[0] <= poffset + d) {
            cursor[0] = cursor[0] - poffset + offset;
            cursor[1] = kid;
            return false;
          }
          offset += d;
          poffset += d;
        } else {
          if (cursor[0] <= poffset + d[1].length) {
            cursor[0] = offset;
            cursor[1] = kid;
            return false;
          }
          offset += d[0].length;
          poffset += d[1].length;
        }
      });
      if (cursor[1] == old_node) {
        cursor[0] = offset;
        cursor[1] = kid;
      }
    }
    return cursor[0];
  });
};

function default_custom_merge_func(
  s7,
  a,
  b,
  a_text,
  b_text,
  a_regions,
  b_regions
) {
  // regions be like [pos, len, untouched?, index in other region array of this untouched or -1 if not present, index of first region in other array that this region is definitely before, index of last region in other array that this region is definitely after]

  // console.log('HI!!')
  // console.log(a)
  // console.log(b)
  // console.log(a_text)
  // console.log(b_text)
  // console.log(a_regions)
  // console.log(b_regions)

  var text = [];
  var a_diff = [];
  var b_diff = [];
  var on_a = true;
  var ai = 0;
  var bi = 0;
  while (true) {
    var aa = a_regions[ai];
    var bb = b_regions[bi];
    if (!aa && !bb) break;
    if (!aa) on_a = false;
    if (!bb) on_a = true;

    var ci = on_a ? ai : bi;
    var di = on_a ? bi : ai;
    var cc = on_a ? aa : bb;
    var dd = on_a ? bb : aa;
    var c_text = on_a ? a_text : b_text;
    var d_text = on_a ? b_text : a_text;
    var c_diff = on_a ? a_diff : b_diff;
    var d_diff = on_a ? b_diff : a_diff;

    if (cc[5] < di) {
      var t = c_text.substr(cc[0], cc[1]);
      if (cc[2]) {
        if (cc[3] < di) {
          c_diff.push(["", t]);
        } else if (cc[3] == di) {
          text.push(t);
          sync7_push_eq(c_diff, cc[1]);
          sync7_push_eq(d_diff, cc[1]);
          if (on_a) {
            bi++;
          } else {
            ai++;
          }
        } else {
          text.push(t);
          sync7_push_eq(c_diff, cc[1]);
          d_diff.push([t, ""]);
        }
      } else {
        text.push(t);
        sync7_push_eq(c_diff, cc[1]);
        d_diff.push([t, ""]);
      }
      if (on_a) {
        ai++;
      } else {
        bi++;
      }
    } else if (dd && dd[5] < ci) {
      on_a = !on_a;
    } else {
      throw "failure";
    }
  }

  // console.log('HI!!!!!!')
  // console.log(text)
  // console.log(a_diff)
  // console.log(b_diff)

  return {
    text: text.join(""),
    to_a: a_diff,
    to_b: b_diff,
  };
}

function sync7_diff_merge_trans(a, b, a_factor, b_factor) {
  var ret = [];
  var a_i = 0;
  var b_i = 0;
  var a_offset = 0;
  var b_offset = 0;
  var a_dumped_load = false;
  var b_dumped_load = false;
  function neg_idx(i) {
    return i == 0 ? 1 : 0;
  }
  function a_idx(i) {
    return a_factor == -1 ? neg_idx(i) : i;
  }
  function b_idx(i) {
    return b_factor == -1 ? neg_idx(i) : i;
  }
  while (a_i < a.length && b_i < b.length) {
    var da = a[a_i];
    var db = b[b_i];
    if (typeof da == "number" && typeof db == "number") {
      var a_len = da - a_offset;
      var b_len = db - b_offset;
      sync7_push_eq(ret, Math.min(a_len, b_len));
    } else if (typeof da == "number") {
      var a_len = da - a_offset;
      var b_len = db[b_idx(0)].length - b_offset;
      sync7_push_rep(
        ret,
        db[b_idx(0)].substr(b_offset, Math.min(a_len, b_len)),
        !b_dumped_load ? db[b_idx(1)] : ""
      );
      b_dumped_load = true;
    } else if (typeof db == "number") {
      var a_len = da[a_idx(1)].length - a_offset;
      var b_len = db - b_offset;
      sync7_push_rep(
        ret,
        !a_dumped_load ? da[a_idx(0)] : "",
        da[a_idx(1)].substr(a_offset, Math.min(a_len, b_len))
      );
      a_dumped_load = true;
    } else {
      var a_len = da[a_idx(1)].length - a_offset;
      var b_len = db[b_idx(0)].length - b_offset;
      sync7_push_rep(
        ret,
        !a_dumped_load ? da[a_idx(0)] : "",
        !b_dumped_load ? db[b_idx(1)] : ""
      );
      a_dumped_load = b_dumped_load = true;
    }
    if (a_len > b_len) {
      a_offset += b_len;
    } else {
      a_i++;
      a_offset = 0;
      a_dumped_load = false;
    }
    if (a_len < b_len) {
      b_offset += a_len;
    } else {
      b_i++;
      b_offset = 0;
      b_dumped_load = false;
    }
  }
  while (a_i < a.length) {
    var da = a[a_i];
    if (typeof da == "number") {
      sync7_push_eq(ret, da);
    } else {
      sync7_push_rep(
        ret,
        !a_dumped_load ? da[a_idx(0)] : "",
        da[a_idx(1)].substr(a_offset)
      );
    }
    a_i++;
    a_offset = 0;
    a_dumped_load = false;
  }
  while (b_i < b.length) {
    var db = b[b_i];
    if (typeof db == "number") {
      sync7_push_eq(ret, db);
    } else {
      sync7_push_rep(
        ret,
        db[b_idx(0)].substr(b_offset),
        !b_dumped_load ? db[b_idx(1)] : ""
      );
    }
    b_i++;
    b_offset = 0;
    b_dumped_load = false;
  }
  return ret;
}

function sync7_merge_path_up(s7, from, path) {
  var diff = [];
  var prev = from;
  each(path, function (next) {
    diff = sync7_diff_merge_trans(diff, s7.versions[prev].to_parents[next]);
    prev = next;
  });
  return diff;
}

function sync7_get_text(s7, id) {
  var ls = sync7_get_leaves(
    sync7_intersection(
      sync7_get_ancestors(s7, s7.leaf, true),
      sync7_get_ancestors(s7, id, true)
    )
  );
  var lca = Object.keys(ls)[0];
  var leaf_to_lca = sync7_get_path_to_ancestor(s7, s7.leaf, lca);
  var lca_to_id = sync7_get_path_to_ancestor(s7, id, lca).reverse();
  if (lca_to_id.length > 0) {
    lca_to_id.shift();
    lca_to_id.push(id);
  }

  var diff = sync7_merge_path_up(s7, s7.leaf, leaf_to_lca);
  var prev = lca;
  each(lca_to_id, function (next) {
    diff = sync7_diff_merge_trans(
      diff,
      s7.versions[next].to_parents[prev],
      1,
      -1
    );
    prev = next;
  });

  return sync7_diff_apply(s7.text, diff);
}

function sync7_get_leaves(versions, ignore) {
  if (!ignore) ignore = {};
  var leaves = {};
  each(versions, function (_, id) {
    if (ignore[id]) {
      return;
    }
    leaves[id] = true;
  });
  each(versions, function (c, id) {
    if (ignore[id]) {
      return;
    }
    each(c.to_parents, function (_, p) {
      delete leaves[p];
    });
  });
  return leaves;
}

function sync7_get_ancestors(s7, id_or_set, include_self) {
  var frontier = null;
  var ancestors = {};
  if (typeof id_or_set == "object") {
    frontier = Object.keys(id_or_set);
    if (include_self)
      each(id_or_set, function (_, id) {
        ancestors[id] = s7.versions[id];
      });
  } else {
    frontier = [id_or_set];
    if (include_self) ancestors[id_or_set] = s7.versions[id_or_set];
  }
  while (frontier.length > 0) {
    var next = frontier.shift();
    each(s7.versions[next].to_parents, function (_, p) {
      if (!ancestors[p]) {
        ancestors[p] = s7.versions[p];
        frontier.push(p);
      }
    });
  }
  return ancestors;
}

function sync7_get_path_to_ancestor(s7, a, b) {
  if (a == b) {
    return [];
  }
  var frontier = [a];
  var backs = {};
  while (frontier.length > 0) {
    var next = frontier.shift();
    if (next == b) {
      var path = [];
      while (next && next != a) {
        path.unshift(next);
        next = backs[next];
      }
      return path;
    }
    each(s7.versions[next].to_parents, function (_, p) {
      if (!backs[p]) {
        backs[p] = next;
        frontier.push(p);
      }
    });
  }
  throw "no path found from " + a + " to " + b;
}

function sync7_intersection(a, b) {
  var common = {};
  each(a, function (_, x) {
    if (b[x]) {
      common[x] = a[x];
    }
  });
  return common;
}

function sync7_diff(a, b) {
  var ret = [];
  var d = diff_main(a, b);
  for (var i = 0; i < d.length; i++) {
    var top = ret[ret.length - 1];
    if (d[i][0] == 0) {
      ret.push(d[i][1].length);
    } else if (d[i][0] == 1) {
      if (top && typeof top != "number") top[1] += d[i][1];
      else ret.push(["", d[i][1]]);
    } else {
      if (top && typeof top != "number") top[0] += d[i][1];
      else ret.push([d[i][1], ""]);
    }
  }
  return ret;
}

function sync7_push_eq(diffs, size) {
  if (typeof diffs[diffs.length - 1] == "number") {
    diffs[diffs.length - 1] += size;
  } else diffs.push(size);
}

function sync7_push_rep(diffs, del, ins) {
  if (del.length == 0 && ins.length == 0) {
    return;
  }
  if (diffs.length > 0) {
    var top = diffs[diffs.length - 1];
    if (typeof top != "number") {
      top[0] += del;
      top[1] += ins;
      return;
    }
  }
  diffs.push([del, ins]);
}

function sync7_diff_apply(s, diff) {
  var offset = 0;
  var texts = [];
  each(diff, function (d) {
    if (typeof d == "number") {
      texts.push(s.substr(offset, d));
      offset += d;
    } else {
      texts.push(d[1]);
      offset += d[0].length;
    }
  });
  texts.push(s.substr(offset));
  return texts.join("");
}

function guid() {
  var x = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var s = [];
  for (var i = 0; i < 15; i++) {
    s.push(x[Math.floor(Math.random() * x.length)]);
  }
  return s.join("");
}

function each(o, cb) {
  if (o instanceof Array) {
    for (var i = 0; i < o.length; i++) {
      if (cb(o[i], i, o) == false) return false;
    }
  } else {
    for (var k in o) {
      if (o.hasOwnProperty(k)) {
        if (cb(o[k], k, o) == false) return false;
      }
    }
  }
  return true;
}

function map(o, func) {
  if (o instanceof Array) {
    var accum = [];
    for (var i = 0; i < o.length; i++) accum[i] = func(o[i], i, o);
    return accum;
  } else {
    var accum = {};
    for (var k in o) if (o.hasOwnProperty(k)) accum[k] = func(o[k], k, o);
    return accum;
  }
}

function create_random_text() {
  var random_text = "";
  function add_char() {
    random_text += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  while (Math.random() < 0.75) add_char();
  return random_text;
}

function create_random_ops() {
  var ops = [];
  function add_random_ops() {
    if (Math.random() < 0.33) {
      ops.push({
        op: "commit",
        side: Math.random() < 0.33 ? "a" : Math.random() < 0.5 ? "b" : "c",
        pos: Math.random(),
        del: Math.random(),
        text: create_random_text(),
      });
    } else {
      ops.push({
        op: "merge",
        side: Math.random() < 0.33 ? "a" : Math.random() < 0.5 ? "b" : "c",
      });
    }
  }
  add_random_ops();
  while (Math.random() < 0.9) add_random_ops();
  return ops;
}

function apply_ops_to_sync7(s7s, ops, debug_print_buffer) {
  if (!s7s.a.buffer) s7s.a.buffer = [];
  if (!s7s.b.buffer) s7s.b.buffer = [];
  if (!s7s.c.buffer) s7s.c.buffer = [];
  if (typeof s7s.a.cursor != "number") s7s.a.cursor = 0;
  if (typeof s7s.b.cursor != "number") s7s.b.cursor = 0;
  if (typeof s7s.c.cursor != "number") s7s.c.cursor = 0;

  each(ops, function (op, opi) {
    var s7 = s7s[op.side];
    var other_s7s = [];
    each(s7s, function (s7, key) {
      if (key != op.side) other_s7s.push(s7);
    });
    if (op.op == "commit") {
      var t = s7.text;
      var pos = Math.floor((t.length + 1) * op.pos);
      var del = Math.floor((t.length - pos) * op.del);
      var msg = sync7.commit(
        s7,
        t.slice(0, pos) + op.text + t.slice(pos + del)
      );
      if (!msg) msg = null;
      if (msg) {
        s7.versions[s7.leaf].uid = op.side;
        s7.versions[s7.leaf].column = op.side;
      }
      each(other_s7s, function (s7) {
        s7.buffer.push(JSON.parse(JSON.stringify(msg)));
      });

      if (s7.cursor > s7.text.length) {
        s7.cursor = s7.text.length;
      }

      if (debug_print_buffer) {
        debug_print_buffer.push("OP COMMIT");
        debug_print_buffer.push("side: " + op.side);
        debug_print_buffer.push("pos: " + pos);
        debug_print_buffer.push("del: " + del);
        debug_print_buffer.push("txt: " + op.text);
      }
    } else if (op.op == "merge") {
      var x = s7.buffer.shift();
      if (x) {
        s7.cursor = sync7.merge(s7, x, null, default_custom_merge_func);
        each(s7.versions, function (c, id) {
          if (!c.column) c.column = op.side;
        });
      }

      if (debug_print_buffer) {
        debug_print_buffer.push("OP MERGE");
        debug_print_buffer.push("side: " + op.side);
      }
    }
  });
}

function sync7_create_visualization(s7) {
  // For laying out a Time DAG, first we group the versions into layers
  var layers = {};

  // By calling the get_layer(c) function inside an each() loop.
  function get_layer(c) {
    if (c.layer != null) return c.layer;
    var max_layer = 0;
    each(c.to_parents, function (d, p) {
      max_layer = Math.max(max_layer, get_layer(s7.versions[p]));
    });
    c.layer = max_layer + 1;
    if (!layers[c.layer]) layers[c.layer] = [];
    layers[c.layer].push(c);
    return c.layer;
  }
  each(s7.versions, function (c, id) {
    get_layer(c);
  });

  // Then, we iterate through each layer, and sort all versions at that layer left-to-right
  var max_width = 0;
  var simple_max_width = 0;
  var layer_widths = {};
  each(layers, function (layer_members, layer_i) {
    layer_members.sort(function (a, b) {
      if (a.column != b.column) return a.column - b.column;
      if (a.uid && !b.uid) return -1;
      if (!a.uid && b.uid) return 1;
      return 0;
    });

    var x = 0;
    var simple_x = 0;
    each(layer_members, function (c) {
      if (x) x += 2.7 * BOX_X;
      c.x = x;
      x += c.text.length * BOX_X;

      c.simple_x = simple_x;
      simple_x += 100;
    });
    layer_widths[layer_i] = x;
    if (x > max_width) max_width = x;
    if (simple_x > simple_max_width) simple_max_width = simple_x;
  });

  // Now we adjust the x coordinates. I'm not sure exactly what this does.
  // Maybe it is jiggling them so that lines don't overlap, becoming hard to
  // distinguish?
  each(layers, function (layer_members, layer_i) {
    var add_amount = (max_width - layer_widths[layer_i]) / 2;
    var simple_add_amount =
      (simple_max_width - (layer_members.length - 1) * 100) / 2;
    each(layer_members, function (c) {
      c.x += add_amount;
      c.simple_x += simple_add_amount;
    });
  });

  var max_height = 0;
  each(s7.versions, function (c, id) {
    c.y = c.layer * BOX_Y * 3 - BOX_Y * 2;
    if (c.y + BOX_Y > max_height) max_height = c.y + BOX_Y;
  });

  s7.width = max_width + 1;
  s7.height = max_height + 1;

  var d = (visdiv = document.createElement("div"));
  d.style.display = "grid";
  d.style["grid-template-columns"] = "auto auto";

  var B = sync7_create_fancy_dag(s7);

  var s72 = { versions: {}, column_leaves: s7.column_leaves };
  each(s7.versions, function (c, id) {
    var old_random = Math.random;
    Math.randomSeed(id);
    var random_x_offset = Math.random() * 20 - 10;
    Math.random = old_random;

    s72.versions[id] = {
      x: c.simple_x + random_x_offset,
      y: c.y + BOX_Y / 2,
      uid: c.uid,
      column: c.column,
      merge_info: c.merge_info,
      to_parents: c.to_parents,
    };
  });

  s72.width = simple_max_width;
  s72.height = max_height + BOX_Y;

  var A = sync7_create_simple_dag(s72);

  d.append(A);
  d.append(B);

  return d;
}

function sync7_create_visualizations(s7s) {
  var merged_s7 = { versions: {} };
  var conversions = {};

  each(s7s, function (s7) {
    function get_merger_key(id) {
      var v = s7.versions[id];
      if (Object.keys(v.to_parents).length <= 1) return id;
      if (v.merger_key) return v.merger_key;

      var agg = [];
      each(v.to_parents, function (d, p) {
        agg.push(get_merger_key(p));
      });
      return (v.merger_key = agg.sort().join(","));
    }

    each(s7.versions, function (c, id) {
      c.text = sync7_get_text(s7, id);
      if (Object.keys(c.to_parents).length > 1) {
        id = conversions[id] = get_merger_key(id);
      }
      merged_s7.versions[id] = JSON.parse(JSON.stringify(c));
    });
  });

  var actions = [];
  each(merged_s7.versions, function (c, id) {
    each(c.to_parents, function (d, p) {
      if (conversions[p]) actions.push([id, p]);
    });
  });
  each(actions, function (a) {
    var c = merged_s7.versions[a[0]];
    c.to_parents[conversions[a[1]]] = c.to_parents[a[1]];
    delete c.to_parents[a[1]];
  });

  merged_s7.column_leaves = {};
  each(s7s, function (s7, column) {
    var leaf = s7.leaf;
    if (conversions[leaf]) leaf = conversions[leaf];
    merged_s7.column_leaves[column] = leaf;
  });

  return sync7_create_visualization(merged_s7);
}

function create_side_text_boxes(n, show_example) {
  var size = BOX_Y + 10;

  var grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style["grid-template-columns"] = size + 10 + "px " + (200 - size) + "px";
  left.append(grid);

  var s7s = new Array(n);
  each(s7s, function (_, i) {
    var s7 = (s7s[i] = sync7.create());
    s7.versions.root.column = 0;
    s7.buffers = new Array(n);
    s7.buttons = new Array(n);
    for (var ii = 0; ii < n; ii++) s7.buffers[ii] = [];

    function create_circle_icon() {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", size);
      svg.setAttribute("height", size);

      var halo = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      halo.style.fill = "#00000000";
      halo.style.strokeWidth = "2";
      halo.style.stroke = FOREGROUNDS[i];
      halo.setAttribute("cx", size / 2);
      halo.setAttribute("cy", size / 2);
      halo.setAttribute("r", BOX_Y / 2 + 4);
      svg.append(halo);

      return svg;
    }
    grid.append(create_circle_icon());

    var t = document.createElement("textarea");
    s7.textarea = t;
    grid.append(t);
    var saved;

    t.onkeyup = t.onchange = function () {
      if (t.value !== (saved || "")) {
        b.style.backgroundColor = FOREGROUNDS[i];
        //delete b.disabled
        b.style.cursor = "pointer";
      } else {
        b.style.backgroundColor = "#ccc";
        //b.disabled = true
        delete b.style.cursor;
      }
    };

    var nothing = document.createElement("div");
    nothing.style.width = "10px";
    nothing.style.height = BOX_Y * 2 + "px";
    grid.append(nothing);

    var buttons = document.createElement("div");
    grid.append(buttons);

    function create_up_arrow_stack(color, n) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", BOX_Y + (BOX_Y / 8) * (n - 1));
      svg.setAttribute("height", BOX_Y + (BOX_Y / 8) * (n - 1));

      console.log("n = " + n);

      for (var i = n - 1; i >= 0; i--) {
        var poly = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon"
        );
        var o = (i * BOX_Y) / 8;
        poly.setAttribute(
          "points",
          `${o + BOX_Y / 2},${o + 0} ${o + BOX_Y},${o + BOX_Y / 2} ${
            o + (BOX_Y / 4) * 3
          },${o + BOX_Y / 2} ${o + (BOX_Y / 4) * 3},${o + BOX_Y} ${
            o + BOX_Y / 4
          },${o + BOX_Y} ${o + BOX_Y / 4},${o + BOX_Y / 2} ${o + 0},${
            o + BOX_Y / 2
          }`
        );
        poly.style.fill = color;
        poly.style.opacity = lerp(n + 1, 0, 0, 1, i);
        svg.append(poly);
      }

      return svg;
    }

    function style_merge_button(b, i, stars) {
      if (stars == 0) {
        b.style.display = "none";
      } else {
        b.style.display = "inline";
        b.style.verticalAlign = "top";
        b.style.background = "transparent";
        b.style.border = "0px";

        b.innerHTML = "";
        b.append(create_up_arrow_stack(FOREGROUNDS[i], stars));
      }
    }

    function commit() {
      var msg = sync7.commit(s7, t.value);
      if (msg) {
        s7.versions[s7.leaf].uid =
          s7.versions[s7.leaf].column =
          msg[s7.leaf].uid =
          msg[s7.leaf].column =
            i;

        for (var ii = 0; ii < n; ii++) {
          if (ii != i) {
            s7s[ii].buffers[i].push(JSON.parse(JSON.stringify(msg)));
            style_merge_button(
              s7s[ii].buttons[i],
              i,
              s7s[ii].buffers[i].length
            );
          }
        }

        right.innerHTML = "";
        right.append(sync7_create_visualizations(s7s));
      }
    }

    var b = document.createElement("button");
    b.innerHTML = "Set";
    b.style.verticalAlign = "top";
    b.style.backgroundColor = "#ccc";
    b.style.color = "white";
    b.style.borderRadius = "5px";
    b.style.border = 0;
    //b.disabled = true

    b.onclick = function () {
      saved = t.value;
      commit();
      b.style.backgroundColor = "#ccc";
      //b.disabled = true
      delete b.style.cursor;
    };
    buttons.append(b);
    s7.c_button = b;

    var iii = 1;
    each(new Array(n - 1), function (_, ii) {
      if (ii == i) iii++;
      var iiii = iii;
      iii++;

      var b2 = document.createElement("button");
      style_merge_button(b2, iiii - 1, 0);
      b2.onclick = function () {
        commit();
        var x = s7.buffers[iiii - 1].shift();
        if (x) {
          sync7.merge(s7, x, null, default_custom_merge_func);
          each(s7.versions, function (c, id) {
            if (c.column == null) c.column = i;
          });
          t.value = saved = s7.text;

          msg.innerHTML =
            Object.keys(s7.waiting_versions).length > 0
              ? "pend'n" + "*".repeat(Object.keys(s7.waiting_versions).length)
              : "";
        }
        style_merge_button(
          s7.buttons[iiii - 1],
          iiii - 1,
          s7.buffers[iiii - 1].length
        );

        right.innerHTML = "";
        right.append(sync7_create_visualizations(s7s));
      };
      buttons.append(b2);
      s7.buttons[iiii - 1] = b2;
    });

    var msg = document.createElement("span");
    buttons.append(msg);

    var d = document.createElement("div");
    d.style.width = "10px";
    d.style.height = "20px";
    grid.append(d);
    var d = document.createElement("div");
    d.style.width = "10px";
    d.style.height = "20px";
    grid.append(d);
  });

  function add_refresh_button() {
    var b = document.createElement("button");
    b.textContent = "Clear it all";
    b.style.fontSize = 25;
    b.style.width = "212px";
    b.onclick = function () {
      left.innerHTML = "";
      create_side_text_boxes(n);
    };
    left.append(b);
  }
  add_refresh_button();

  right.innerHTML = "";
  right.append(sync7_create_visualizations(s7s));

  if (show_example == "elephant") {
    s7s[0].textarea.value = "abc";
    s7s[0].c_button.click();

    s7s[0].textarea.value = "a12c";
    s7s[0].c_button.click();

    s7s[2].buttons[0].click();
    s7s[2].textarea.value = "CANbDO";
    s7s[2].c_button.click();

    s7s[0].buttons[2].click();

    s7s[1].buttons[0].click();
    s7s[1].buttons[0].click();
    s7s[1].textarea.value = "yes2c";
    s7s[1].c_button.click();
    s7s[1].textarea.value = "yesno";
    s7s[1].c_button.click();

    s7s[0].buttons[1].click();
    s7s[0].buttons[1].click();
  } else if (show_example == "catdog") {
    s7s[0].textarea.value = "cats";
    s7s[0].c_button.click();

    s7s[0].textarea.value = "dogs";

    s7s[1].buttons[0].click();
    s7s[1].textarea.value = "birds";
    s7s[1].c_button.click();

    s7s[0].c_button.click();
    s7s[0].buttons[1].click();
  }
}

create_side_text_boxes(4, "catdog");

function getPos(e) {
  var x = 0,
    y = 0;
  while (e != null) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent;
  }
  return { x: x, y: y };
}

function getRelPos(to, positionedObject) {
  var pos = getPos(to);
  return {
    x: positionedObject.pageX - pos.x,
    y: positionedObject.pageY - pos.y,
  };
}
