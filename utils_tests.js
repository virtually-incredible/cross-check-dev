function utils_module_tests() {
  return test_validate_date();
}

function test_validate_date() {
  return jUnit.test_case('', {
    'test date validation': function () {
      const ds = ['2024-01-01', '2024-02-30', 'YYYY-MM-DD', '2000-01-02'];
      const rs = [true, false, false, false];
      ds.forEach((d, i) => {
        const res = validateDate(d);
        jUnit.assert_eq(d === res, rs[i]);
      });
    },
  });
}
