/* testing pagination of timbles tables */

QUnit.test( 'Correct Number of Table Rows Showing on Page', function( assert ) {
  var numRows = $('table').find('tr').length;
  console.log('# rows altogether', numRows);
  assert.ok( numRows === 4, 'Passed!' );
}); 

QUnit.test( 'Detect single Header Row', function( assert ) {
  var numRows = $('table').find('tr.header-row').length;
  console.log('# header rows', numRows);
  assert.ok( numRows === 1, 'Passed!' );
}); 

QUnit.test( 'Correct Number of Non-header Record Rows', function( assert ) {
  var numRows = $('table').find('tr').not('.header-row').length;
  console.log('# records', numRows);
  assert.ok( numRows === 3, 'Passed!' );
});