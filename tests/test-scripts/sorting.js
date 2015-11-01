/* testing sorting of timbles tables */

QUnit.test( 'Clicking a column header sorts table by that column', function( assert) {
  var $aColumnHeader = $('thead tr').eq(0).find('th').eq(2);
  $aColumnHeader.click();
  assert.ok( $('tbody tr').eq(0).find('td').eq(2).text() === 'Adobe PDF document', 'Passed!' );
});


var $noSortColumns = $('.no-sort');
  if ( $noSortColumns.length > 0 ) {
    QUnit.test( 'Header with no-sort class is not sortable', function( assert ) {
    $noSortColumns.click();
    assert.ok( !$noSortColumns.hasClass('sorted-asc') && !$noSortColumns.hasClass('sorted-desc'), 'Passed!' );
  });
}
