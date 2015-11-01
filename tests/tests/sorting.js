/* testing sorting of timbles tables */

QUnit.test( 'Clicking a column header sorts table by that column', function( assert) {
  var $aColumnHeader = $('#kind');
  $aColumnHeader.click();
  assert.ok( $('tbody tr').eq(0).find('td').eq(2).attr('data-value') === 'Adobe PDF document', 'Passed!' );
});


var $noSortColumns = $('.no-sort');
  if ( $noSortColumns.length > 0 ) {
    QUnit.test( 'Header with no-sort class is not sortable', function( assert ) {
    $noSortColumns.click();
    assert.ok( !$noSortColumns.hasClass('sorted-asc') && !$noSortColumns.hasClass('sorted-desc'), 'Passed!' );
  });
}
