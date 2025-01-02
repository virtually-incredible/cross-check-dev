function testRun() {
  displayChanges(null, '2025-01-01');
}

function onOpen() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const dev = scriptProperties.getProperty('dev');
  var submenu = [
    {name : "Get changes", functionName : "get_changes"},
    {name : "Apply changes", functionName : "apply_changes"},

  ];
  if (dev) {
    submenu.push({name : "-- Restore backup", functionName : "restoreBackup"});
    submenu.push({name : "-- Place dev sources", functionName : "replaceSourcesWithDev"});
    submenu.push({name : "-- Place prod sources", functionName : "replaceSourcesWithProd"});
  }

  SpreadsheetApp.getActiveSpreadsheet().addMenu('More actions', submenu);
}

function process_changes(callback) {
  const input = Browser.inputBox("Date input", "Enter processing date in format YYYY-MM-DD:", Browser.Buttons.OK_CANCEL);
  if (input === 'cancel') return;
  const parseRes = validateDate(input);
  if (parseRes === null) {
    SpreadsheetApp.getActive().toast("invalid date.", "Input error", 3);
    return;
  }
  const [year] = parseRes.split("-").map(Number);
  if (checkConsistency(year)) {
    callback(null, parseRes);
  }
}

function get_changes() {
  process_changes(displayChanges);
}

function apply_changes() {
  process_changes(applyChanges);
}