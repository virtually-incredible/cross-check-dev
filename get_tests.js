function get_module_tests() {
  return (
    test_get_adapters() &&
    test_get_asregex() &&
    test_get_departments_map() &&
    test_get_code_to_va_map() &&
    test_get_code_to_name_map() &&
    test_get_name_to_va_map() &&
    test_get_billing_ignore() &&
    test_get_not_unique_fees() &&
    test_get_subscription_map() &&
    test_get_status_map() &&
    test_get_original_map()
  );
}

function test_get_not_unique_fees() {
  return jUnit.test_case('', {
    'test getting fees that are not unique': function () {
      var sheet = tt.ds('0.12');
      var res = get.not_unique_fees(sheet);
      jUnit.assert_eq_num(5, res.length);
      jUnit.assert_eq('Home Property Management', res[0][0]);
      jUnit.assert_eq('Qwest Property Management', res[1][0]);
      jUnit.assert_eq('Key Renter Metro Property Management', res[2][0]);
      jUnit.assert_eq('KRG Property Management LLC', res[3][0]);
      jUnit.assert_eq('RPM TriState Area', res[4][0]);

      sheet = tt.ds('0.10');
      res = get.not_unique_fees(sheet);
      jUnit.assert_eq_num(0, res.length);
    },
  });
}

function test_get_billing_ignore() {
  return jUnit.test_case('', {
    'test getting billing statuses to ignore': function () {
      var sheet = tt.ds('0.9');
      var res = get.billingIgnore(sheet);
      jUnit.assert_eq_num(2, res.length);
      jUnit.assert_eq('NEW Cancellation', res[0]);
      jUnit.assert_eq('INACTIVE', res[1]);
    },
  });
}

function test_get_subscription_map() {
  return jUnit.test_case('', {
    'test getting subscription map': function () {
      var res;
      const source_sheet = tt.ds('0.6');
      const status_sheet = tt.ds('0.2');
      const adapter_sheet = tt.ds('0.5');
      const adapters = get.adapters(adapter_sheet);
      const statusesRegex = get.accountableStatusesRegex(status_sheet);
      const FULL_SUB = ['PT', 'VSS', 'VAS'];
      const PT_VSS = ['PT', 'VSS'];
      const PT_ONLY = ['PT'];
      const VSS_ONLY = ['VSS'];
      const VAS_ONLY = ['VAS'];
      res = get.subscriptionMap({
        source_sheet,
        statusesRegex,
        adapters,
        year: 2024,
      });
      jUnit.assert_eq_num(241, _.keys(res).length);
      jUnit.assert_eq_num(
        0,
        _.difference(res['Home Property Management'], FULL_SUB).length
      );
      jUnit.assert_eq_num(
        0,
        _.difference(res['1836 Property Management'], PT_VSS).length
      );
      jUnit.assert_eq_num(
        0,
        _.difference(res['Real Estate Opportunities'], PT_ONLY).length
      );
      jUnit.assert_eq_num(
        0,
        _.difference(res['Innovative Property Solutions'], VSS_ONLY).length
      );
      jUnit.assert_eq_num(
        0,
        _.difference(res['Pointer Ridge Management'], VAS_ONLY).length
      );

      res = get.subscriptionMap({
        source_sheet,
        statusesRegex,
        adapters,
        year: 2024,
        pivotNumber: 2,
      });
      jUnit.assert_eq_num(
        0,
        _.difference(res['RPM Palm Beach County'], PT_ONLY).length
      );
      jUnit.assert_eq_num(0, _.difference(res['AW Manage'], FULL_SUB).length);
    },
  });
}

function test_get_status_map() {
  return jUnit.test_case('', {
    'test getting status map': function () {
      const sheet = tt.ds('0.4');
      const statusesRegex = get.accountableStatusesRegex(tt.ds('0.2'));
      const res = get.statusMap(
        sheet,
        4,
        a1_to_n('D') - 1,
        a1_to_n('B') - 1,
        statusesRegex
      );
      jUnit.assert_eq_num(66, _.keys(res).length);
      jUnit.assert_eq('Active', res['Home Property Management']);
    },
  });
}

function test_get_original_map() {
  return jUnit.test_case('', {
    'test getting map of main tracker values': function () {
      const sources = ssa.get_vh(tt.ds('0.1'));
      const res = get.originalMap(sources);
      jUnit.assert_eq_num(241, _.keys(res).length);
    },
  });
}

function test_get_name_to_va_map() {
  return jUnit.test_case('', {
    'test getting company name to va map': function () {
      const url = ssa
        .get_vh(tt.ds('0.1'))
        .filter((x) => x['Department'] === 'VAS')[0]['Url'];
      const ss = SpreadsheetApp.openByUrl(url);
      const sheet = get.sheet('VA sources');
      const xs = ssa.get_vh(sheet);
      const adapters = get.adapters(tt.ds('0.8'));
      const res = get.nameToVaMap(ss, xs, 2024, adapters);
      jUnit.assert_true(res.right);
      jUnit.assert_eq_num(3, res.right['Home Property Management'].length);
      jUnit.assert_eq_num(1, res.right['Platinum Holdings'].length);
      jUnit.assert_eq_num(5, res.right['KAG'].length); //adapter must be applied
    },
  });
}

function test_get_code_to_name_map() {
  return jUnit.test_case('', {
    'test getting code to company name map': function () {
      const sheet = tt.ds('0.4');
      const res = get.codeToNameMap(sheet, 4, 'C', 'D');
      jUnit.assert_eq_num(70, _.keys(res).length);
      jUnit.assert_eq('Home Property Management', res['HPM']);
    },
  });
}

function test_get_code_to_va_map() {
  return jUnit.test_case('', {
    'test getting code to va map': function () {
      const sheet = tt.ds('0.3');
      const res = get.codeToVaMap(sheet, 2);
      jUnit.assert_eq_num(61, _.keys(res).length);
      jUnit.assert_eq_num(5, res['KG'].length);
      jUnit.assert_eq_num(3, res['HPM'].length);
    },
  });
}

function test_get_departments_map() {
  return jUnit.test_case('', {
    'test getting department map': function () {
      var res;
      const sheet = tt.ds('0.1');
      const adapters = {};
      const accountableStatusesRegex = get.accountableStatusesRegex(
        tt.ds('0.2')
      );
      res = get.departmentsMap(sheet, adapters, 2024, accountableStatusesRegex);
      jUnit.assert_eq(3, _.keys(res['servicesCodesMap']).length);
      jUnit.assert_eq_num(
        0,
        res['servicesCodesMap']['PHONE TENDERS CLIENT LIST dev'][
          'Home Property Management'
        ]
      );
      res = get.departmentsMap(
        sheet,
        adapters,
        2024,
        accountableStatusesRegex,
        2
      );
      jUnit.assert_eq_num(
        273,
        res['pivotTableCodesMap']['Pioneer Management OR']
      );
    },
  });
}

function test_get_asregex() {
  return jUnit.test_case('', {
    'test getting accountable statuses regex': function () {
      const sheet = get.sheet('accountable statuses');
      const res = get.accountableStatusesRegex(sheet);
      jUnit.assert_true(res.test('active'));
      jUnit.assert_true(res.test('Active'));
      jUnit.assert_false(res.test('activ'));
    },
  });
}

function test_get_adapters() {
  return jUnit.test_case('', {
    'test getting adapters': function () {
      const sheet = tt.ds('0.8');
      const res = get.adapters(sheet);
      jUnit.assert_eq('KAG', res['VAS']['Kelly and Grant']);
    },
  });
}
