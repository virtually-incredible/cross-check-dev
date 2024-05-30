var get = {};

get.statusMap = function(sheet, data_row, ancor_idx, status_idx, statusRegex) {
  const m  = sheet.getDataRange().getValues().slice(data_row - 1);
  const res = {};
  m.forEach(r => {
    const company_name = r[ancor_idx].trim();
    const status = r[status_idx];
    if (statusRegex.test(status)) {
      res[company_name] = status;
    }
  });
  return res;
};

get.subscriptionMap = function({source_sheet = get.sheet('sources'), statusesRegex, adapters, year}) {
  const {depMap, servicesCodesMap, pivotTableCodesMap } = get.departmentsMap(source_sheet, adapters, year, statusesRegex);
  const subMap = {};
  _.keys(pivotTableCodesMap).forEach(code => {
    blow(subMap, code, []);
    for (const name in servicesCodesMap) {
      const codeMap = servicesCodesMap[name];
      if (def(codeMap[code])) {
        subMap[code].push(depMap[name]);
      }
    }
  });
  return subMap;
};

get.vaMap = function(source_sheet = get.sheet('sources'), va_source_sheet = get.sheet('VA sources')) {
  const zs = ssa.get_vh(source_sheet);
  const url = zs.filter(x => x['Department'] === 'VAS')[0]['Url'];
  const ss = SpreadsheetApp.openByUrl(url);
  const xs = ssa.get_vh(va_source_sheet);
  const attempt = get.nameToVaMap(ss, xs, year, adapters);
  return attempt;
};

get.originalMap = function(sources) {
  const x = sources.filter(x => x['Department'] === 'HQ')[0];
  const ss = SpreadsheetApp.openByUrl(x['Url']);
  const tab = ss.getSheetByName(x['Tab name']);
  const ancorIdx = a1_to_n(x['Ancor column']) - 1;
  const subIdx = a1_to_n(x['Subscriptions column']) - 1;
  const vaIdx = a1_to_n(x['Active VAs column']) - 1;
  const res = {};
  const m = tab.getDataRange().getValues().slice(x['Data row'] - 1);
  m.forEach(r => {
    const ancor = r[ancorIdx].trim();
    if (ancor !== '') {
      res[ancor] = {subscriptions : r[subIdx], q_of_va : r[vaIdx]};
    }
  });
  return res;
};

//::VASourceSheet->Year->Eihter Error NameToVaMap
get.nameToVaMap = function(ss, xs, year, adapters) {
  let x, tab;
  x = xs.filter(x => x['Source name'] === 'assistants')[0];
  tab = ss.getSheetByName(x['Tab'].replace('{{Year}}', year));
  const tempVaMap = get.codeToVaMap(tab,x['Data row'] );

  x = xs.filter(x => x['Source name'] === 'clients')[0];
  tab = ss.getSheetByName(x['Tab'].replace('{{Year}}', year));

  const codeToNameMap = get.codeToNameMap(tab, x['Data row'], x['Code column'], x['Company column']);
  return gen.nameToVaMap(tempVaMap, codeToNameMap, adapters['VAS']);
};

get.codeToNameMap = function(client_sheet, data_row, code_column, company_column) {
  const m = client_sheet.getDataRange().getValues().slice(data_row - 1);
  const codeToNameMap = {};
  const codeIdx = a1_to_n(code_column) - 1;
  const companyNameIdx = a1_to_n(company_column) - 1;
  m.forEach(r => {
    const code = r[codeIdx].trim();
    const name = r[companyNameIdx].trim();
    codeToNameMap[code] = name;
  });
  return codeToNameMap;
};

get.codeToVaMap = function(va_sheet, data_row) {
  const vs = ssa.get_vh(va_sheet, data_row - 1);
  const tempVaMap = {};
  vs.forEach(x => {
    const code = x['Code'].trim();
    if (code !== '') {
      blow(tempVaMap, code, []);
      const name = x['VA Name\n(Full Name)'];
      const date = x['VA Live Date'];
      tempVaMap[code].push({name, date});
    }
  });
  return tempVaMap;
};

get.departmentsMap = function(sheet, adapters, year, statusesRegex) {
  sheet = sheet || get.sheet('sources');
  const xs = ssa.get_vh(sheet);
  const depMap = {};
  let servicesCodesMap = {};
  let pivotTableCodesMap = {};
  xs.forEach(x => {
    const ss = SpreadsheetApp.openByUrl(x['Url']);
    const source_sheet = ss.getSheetByName(x['Tab name'].replace('{{Year}}', year));
    let m = source_sheet.getDataRange().getValues().slice(x['Data row'] - 1);
    if (!x['Pivot']) {
      m = m.filter(r => statusesRegex.test(r[1]));
    }
    const idx = a1_to_n(x['Ancor column']) - 1;
    let ps = m.map((r, i)  => [r[idx].trim(), i]).filter(p => p[0] !== '');
    if (x['Pivot']) {
      const codesMap = _.object(ps);
      pivotTableCodesMap = codesMap;
    } else {
      const sheetName = x['Spreadsheet name'];
      const dep = x['Department'];
      ps = ps.map(p => {
        if (adapters[dep]) {
          const code = adapters[dep][p[0]];
          if (code) {
            return [code, p[1]];
          }
        }
        return p;
      });
      const codesMap = _.object(ps);
      servicesCodesMap[sheetName] = codesMap;
      depMap[sheetName] = dep;
    }
  });
  return {depMap, servicesCodesMap, pivotTableCodesMap};
};

get.accountableStatuses = function(sheet) {
  return _.unzip(sheet.getRange('A1:A').getValues())[0].filter(x => x);
};

get.accountableStatusesRegex = function(sheet) {
  const v = _.unzip(sheet.getRange('A1:A').getValues())[0].filter(x => x).map(x => `^${x.trim()}$`);
  return new RegExp(v.join('|'), 'i');
};

get.sourcesMap = function(sheet) {
  const xs = ssa.get_vh(sheet);
  return vh_to_hh(xs, 'Department');
};

get.adapters = function(sheet) {
  const m = sheet.getDataRange().getValues();
  const deps = m.shift().slice(1);
  const res = {};
  m.forEach(r => {
    const crosscheckName = r[0];
    deps.forEach((dep, i) => {
      const name = r[i + 1];
      if (name) {
        blow(res, dep, {});
        res[dep][name] = crosscheckName;
      }
    });
  });
  return res;
};
/*
  The most usefull function. Actually it is a just a alias to another
*/
//::String->GSheet
get.sheet = function(name) {return SpreadsheetApp.getActive().getSheetByName(name);};

get.config = function() {
  var sheet, m, res;
  sheet = SpreadsheetApp.getActive().getSheetByName('config');
  m = sheet.getDataRange().getValues().slice(1);
  res = {};
  m.forEach(function(r) {res[r[0]] = r[1];});
  return res;
};