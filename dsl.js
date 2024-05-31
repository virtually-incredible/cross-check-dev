function collectData({today = new Date(), status_sheet = get.sheet('accountable statuses'), adapter_sheet = get.sheet('adapters'),source_sheet = get.sheet('sources'), va_source_sheet = get.sheet('VA sources')} ) {
  const todayIso8601d = today.toISOString().split('T')[0];
  const year = today.getFullYear();
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
  const vaMap = get.nameToVaMap(ss, xs, year, adapters).right;
  //TODO: process failure
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
          return castToIso8601d(x.date, tz) <= todayIso8601d;
        });
        agents = active_agents.length;
      }
    }
    res[company_name] = {subscriptions, agents, status : statusMap[company_name]};
  });
  return res;
}

function checkConsistency() {
  const ss = SpreadsheetApp.getActive();
  const statusesRegex = get.accountableStatusesRegex(get.sheet('accountable statuses'));
  const sheet = get.sheet('sources');
  const year = new Date().getFullYear();
  const adapters = get.adapters(get.sheet('adapters'));
  const res = get.departmentsMap(sheet, adapters, year, statusesRegex);
  const {depMap, servicesCodesMap, pivotTableCodesMap } = res;
  const m = _.keys(servicesCodesMap).map(serviceName => {
    const codes = _.keys(servicesCodesMap[serviceName]);
    return codes.map(code => [ndef(pivotTableCodesMap[code]), serviceName, code]).filter(p => p[0]).map(p => p.slice(1));
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
  if (m_.length > 1) ss.toast('Some inconsistency in company names detected. Please check "consistency" tab');
}