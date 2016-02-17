/**
* timbles.js
* definitely the most lightweight jquery table plugin ever
* except probably not
*
* @version 1.1.0
* @author jenn schiffer http://jennmoney.biz
*/

( function( $ ) {

'use strict';

var pluginName = 'timbles';

var classes = {
  disabled: 'disabled',
  active: 'active',
  headerRow: 'header-row',
  sortASC: 'sorted-asc',
  sortDESC: 'sorted-desc',
  noSort: 'no-sort',
  navigationCurrentPage: 'pointer-this-page',
  navigationLastPage: 'pointer-last-page',
  paginationToolsContainer: 'pagination',
  paginationNavArrows: 'nav-arrows',
  paginationNavRowCountChoice: 'row-count-choice',
  paginationNavigationButton: null,
  paginationRowCountButton: null
};

var copy = {
  firstPageArrow: ' << ',
  prevPageArrow: ' < ',
  nextPageArrow: ' > ',
  lastPageArrow: ' >> ',
  page: 'page',
  of: 'of'
};

var methods = {

  // Initialize timble, er, i mean table //
  init: function( opts ) {
    var options = $.extend( {}, opts );
    var data = {
      classes: $.extend( {}, classes, options.classes ),
      copy: $.extend( {}, copy, options.copy ),
      dataConfig: methods.parseDataConfig( options.dataConfig ),
      sorting: options.sorting,
      pagination: options.pagination
    };
    this.data( pluginName, data ).addClass( pluginName );

    if ( data.dataConfig ) {
      methods.generateTableFromJson.call( this );
    } else {
      methods.setupExistingTable.call( this );
    }
  },

  parseDataConfig: function( dataConfig ) {
    if ( !( dataConfig instanceof Object ) ) {
      return dataConfig;
    } else if ( dataConfig.hasOwnProperty( 'columns' ) ) {
      $.each( dataConfig.columns, function( index, columnConfig ) {
        if ( columnConfig.hasOwnProperty( 'dataFilter' ) &&
             !columnConfig.hasOwnProperty( 'textTransform' ) ) {

          // If a dataFilter is defined (old-style) and no textTransform,
          // use the dataFilter as textTransform
          columnConfig.textTransform = columnConfig.dataFilter;
        } else if ( !columnConfig.hasOwnProperty( 'textTransform' ) ) {

          // Add a do-nothing textTransform if none is provided
          columnConfig.textTransform = function( obj ) { return obj; };
        }
        if ( !columnConfig.hasOwnProperty( 'valueTransform' ) ) {

          // Add a do-nothing valueTransform if none is provided
          columnConfig.valueTransform = function( obj ) { return obj; };
        }
      } );
    }
    return dataConfig;
  },

  setupExistingTable: function() {
    var data = this.data( pluginName );

    // For each header cell, store its column number
    var $headerRow = data.$headerRow = this.find( 'thead tr' ).eq( 0 )
      .addClass( data.classes.headerRow );
    $headerRow.find( 'th' ).each( function( index ) {
      $( this ).data( 'timbles-column-index', index );
    } );

    // Start enabling any given features
    methods.enableFeaturesSetup.call( this );
  },

  generateTableFromJson: function() {
    var data = this.data( pluginName );
    var $headerRow = data.$headerRow = $( '<tr>' )
      .addClass( data.classes.headerRow )
      .appendTo( $( '<thead>' ).appendTo( this ) );

    // Generate and add cell headers to header row
    $.each( data.dataConfig.columns, function( index, value ) {
      $( '<th>' )
        .attr( 'id', value.id )
        .addClass( value.noSorting ? data.classes.noSort : null )
        .data( 'timbles-column-index', index )
        .text( value.label )
        .appendTo( $headerRow );
    } );

    if ( $.isArray( data.dataConfig.data ) ) {

      // No need for ajax call if data is local array
      methods.generateRowsFromData.call( this, data.dataConfig.data, data.dataConfig.columns );

      // Start enabling any given features
      methods.enableFeaturesSetup.call( this );
    } else {

      // Get external json file given
      $.getJSON( data.dataConfig.data, function( json ) {
        methods.generateRowsFromData.call( this, json, data.dataConfig.columns );
      }.bind( this ) ).then( function() {

        // Start enabling any given features
        methods.enableFeaturesSetup.call( this );
      }.bind( this ) );
    }
  },

  generateRowsFromData: function( rowData, columnConfig ) {
    $.each( rowData, function( index, row ) {

      // Add rows to the current table
      var $newRow = $( '<tr>' ).appendTo( this );
      $.each( columnConfig, function( index, column ) {

        // Add cells to the current row
        var cellValue = row[ column.id ];
        $( '<td>' )
          .attr( 'data-value', column.valueTransform( cellValue ) )
          .text( column.textTransform( cellValue ) )
          .appendTo( this );
      }.bind( $newRow ) );
    }.bind( this ) );
  },

  enableFeaturesSetup: function() {
    var data = this.data( pluginName );
    data.tableRows = this.find( 'tbody tr' ).get();

    if ( data.sorting ) {
      methods.enableSorting.call( this );

      if ( data.sorting.keyId ) {
        methods.sortColumn.call( this, data.sorting.keyId, data.sorting.order );
      }
    }

    if ( data.pagination ) {
      methods.enablePagination.call( this, data.pagination.recordsPerPage );
    }
  },

  enableSorting: function() {
    this.find( 'th' ).not( '.no-sort' ).on(
      'click', methods.sortColumnEvent.bind( this ) );
  },

  sortColumn: function( key, order ) {

    // Sort a column identified by its key in a given order
    // If `key` is numeric, it is treated as the column index to sort
    // If `order` is not given, this will do the same as clicking the header
    if ( typeof key === 'number' ) {
      var data = this.data( pluginName );
      data.$headerRow.find( 'th' ).eq( key ).trigger( 'click', order );
    } else {
      this.find( '#' + key ).trigger( 'click', order );
    }
  },

  sortColumnEvent: function( event, order ) {
    var data = this.data( pluginName );

    // Determine order and update header sort classes
    var $sortHeader = $( event.target );
    var sortColumn = $sortHeader.data( 'timbles-column-index' );

    if ( !order ) {
      order = $sortHeader.hasClass( data.classes.sortASC ) ? 'desc' : 'asc';
    }
    data.$headerRow.find( 'th' )
      .removeClass( data.classes.sortASC )
      .removeClass( data.classes.sortDESC );
    $sortHeader.addClass( ( order === 'asc' ) ? data.classes.sortASC : data.classes.sortDESC );

    // Determine column values to actually sort by
    var sortMap = $.map( data.tableRows, function( row ) {
      var cell = row.children[ sortColumn ];
      var dataValue = cell.getAttribute( 'data-value' );
      if ( dataValue === null ) {
        dataValue = cell.textContent || cell.innerText || '';
      } else if ( parseFloat( dataValue ).toString() === dataValue ) {
        dataValue = parseFloat( dataValue );
      }
      return {
        node: row,
        value: dataValue
      };
    } );

    // Sort the mapping by the extract column values
    sortMap.sort( function( a, b ) {
      if ( a.value > b.value ) {
        return ( order === 'asc' ) ? 1 : -1;
      }
      if ( a.value < b.value ) {
        return ( order === 'asc' ) ? -1 : 1;
      }
      return 0;
    } );

    // Create new canonical row set sorted based on sortMap
    data.tableRows = $.map( sortMap, function( row ) {
      return row.node;
    } );

    if ( data.pagination ) {

      // If table was paginated, load content for first page
      methods.goToPage.call( this, 1 );
    } else {

      // If not, add sorted rows in order (on detached body for performance)
      var tableBody = this.find( 'tbody' ).detach().get( 0 );
      $.each( data.tableRows, function() {
        tableBody.appendChild( this );
      } );
      this.append( tableBody );
    }
  },

  enablePagination: function( count ) {
    var data = this.data( pluginName );

    // Without records, abandon pagination. Without pagination config, create empty
    if ( !data.tableRows || data.tableRows.length === 0 ) {
      return;
    } else if ( !data.pagination ) {
      data.pagination = {};
    }

    // Update pagination page size and count
    data.pagination.currentPage = 1;
    data.pagination.recordsPerPage = count;
    data.pagination.lastPage = Math.ceil( data.tableRows.length / count );

    // Create tools if they don't exist yet
    if ( !data.$paginationToolsContainer ) {
      methods.generatePaginationTools.call( this );
    }

    // Actually place records for the first page
    methods.goToPage.call( this, 1 );
  },

  generatePaginationTools: function() {
    var data = this.data( pluginName );

    data.$paginationToolsContainer = $( '<div>' )
      .addClass( data.classes.paginationToolsContainer )
      .insertAfter( this );

    if ( !data.pagination.nav ) {

      // If no pagination is configured, default to showing arrows only
      methods.generatePaginationNavArrows.call( this );
    } else {
      for ( var navObject in data.pagination.nav ) {
        switch ( navObject ) {
          case 'arrows':
            methods.generatePaginationNavArrows.call( this );
            break;
          case 'rowCountChoice':
            methods.generatePaginationNavRowCountChoice.call( this );
            break;
        }
      }
    }
    methods.updatePaginationTools.call( this );
  },

  generatePaginationNavArrows: function() {
    var data = this.data( pluginName );
    var $navButton = $( '<button>' )
      .attr( 'type', 'button' )
      .toggleClass(
        data.classes.paginationNavigationButton,
        data.classes.paginationNavigationButton );

    data.$linkFirstPage = $navButton.clone().text( data.copy.firstPageArrow );
    data.$linkPrevPage = $navButton.clone().text( data.copy.prevPageArrow );
    data.$linkNextPage = $navButton.clone().text( data.copy.nextPageArrow );
    data.$linkLastPage = $navButton.clone().text( data.copy.lastPageArrow );
    data.$pointerThisPage = $( '<span>' )
        .addClass( classes.navigationCurrentPage )
        .text( data.pagination.currentPage );
    data.$pointerLastPage = $( '<span>' )
        .addClass( classes.navigationLastPage )
        .text( data.pagination.lastPage );
    var $pageNumberTracker = $( '<span>' )
      .addClass( 'page-number-tracker' )
      .text( data.copy.page + ' ' )
      .append( data.$pointerThisPage )
      .append( ' ' + data.copy.of + ' ' )
      .append( data.$pointerLastPage );

    $( '<div>' )
      .addClass( data.classes.paginationNavArrows )
      .append( data.$linkFirstPage )
      .append( data.$linkPrevPage )
      .append( $pageNumberTracker )
      .append( data.$linkNextPage )
      .append( data.$linkLastPage )
      .appendTo( data.$paginationToolsContainer );

    // Register event listeners
    data.$linkFirstPage.on( 'click', function() {
      methods.goToPage.call( this, 1 );
    }.bind( this ) );

    data.$linkPrevPage.on( 'click', function() {
      if ( data.pagination.currentPage > 1 ) {
        methods.goToPage.call( this, data.pagination.currentPage - 1 );
      }
    }.bind( this ) );

    data.$linkNextPage.on( 'click', function() {
      if ( data.pagination.currentPage < data.pagination.lastPage ) {
        methods.goToPage.call( this, data.pagination.currentPage + 1 );
      }
    }.bind( this ) );

    data.$linkLastPage.on( 'click', function() {
      methods.goToPage.call( this, data.pagination.lastPage );
    }.bind( this ) );
  },

  generatePaginationNavRowCountChoice: function() {
    var pageSizeChangeEvent, pageSizeSelection;
    var data = this.data( pluginName );

    pageSizeSelection = $( '<div>' )
      .addClass( data.classes.paginationNavRowCountChoice )
      .appendTo( data.$paginationToolsContainer );

    pageSizeChangeEvent = function( event ) {
      var $target = $( event.target ).addClass( data.classes.active );
      $target.siblings().removeClass( data.classes.active );
      var pageSize = $target.text();

      if ( pageSize.toLowerCase() === 'all' ) {
        pageSize = data.tableRows.length;
      }

      methods.enablePagination.call( this, parseInt( pageSize ) );
    }.bind( this );

    $.each( data.pagination.nav.rowCountChoice, function() {
      $( '<button>' )
        .attr( 'type', 'button' )
        .on( 'click', pageSizeChangeEvent )
        .text( this )
        .toggleClass( data.classes.active, data.pagination.recordsPerPage === this )
        .toggleClass(
          data.classes.paginationRowCountButton,
          data.classes.paginationRowCountButton )
        .appendTo( pageSizeSelection );
    } );
  },

  updatePaginationTools: function() {
    var data = this.data( pluginName );

    function toggleButtons( buttons, disabled ) {
      $.each( buttons, function() {
        this.toggleClass( data.classes.disabled, disabled );
        this.attr( 'disabled', disabled );
      } );
    }

    // Set buttons inactive if appropriate
    toggleButtons(
      [ data.$linkFirstPage, data.$linkPrevPage ],
      data.pagination.currentPage === 1 );
    toggleButtons(
      [ data.$linkLastPage, data.$linkNextPage ],
      data.pagination.currentPage === data.pagination.lastPage );

    // Update page number tracker
    data.$pointerThisPage.text( data.pagination.currentPage );
    data.$pointerLastPage.text( data.pagination.lastPage );
  },

  goToPage: function( page ) {
    var data = this.data( pluginName );
    var newFirstRowNum = ( page - 1 ) * data.pagination.recordsPerPage;
    var newLastRowNum = Math.min(
      newFirstRowNum + data.pagination.recordsPerPage,
      data.tableRows.length );

    // Check for valid page number
    if ( page < 1 || page > data.pagination.lastPage ) {
      return;
    }

    // Update page number and display page's rows
    data.pagination.currentPage = page;
    this.find( 'tbody tr' ).remove();
    this.find( 'tbody' ).append(
      data.tableRows.slice( newFirstRowNum, newLastRowNum ) );

    // Update pagination tools
    methods.updatePaginationTools.call( this );
  }
};

// Install timbles jQuery plugin
$.fn[ pluginName ] = function( method ) {
  if ( $.isPlainObject( method ) || method === undefined ) {
    return this.each( function() {
      methods.init.call( $( this ), method );
    } );
  } else if ( methods.hasOwnProperty( method ) ) {
    var actualMethod = methods[ method ];
    var methodArgs = Array.prototype.slice.call( arguments, 1 );
    return this.each( function() {
      actualMethod.apply( $( this ), methodArgs );
    } );
  }
  $.error( 'The method ' + method + ' literally does not exist. Good job.' );
};

} )( jQuery );
