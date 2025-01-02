function parseIso8601d(s) {
  return s.split("-").map(Number)
}

function validateDate(string) {
  const arr = string.split("-");
  if (arr.length !== 3) return null;
  const year = Number(arr[0]);
  if (isNaN(year)) return null;
  if (year < 2020) return null;
  const month = Number(arr[1]);
  if (isNaN(month)) return null;
  if (month < 1 || month > 12) return null;
  const day = Number(arr[2]);
  if (isNaN(day)) return null;
  if (day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (year === date.getFullYear() && month === date.getMonth() + 1 && day === date.getDate()) {
    return `${year}-${lz(month)}-${lz(day)}`
  }
  return null;
}

function castToIso8601d(date, tz) {
  return Utilities.formatDate(date, tz, 'yyyy-MM-dd');
}

function ordinalSuffixOf(i) {
  let j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "st";
  }
  if (j == 2 && k != 12) {
    return i + "nd";
  }
  if (j == 3 && k != 13) {
    return i + "rd";
  }
  return i + "th";
}
function compareSets(xs, ys) {
  return _.difference(xs, ys).length === 0 && _.difference(ys, xs).length === 0;
}

scanl = function scanl(xs, f, ac) {
  return xs.map(function (a) {
    return function (e) {
      return a = f(a, e);
    };
  }(ac));
};

pureA = function(x) {return [x];};

concatA = function(a, b) {return a.concat(b);};

//::Bool->Bool
not = function(x) {return !x;};

//::Bool->Bool->Bool
or = function(a, b) {return a || b;};

//::Bool->Bool->Bool
and = function(a, b) {return a && b;};

//::Bool->Bool->Bool
xor = function(a, b) {return ( a || b ) && !( a && b );};

numsort = function(a, b) {return Number(a) - Number(b);};

lc = function(x) {return x.toLowerCase();};

takeWhile = function(p, xs) {
  var res, drop;
  drop = false;
  res = [];
  xs.forEach(function(x) {
    if (p(x) && !drop) {res.push(x);}
    else {
      drop = true;
    }
  });
  return res;
};

//::a->a->Bool
le = function(x,y) {return x <= y;};
less = function(x,y) {return x < y;};

//::a->a->Bool
ge = function(x,y) {return x >= y;};
greater = function(x,y) {return x > y;};

normalize_name = function(x) {
  return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase();
};

num = function(x) {return Number(x);};

//::Date->Iso8601
to_iso8601 = function(js_date) {
  var arr, year, month, day, time, time_offset;
  arr = js_date.toString().split(' ');
  year = arr[3];
  day = arr[2];
  month = lz(js_date.getMonth() + 1);
  time = arr[4];
  time_offset = arr[5].slice(3);
  return [year, month, day].join('-') + 'T' + time + time_offset;
};

//::Url->String->String
link = function(url, string) {
  return '<a href="' + url + '">' + string + '</a>';
};

//::String->Bool
empty = function(x) {return typeof x == 'string' &&  x == '';};

//::String->Bool
ne = function(x) {return !empty(x);};

clog = function(x) {Logger.log(x);};

//::Function->Function->Function
compose = function(f, g) {
  return function(x) {
    return f(g(x));
  };
};

copy = function(x) {return JSON.parse(JSON.stringify(x));};

//::a->a->a
sum = function(a, b) {return a + b;};

concat = function(a, b) {return a.toString() + b.toString();};

//::a->Bool
ndef = function(x) {
  if (typeof x == 'undefined') return true;
  if (x == null) return true;
  else return false;
};

//::a->Bool
def = function(x) {return !ndef(x);};//shortcut for == undefined;

keys = function(x) {return Object.keys(x);};

hyperlink = function(url, name) {return '=HYPERLINK("' + url + '", "' + name + '")';};

//::[Hashtable] -> String -> Hhi
vh_to_hhi = function (vh, key_field) {
  var res;
  res = {};
  vh.forEach(function(h, i) {
    res[h[key_field]] = {idx : i, h : h};
  });
  return res;
};

