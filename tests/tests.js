QUnit.test( "Correct Number of Table Rows", function( assert ) {
  var numRows = $('table').find('tr').length;
  assert.ok( numRows == "9", "Passed!" );
}); 

QUnit.test( "Detect single Header Row", function( assert ) {
  var numRows = $('table').find('tr.header-row').length;
  assert.ok( numRows == "1", "Passed!" );
}); 

QUnit.test( "Correct Number of Non-header Record Rows", function( assert ) {
  var numRows = $('table').find('tr').not('.header-row').length;
  assert.ok( numRows == "8", "Passed!" );
});

QUnit.test( "Header with no-sort class is not sortable", function( assert ) {
  var $noSortColumns = $('.no-sort');
  $noSortColumns.click();
  assert.ok( !$noSortColumns.hasClass('sorted-asc') && !$noSortColumns.hasClass('sorted-desc'), "Passed!" );
});