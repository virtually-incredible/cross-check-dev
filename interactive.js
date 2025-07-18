function testRun() {
  displayChanges(null, '2025-01-01');
}

function onOpen() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const dev = Number(scriptProperties.getProperty('dev'));
  var submenu = [
    { name: 'Get changes', functionName: 'get_changes' },
    { name: 'Apply changes', functionName: 'apply_changes' },
    {
      name: 'Check billing consistency',
      functionName: 'check_billing_consistency',
    },
    {
      name: 'Get billing changes',
      functionName: 'displayBillingChanges',
    },
    {
      name: 'Apply billing changes',
      functionName: 'apply_billing_changes',
    },
  ];
  if (dev) {
    submenu.push({ name: '-- Restore backup', functionName: 'restoreBackup' });
    submenu.push({
      name: '-- Place dev sources',
      functionName: 'replaceSourcesWithDev',
    });
    submenu.push({
      name: '-- Place prod sources',
      functionName: 'replaceSourcesWithProd',
    });
  }

  SpreadsheetApp.getActiveSpreadsheet().addMenu('More actions', submenu);
}

function process_billing_changes(callback) {
  var source_sheet = get.sheet('sources');
  var x = ssa.get_vh(source_sheet).filter((x) => x['Pivot'] === 2)[0];
  const originSheet = SpreadsheetApp.openByUrl(x['Url']).getSheetByName(
    x['Tab name']
  );
  const today = new Date();
  const year = today.getFullYear();
  const iso8601d = to_iso8601(today);

  if (checkConsistency(source_sheet, year, false, 2)) {
    callback(iso8601d, originSheet);
  }
}

function apply_billing_changes() {
  var today = new Date();
  var iso8601d = to_iso8601(today);
  var attempt = collectData({ today: iso8601d, pivotNumber: 2 });
  if (attempt.left) {
    console.log(attempt.left);
    return;
  }
  var dataMap = attempt.right;
  var source_sheet = get.sheet('sources');
  var x = ssa.get_vh(source_sheet).filter((x) => x['Pivot'] === 2)[0];
  const destSheet = SpreadsheetApp.openByUrl(x['Url']).getSheetByName(
    x['Tab name']
  );
  var ignoreList = get.billingIgnore();
  applyBillingChanges(dataMap, ignoreList, destSheet);
}

function check_billing_consistency(source_sheet) {
  const today = new Date();
  const year = today.getFullYear();
  var source_sheet = get.sheet('sources');
  checkConsistency(source_sheet, year, false, 2);
}

function process_changes(callback) {
  var source_sheet = get.sheet('sources');
  var x = ssa.get_vh(source_sheet).filter((x) => x['Pivot'] === 1)[0];
  const originSheet = SpreadsheetApp.openByUrl(x['Url']).getSheetByName(
    x['Tab name']
  );
  const today = new Date();
  const year = today.getFullYear();
  const iso8601d = to_iso8601(today);
  if (checkConsistency(source_sheet, year)) {
    callback(null, iso8601d, originSheet);
  }
}

function get_changes() {
  process_changes(displayChanges);
}

function apply_changes() {
  process_changes(applyChanges);
}
