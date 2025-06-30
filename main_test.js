function main_test() {
  return jUnit.test_case('General test', {
    'test dsl module' : function() {
      jUnit.assert('dsl tests must be passed',dsl_module_tests());
    },
    'test get module' : function() {
      jUnit.assert('get tests must be passed',get_module_tests());
    },
    'test utils module' : function() {
      jUnit.assert('utils tests must be passed',utils_module_tests());
    },
  });
}