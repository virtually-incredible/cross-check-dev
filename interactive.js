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

function check_billing_consistency() {
  const today = new Date();
  const year = today.getFullYear();
  var source_sheet = get.sheet('sources');
  checkConsistency(source_sheet, year, false, 2);
}

function process_changes(callback) {
  var source_sheet = get.sheet('sources');
  const today = new Date();
  const year = today.getFullYear();
  const iso8601d = to_iso8601(today);
  if (checkConsistency(source_sheet, year)) {
    callback(null, iso8601d);
  }
}

function get_changes() {
  process_changes(displayChanges);
}

function apply_changes() {
  process_changes(applyChanges);
}