//::[Hashtable] -> String -> Hh
const vh_to_hh = function(vh, key_field) {
  var res;
  res = {};
  vh.forEach(function(h, i) {
    res[h[key_field]] = h;
  });
  return res;
};

//::[Hashtable] -> String->Stirng-> Object
const vh_to_h = function(vh, key_field, value_field) {
  var res;
  res = {};
  vh.forEach(function(h, i) {
    res[h[key_field]] = h[value_field];
  });
  return res;
};

hh_to_vh = function(hh) {return Object.keys(hh).map(function(key) {return hh[key];});};

//::a->a->a
sum = function(a, b) {return a + b;};

//::Int->Int->Int
div = function(x, n) {return Math.floor(x / n);};

//::String->String
l4z = function(x) {return ('000' + x).substr(-4);};

//::String->String
lz = function(x) {return x.toString().padStart(2, '0')};

function trim(x) {return x.trim();}

function blow(h, prop, value) {
  value = value;
  if (h[prop] == undefined) h[prop] = value;
  return h;
}

lenz = function(p, pred) {return function(x,y) {return pred(x[p], y[p]);};};

existy = function(x) {return x !== null && x !== undefined && x !== '';};

truthy = function(x) {return (x !== false) && existy(x);};

//::(a->Boolean)->SortResult
comparator = function(pred) {
  return function(x, y) {
    if (truthy(pred(x, y))) {
      return -1;
    } else {
      if (truthy(pred(y, x))) {
        return 1;
      } else {
        return 0;
      }
    }
  };
};

//::GroupedVhIndexed -> Vh
hhi_to_vh = function(hh_i) {
  var m, m2;
  m = [];
  keys(hh_i).forEach(function(key) {
    var core;
    core = hh_i[key].h;
    m.push([hh_i[key].idx, core]);//Here we came to matrix;
  });
  m2 =  m.sort(function(a, b) {
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  });
  return m2.map(function(r) {return r[1];});//here vh;
};

function iter_to_vh(iter) {
  var r;
  r = [];
  while (iter.hasNext()) {
    r.push(iter.next());
  };
  return r;
}

function autoresize_columns(sheet) {
  var cols, i;
  sheet.getLastColumn();
  for (i = 1;i <= cols;i++) {
    sheet.autoResizeColumn(i);
  }
};

//::[Hashtable] -> String -> GroupedBlocks
function vh_to_hvh(vh, key_field, fn) {
  var res;
  if (fn == undefined) {fn = function(x) {return x;};};
  if (is.empty_vh(vh)) return vh;
  res = {};
  vh.forEach(function(h, i) {
    var key;
    key = fn(h[key_field]);
    if (res[key] == undefined) {
      res[key] = {};
    }
    res[key].push(h);
  });
  return res;
}

function flat(v) {return v.reduce(function(a, b) {return a.concat(b);}, []);};

function fmap(v, f) {return v.reduce(function(a, b) {return a.concat(b);}, []).map(f);};

function cut_last(s) {
  if (s == '') return s;
  return s.substr(0, s.length - 1);
}

//::Int -> Stirng
function n_to_a1(a) {//RC -> A1
  var asc1,asc2, m, p, first;
  n = a - 1;
  p = n % 26;
  m = (n - p) / 26;
  asc2 = ('A'.charCodeAt(0)) + p ;
  first = m ? String.fromCharCode(('A'.charCodeAt(0)) + (m - 1)) : '';
  return  first + String.fromCharCode(asc2);
}

//::String -> Int
function a1_to_n(s) {
  var n, i, d, sum, base;
  sum = 0;base = 26;
  n = s.length;
  for (i = 0;i < n;i++) {
    d = s.charCodeAt(i) - 'A'.charCodeAt(0) + 1;
    sum += Math.pow(base, n - i - 1) * d;
  }
  return sum;
}

max = function(arr) {return Math.max.apply(null, arr);};
function identity(x) {return x;};

//::String -> String
function cdr(s) {return s.substr(-s.length + 1);};