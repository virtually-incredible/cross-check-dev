//2.1 - get_vh takes start row into account
//2.0 - mp module necessary methods implemented internaly

(function () {
  var get_headers,
    append_m,
    put_m,
    clear_matrix,
    insert_matrix,
    tile_sheet,
    get_sheet,
    get_vh,
    get_matrix,
    get_row,
    get_vh,
    get_h,
    remove_rows,
    remove_row,
    remove_excluding,
    put_vh,
    update_vh,
    append_vh,
    append_h,
    append_vh_if_not_included;

  var mp = {};
  mp.vh_to_m = function (vh, headers) {
    var matrix;
    matrix = [];
    vh.forEach(function (h) {
      var keys, row;
      keys = Object.keys(h);
      row = [];
      headers.forEach(function (header) {
        if (~keys.indexOf(header)) {
          row.push(h[header]);
        } else {
          row.push('');
        }
      });
      matrix.push(row);
    });
    return matrix;
  };

  mp.m_to_vh = function (m, headers) {
    //output: vector of hashtables (v_of_h) where keys of the hashes is columns headers
    var v_of_h;
    v_of_h = [];
    m.forEach(function (r) {
      var h;
      h = {};
      headers.forEach(function (item, j) {
        h[item] = r[j];
      });
      v_of_h.push(h);
    });
    return v_of_h;
  };

  clear_data = function (sheet) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
  };

  append_vh = function (sheet, vh) {
    update_vh(sheet, vh, sheet.getLastRow() + 1);
  };

  //--------------- NOT TESTED!!
  append_vh_if_not_included = function (dest_sheet, incoming_vh, str_id) {
    var not_included_vh, included_vh;
    included_vh = get_vh(dest_sheet);
    not_included_vh = [];
    incoming_vh.forEach(function (incoming) {
      included_vh.foeEach(function (included) {
        if (incoming[str_id] == incoming[included]) {
          returt;
        }
        not_included_vh.push(incoming);
      });
    });
    update_vh(dest_sheet, not_included_vh, dest_sheet.getLastRow() + 1);
  };

  append_h = function (sheet, h) {
    ssa.append_vh(sheet, [h]);
  };

  //_______________

  update_vh = function (sheet, vh, row) {
    var headers, m;
    headers = get_headers(sheet);
    m = mp.vh_to_m(vh, headers);
    sheet.getRange(row, 1, m.length, m[0].length).setValues(m);
  };

  //::Sheet must has formal structure of Table
  put_vh = function (sheet, vh) {
    var m, headers, last_row, last_column;
    last_row = sheet.getLastRow();
    last_column = sheet.getLastColumn();
    m = sheet.getRange(1, 1, 1, last_column).getValues();
    headers = m[0];
    m = mp.vh_to_m(vh, headers);
    if (last_row > 1) {
      sheet.getRange(2, 1, last_row - 1, last_column).clearContent();
    }
    sheet.getRange(2, 1, m.length, m[0].length).setValues(m);
  };

  //::GSheet->Int->Int->[Int]->IO()
  remove_excluding = function (sheet, start_row, last_row, idxs) {
    var pos;
    for (pos = last_row; pos >= start_row; pos--) {
      if (idxs.indexOf(pos) == -1) {
        sheet.deleteRow(pos);
      }
    }
  };

  //::GSheet->[Int]->IO()
  remove_rows = function (sheet, idxs) {
    idxs.reverse().forEach(function (idx) {
      sheet.deleteRow(idx);
    });
  };

  remove_row = function (sheet, idx) {
    ssa.remove_rows(sheet, [idx]);
  };

  //::Sheet must has formal structure of Table
  get_vh = function (sheet, start_row = 1) {
    var m, headers;
    m = sheet
      .getDataRange()
      .getValues()
      .slice(start_row - 1);
    headers = m[0];
    m.shift();
    if (ndef(m[0])) return []; //corner case - no data on the sheet;
    return mp.m_to_vh(m, headers, true);
  };

  get_h = function (sheet, row_index) {
    if (!sheet || !row_index) {
      return undefined;
    }
    if (row_index == 1) {
      SpreadsheetApp.getActive().toast(
        'select another row',
        'header is selected',
        3
      );
      return undefined;
    }
    var headers, needed_row, h;
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    needed_row = sheet
      .getRange(row_index, 1, row_index, sheet.getLastColumn())
      .getValues()[0];
    h = {};
    headers.forEach(function (header, i) {
      h[header] = needed_row[i];
    });
    return h;
  };

  get_row = function (sheet, n) {
    return sheet.getRange(n, 1, 1, sheet.getLastColumn()).getValues()[0];
  };

  get_matrix = function (sheet, start_row, start_column) {
    var range, values, h, w;
    if (start_row == undefined) {
      start_row = 1;
    }
    if (start_column == undefined) {
      start_column = 1;
    }
    h = sheet.getLastRow() - start_row + 1;
    w = sheet.getLastColumn() - start_column + 1;
    if (h == 0 || w == 0) {
      return [[]];
    }
    range = sheet.getRange(start_row, start_column, h, w);
    values = range.getValues();
    return values;
  };

  get_sheet = function (ss, sheet_name) {
    var sheet;
    sheet = ss.getSheetByName(sheet_name);
    if (sheet == null) {
      sheet = ss.insertSheet(sheet_name, 0);
    }
    return sheet;
  };

  tile_sheet = function (sheet, width, height, value) {
    sheet.getRange(1, 1, height, width).setValue(value);
  };

  insert_matrix = function (matrix, sheet, start_row, start_column) {
    var range;
    if (matrix.length) {
      sheet.insertRows(start_row, matrix.length);
      if (start_column == undefined) {
        start_column = 1;
      }
      range = sheet.getRange(
        start_row,
        start_column,
        matrix.length,
        matrix[0].length
      );
      range.setValues(matrix);
    }
  };

  clear_matrix = function (sheet, start_row, start_column) {
    var range, last_row, last_column, h, w;
    last_row = sheet.getLastRow();
    last_column = sheet.getLastColumn();
    if (start_row == undefined) {
      start_row = 1;
    }
    if (start_column == undefined) {
      start_column = 1;
    }
    if (last_row >= start_row && last_column > 0) {
      h = last_row - start_row + 1;
      w = last_column - start_column + 1;
      range = sheet.getRange(start_row, start_column, h, w);
      range.clear();
    }
  };

  put_m = function (matrix, sheet, start_row, start_column) {
    var range;
    if (matrix.length) {
      if (start_row == undefined) {
        start_row = 1;
      }
      if (start_column == undefined) {
        start_column = 1;
      }
      range = sheet.getRange(
        start_row,
        start_column,
        matrix.length,
        matrix[0].length
      );
      range.setValues(matrix);
    }
  };

  append_m = function (matrix, sheet, start_column) {
    var last_row;
    if (matrix.length == 0) return;
    last_row = sheet.getLastRow();
    put_m(matrix, sheet, last_row + 1, start_column);
  };

  get_headers = function (sheet) {
    return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  };

  ss_accessor = {};
  ssa = ss_accessor;
  ssa.update_vh = update_vh;
  ssa.put_vh = put_vh;
  ssa.remove_excluding = remove_excluding;
  ssa.remove_rows = remove_rows;
  ssa.remove_row = remove_row;
  ss_accessor.get_vh = get_vh;
  ss_accessor.get_h = get_h;
  ss_accessor.get_headers = get_headers;
  ss_accessor.get_row = get_row;
  ss_accessor.put_matrix = put_m;
  ss_accessor.get_matrix = get_matrix;
  ss_accessor.clear_matrix = clear_matrix;
  ss_accessor.append_matrix = append_m;
  ss_accessor.insert_matrix = insert_matrix;
  ss_accessor.tile_sheet = tile_sheet;
  ss_accessor.get_sheet = get_sheet;
  ss_accessor.append_vh = append_vh;
  ss_accessor.append_h = append_h;
  ss_accessor.append_vh_if_not_included = append_vh_if_not_included;
})();
