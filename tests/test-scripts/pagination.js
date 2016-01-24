/* Testing pagination of timbles tables */

var target = $( '#target' );

function pageContent() {
  /* Returns the records shown on the current page of the table
   */
  return target.find( 'tbody td' ).map( function() {
    return $( this ).text();
  } ).get();
}

/* Tests of the initial state
 *
 */

QUnit.test( 'Verify pagination configuration', function( assert ) {
  var data = target.data( 'timbles' );
  assert.equal( data.tableRows.length, 26, 'Correct data size' );
  assert.equal( data.pagination.recordsPerPage, 5, 'Correct page size' );
} );

QUnit.test( 'Verify first page content', function( assert ) {
  var expectedPageContent = [
    'Atsugi',
    'Batman',
    'Calamba',
    'Dharan',
    'Empangeni'
  ];
  assert.deepEqual(
    pageContent(),
    expectedPageContent,
    'Correct content and length for page'
  );
} );

QUnit.test( 'Page navigation is shown after the table', function( assert ) {
  var paginationContainer = target.next();
  assert.ok(
    paginationContainer.hasClass( 'pagination' ),
    'Navigation block has correct class'
  );
} );

QUnit.test( 'Correct current page number ...', function( assert ) {
  var paginationData = target.data( 'timbles' ).pagination;
  assert.equal( paginationData.currentPage, 1, '... in data attribute' );

  var pageNumber = target.next().find( '.pointer-this-page' );
  assert.equal( pageNumber.text(), '1', '... in page navigation block' );
} );

QUnit.test( 'Correct number of total pages ...', function( assert ) {
  var paginationData = target.data( 'timbles' ).pagination;
  assert.equal( paginationData.lastPage, 6, '... in data attribute' );

  var pageNumber = target.next().find( '.pointer-last-page' );
  assert.equal( pageNumber.text(), '6', '... in page navigation block' );
} );

/* Tests of navigation and related behavior
 *
 */

QUnit.test( 'Go to second page by clicking nav button', function( assert ) {
  var pageNavigation = target.next().find( '.nav-arrows' );
  var nextPageButton = pageNavigation.find( 'button' ).eq( 2 );
  assert.equal( nextPageButton.text().trim(), '>', 'Button has correct text' );

  nextPageButton.trigger( 'click' );

  var paginationData = target.data( 'timbles' ).pagination;
  var pageNumber = pageNavigation.find( '.pointer-this-page' );
  var expectedPageContent = [
    'Funabashi',
    'Guaymas',
    'Himeji',
    'Ikorodu',
    'Jacksonville'
  ];
  assert.equal( paginationData.currentPage, 2, 'Correct page number in data' );
  assert.equal( pageNumber.text(), '2', 'Correct page number on page' );
  assert.deepEqual(
    pageContent(),
    expectedPageContent,
    'Correct content and length for page'
  );
} );

QUnit.test( 'Go to page by using goToPage method', function( assert ) {
  var paginationData = target.data( 'timbles' ).pagination;
  var pageNumber = target.next().find( '.pointer-this-page' );
  var expectedPageContent = [ 'Zacatecas' ];

  target.timbles( 'goToPage', 6 );
  assert.equal( paginationData.currentPage, 6, 'Correct page number in data' );
  assert.equal( pageNumber.text(), '6', 'Correct page number on page' );
  assert.deepEqual(
    pageContent(),
    expectedPageContent,
    'Correct content and length for page'
  );
} );

QUnit.test( 'Sorting resets to first page', function( assert ) {
  target.timbles( 'sortColumn', 0, 'desc' );

  var paginationData = target.data( 'timbles' ).pagination;
  var pageNumber = target.next().find( '.pointer-this-page' );
  var expectedPageContent = [
    'Zacatecas',
    'Yakutsk',
    'Xico',
    'Winston-Salem',
    'Verona'
  ];
  assert.equal( paginationData.currentPage, 1, 'Correct page number in data' );
  assert.equal( pageNumber.text(), '1', 'Correct page number on page' );
  assert.deepEqual(
    pageContent(),
    expectedPageContent,
    'First page content in descending order'
  );
} );

/* Tests for changing the page size
 *
 */

QUnit.test( 'Shrinking page size removes rows and update nav ', function( assert ) {
  var paginationData = target.data( 'timbles' ).pagination;
  var pageNumber = target.next().find( '.pointer-last-page' );
  var expectedPageContent = [
    'Zacatecas',
    'Yakutsk'
  ];
  target.timbles( 'enablePagination', 2 );
  assert.equal( paginationData.lastPage, 13, 'Correct page count in data' );
  assert.equal( pageNumber.text(), '13', 'Correct page count on page' );
  deepEqual(
    pageContent(),
    expectedPageContent,
    'Correct content and length for page'
  );
} );

QUnit.test( 'Growing page size updates table and maintains order ', function( assert ) {
  var paginationData = target.data( 'timbles' ).pagination;
  var pageNumber = target.next().find( '.pointer-last-page' );
  var expectedPageContent = [
    'Zacatecas',
    'Yakutsk',
    'Xico',
    'Winston-Salem',
    'Verona',
    'Uruapan',
    'Tsuruoka',
    'Sokoto',
    'Richmond',
    'Qom'
  ];
  target.timbles( 'enablePagination', 10 );
  assert.equal( paginationData.lastPage, 3, 'Correct page count in data' );
  assert.equal( pageNumber.text(), '3', 'Correct page count on page' );
  deepEqual(
    pageContent(),
    expectedPageContent,
    'Correct content and length for page'
  );
} );
