function optionalDataCollection(arg, iso8601d) {
  if (arg) {
    return {right: arg}
  } else {
    var attempt = collectData({today:iso8601d});
    if (attempt.left) {
      let message;
      const {type, data, assistantTabName, clientTabName} = attempt.left;
      if (type === 'VA') {
        message = `
        VA service error:
        \\nfollowing codes from '${assistantTabName}' \\n ${attempt.left.data.join("\\n")}
        \\nnot found on '${clientTabName}' tab`
      } else {
        message = attempt.left.message;
      }
      Browser.msgBox(message);
    }
    return attempt;
  }
}


function applyChanges(arg, iso8601d) {
  const dataCollectionAttemp = optionalDataCollection(arg, iso8601d);
  if (dataCollectionAttemp.left) return;
  const results = dataCollectionAttemp.right;
  const originSheet = get.sheet('VI Subscriptions');
  const originM = originSheet.getDataRange().getValues().slice(1);
  const statusRegex = get.accountableStatusesRegex(get.sheet('credit exclusions'));
  //TODO: get columns from sources
  const subCol = a1_to_n('E');
  const vaCol = a1_to_n('H');
  const vaCreditCol = a1_to_n('I');
  originM.forEach((r, i) => {
    const row = i + 2;
    const company_name = r[2].trim();
    if (company_name === '') return;
    if (results[company_name].subscriptions !== undefined) {
      originSheet.getRange(row, subCol).setValue(results[company_name].subscriptions);
    };
    if (results[company_name].agents) {
      originSheet.getRange(row, vaCol).setValue(results[company_name].agents);
    };
    const vaStatus = results[company_name].status ? results[company_name].status : '';
    if (statusRegex.test(vaStatus)) {
      originSheet.getRange(row, vaCreditCol).setValue(0);
    } else {
      originSheet.getRange(row, vaCreditCol).setValue(`=${n_to_a1(vaCol)}${row}*${VA_COST}`);
    }
  });
}

//::{<CompanyName>:{subscriptions, agents, status}}
function displayChanges(arg, iso8601d) {
  const dataCollectionAttemp = optionalDataCollection(arg, iso8601d);
  if (dataCollectionAttemp.left) return;
  const results = dataCollectionAttemp.right;
  const originSheet = get.sheet('VI Subscriptions');
  const originM = originSheet.getDataRange().getValues().slice(1);
  //TODO: get columns from sources
  const subIdx = a1_to_n('E') - 1;
  const vaIdx = a1_to_n('H') - 1;
  const m = originM.map((r, i) => {
    const company_name = r[2].trim();
    if (company_name === '') return null;
    let res = [company_name];
    let changed = false;
    const originSubscriptions = originM[i][subIdx].trim();
    const currentSubscritions = results[company_name].subscriptions;
    if (originSubscriptions !== currentSubscritions) {
      changed = true;
      res = res.concat([originSubscriptions, currentSubscritions]);
    } else {
      res = res.concat(['', '']);
    }
    const originVa = originM[i][vaIdx];
    const currentVa = results[company_name].agents;
    if (originVa !== currentVa) {
      changed = true;
      res = res.concat([originVa, currentVa]);
    } else {
      res = res.concat(['', '']);
    }
    return changed ? res : null;
  }).filter(x => x);
  const dest_sheet = get.sheet('changes');
  const last_row = dest_sheet.getLastRow();
  if (last_row > 1) {
    dest_sheet.getRange(2, 1, last_row - 1, dest_sheet.getLastColumn()).clear();
  }
  if (m.length > 0) {
    dest_sheet.getRange(2, 1, m.length, m[0].length).setValues(m);
  }
}

function collectData({today, status_sheet = get.sheet('accountable statuses'), adapter_sheet = get.sheet('adapters'),source_sheet = get.sheet('sources'), va_source_sheet = get.sheet('VA sources')} ) {
  const todayIso8601d = today;
  const [year] = parseIso8601d(todayIso8601d);
  const statusesRegex = get.accountableStatusesRegex(status_sheet);
  const adapters = get.adapters(adapter_sheet);
  const zs = ssa.get_vh(source_sheet);
  const subMap = get.subscriptionMap({source_sheet, statusesRegex, adapters, year});
  let ss, url, x, sheet, tab;
  x = zs.filter(x => x['Department'] === 'VAS')[0];
  url = x['Url'];
  ss = SpreadsheetApp.openByUrl(url);
  const tz = ss.getSpreadsheetTimeZone();
  const xs = ssa.get_vh(va_source_sheet);
  const result = get.nameToVaMap(ss, xs, year, adapters);
  if (result.left) {
    return result;
  }
  const vaMap = result.right;
  tab = x['Tab name'].replace('{{Year}}', year);
  sheet = ss.getSheetByName(tab);
  const statusMap = get.statusMap(sheet, x['Data row'], a1_to_n(x['Ancor column']) - 1, a1_to_n(x['Status column']) - 1, statusesRegex);

  x =  zs.filter(x => x['Department'] === 'HQ')[0];
  tab = x['Tab name'];
  ss = SpreadsheetApp.openByUrl(x['Url']);
  sheet = ss.getSheetByName(tab);
  const idx = a1_to_n(x['Ancor column']) - 1;
  const cs = sheet.getDataRange().getValues().slice(x['Data row'] - 1).map(r => r[idx].trim());
  const res = {};
  cs.forEach(company_name => {
    let subscriptions = '', agents = 0;
    if (company_name.trim() !== '') {
      if (subMap[company_name] == null || subMap[company_name].length === 0) {
      } else {
        subscriptions = subMap[company_name].join('+');
        //TODO: check other variants
        if (subscriptions === 'VSS+VAS') subscriptions = 'VAS+VSS';
      }
      if (vaMap[company_name]) {
        const active_agents = vaMap[company_name].filter(x => {
          if (typeof x.date === 'string') {
            return false;
          }
          return castToIso8601d(x.date, tz) <= todayIso8601d;
        });
        agents = active_agents.length;
      }
    }
    res[company_name] = {subscriptions, agents, status : statusMap[company_name]};
  });
  return {right: res}
}

function checkConsistency(year = new Date().getFullYear()) {
  const ss = SpreadsheetApp.getActive();
  const statusesRegex = get.accountableStatusesRegex(get.sheet('accountable statuses'));
  const sheet = get.sheet('sources');
  const adapters = get.adapters(get.sheet('adapters'));
  const res = get.departmentsMap(sheet, adapters, year, statusesRegex);
  const {depMap, servicesCodesMap, pivotTableCodesMap } = res;
  const m = _.keys(servicesCodesMap).map(serviceName => {
    const codes = _.keys(servicesCodesMap[serviceName]);
    return codes.map(code => {
      return [ndef(pivotTableCodesMap[code]), serviceName, code];
    }).filter(p => p[0]).map(p => p.slice(1));
  }).flat();
  const sourcesMap = get.sourcesMap(sheet);
  const m_ = m.map(r => {
    const depName = depMap[r[0]];
    const company_name = r[1].trim();
    const link = (sourcesMap[depName]['Url']);
    return [`=HYPERLINK("${link}", "${r[0]}")`, company_name, adapters[company_name]];
  });
  const dest_sheet = get.sheet('consistency');
  dest_sheet.clear();
  m_.unshift(['Tracker', 'Company name', 'Adapter']);
  dest_sheet.getRange(1, 1, m_.length, m_[0].length).setValues(m_);
  if (m_.length > 1) {
    ss.toast('Some inconsistency in company names detected. Please check "consistency" tab');
    return false;
  } else {
    return true;
  }
}