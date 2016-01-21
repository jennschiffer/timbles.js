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

var defaults = {
  sortKey : null,
  sortOrder : null,
};

var classes = {
  disabled : 'disabled',
  active : 'active',
  headerRow : 'header-row',
  label : 'label',
  sortASC : 'sorted-asc',
  sortDESC : 'sorted-desc',
  noSort : 'no-sort',
  paginationToolsContainer : 'pagination',
  paginationNavArrows : 'nav-arrows',
  paginationNavRowCountChoice : 'row-count-choice'
};

var copy = {
  firstPageArrow : ' << ',
  prevPageArrow : ' < ',
  nextPageArrow : ' > ',
  lastPageArrow : ' >> ',
  page : 'page',
  of : 'of'
};

var methods = {

  /** initialize timble, er, i mean table **/
  init : function(opts) {
    return this.each(function() {
      var $this = $(this).addClass(pluginName);
      var options = $.extend({}, defaults, opts);
      var data = {
        dataConfig: methods.parseDataConfig(options.dataConfig),
        sorting: options.sorting,
        pagination: options.pagination,
      };
      $this.data(pluginName, data);

      if ( data.dataConfig ) {
        // generate table from JSON
        methods.generateTableFromJson.call($this);
      }
      else {
        // set up existing html table
        methods.setupExistingTable.call($this);
      }
    });
  },

  parseDataConfig : function(dataConfig) {
    if (!(dataConfig instanceof Object)) {
      return dataConfig;
    }
    else if (dataConfig.hasOwnProperty('columns')) {
      $.each(dataConfig.columns, function(index, columnConfig) {
        if (columnConfig.hasOwnProperty('dataFilter') &&
            !columnConfig.hasOwnProperty('textTransform')) {
          // If a dataFilter is defined (old-style) and no textTransform,
          // use the dataFilter as textTransform
          columnConfig.textTransform = columnConfig.dataFilter;
        }
        else if (!columnConfig.hasOwnProperty('textTransform')) {
          // Add a do-nothing textTransform if none is provided
          columnConfig.textTransform = function (obj) {return obj;};
        }
        if (!columnConfig.hasOwnProperty('valueTransform')) {
          // Add a do-nothing valueTransform if none is provided
          columnConfig.valueTransform = function (obj) {return obj;};
        }
      });
    }
    return dataConfig;
  },

  setupExistingTable : function() {
    var data = this.data(pluginName);

    // for each header cell, store its column number
    var $headerRow = data.$headerRow = this.find('thead tr').eq(0)
      .addClass(classes.headerRow);
    $headerRow.find('th').each(function(index) {
      $(this).data('timbles-column-index', index);
    });

    // start enabling any given features
    methods.enableFeaturesSetup.call(this);
  },

  generateTableFromJson : function() {
    var data = this.data(pluginName);
    var $headerRow = data.$headerRow = $('<tr>')
      .addClass(classes.headerRow)
      .appendTo($('<thead>').appendTo(this));

    // generate and add cell headers to header row
    $.each(data.dataConfig.columns, function(index, value) {
      $('<th>')
        .attr('id', value.id)
        .addClass(value.noSorting ? classes.noSort : null)
        .data('timbles-column-index', index)
        .text(value.label)
        .appendTo($headerRow);
    });

    if ($.isArray(data.dataConfig.data)) {
      // no need for ajax call if data is local array
      methods.generateRowsFromData.call(this, data.dataConfig.data, data.dataConfig.columns);

      // start enabling any given features
      methods.enableFeaturesSetup.call(this);
    }
    else {
      // get external json file given
      $.getJSON( data.dataConfig.data, function(json) {
        methods.generateRowsFromData.call(this, json, data.dataConfig.columns);
      }.bind(this)).then(function(){
        // start enabling any given features
        methods.enableFeaturesSetup.call(this);
      }.bind(this));
    }
  },

  generateRowsFromData : function(rowData, columnConfig) {
    $.each(rowData, function(index, row) {
      // Add rows to the current table
      var $newRow = $('<tr>').appendTo(this);
      $.each(columnConfig, function(index, column) {
        // Add cells to the current row
        var cellValue = row[column.id];
        $('<td>')
          .attr('data-value', column.valueTransform(cellValue))
          .text(column.textTransform(cellValue))
          .appendTo(this);
      }.bind($newRow));
    }.bind(this));
  },

  enableFeaturesSetup : function() {
    var data = this.data(pluginName);
    data.$records = this.find('tbody tr');

    if ( data.sorting ) {
      methods.enableSorting.call(this);

      if ( data.sorting.keyId ) {
        methods.sortColumn.call(this, data.sorting.keyId, data.sorting.order);
      }
    }

    if ( data.pagination ) {
      methods.enablePagination.call(this, data.pagination.recordsPerPage);
    }
  },

  enableSorting : function() {
    this.find('th').not('.no-sort').on(
      'click', methods.sortColumnEvent.bind(this));
  },

  sortColumn : function(key, order) {
    // Sort a column identified by its key in a given order
    // If `key` is numeric, it is treated as the column index to sort
    // If `order` is not given, this will do the same as clicking the header
    if (typeof key === "number") {
      var data = this.data(pluginName);
      data.$headerRow.find('th').eq(key).trigger('click', order);
    }
    else {
      this.find('#' + key).trigger('click', order);
    }
  },

  sortColumnEvent : function(event, order) {
    var data = this.data(pluginName);

    // determine order and update header sort classes
    var $sortHeader = $(event.target);
    var sortColumn = $sortHeader.data('timbles-column-index');

    if ( !order ) {
      order = $sortHeader.hasClass(classes.sortASC) ? 'desc' : 'asc';
    }
    data.$headerRow.find('th')
      .removeClass(classes.sortASC)
      .removeClass(classes.sortDESC);
    $sortHeader.addClass((order === 'asc') ? classes.sortASC : classes.sortDESC);

    // determine column values to actually sort by
    var sortMap = data.$records.map(function() {
      var cell = this.children[sortColumn];
      var dataValue = cell.getAttribute('data-value');
      if (dataValue === null) {
        dataValue = cell.textContent || cell.innerText;
      }
      else if (parseFloat(dataValue).toString() === dataValue) {
        dataValue = parseFloat(dataValue);
      }
      return {
        node: this,
        value: dataValue
      };
    });

    // sort the mapping by the extract column values
    sortMap.sort(function(a, b) {
      if (a.value > b.value) {
        return (order === 'asc') ? 1 : -1;
      }
      if (a.value < b.value) {
        return (order === 'asc') ? -1 : 1;
      }
      return 0;
    });

    // use sortMap to shuffle table rows to the correct order
    // work on detached DOM for improved performance on large tables
    var tableBody = this.find('tbody').detach().get(0);
    sortMap.each(function() {
      tableBody.appendChild(this.node);
    });

    $(tableBody).appendTo(this);

    // if table was paginated, reenable
    if ( data.pagination ) {
      data.$records = this.find('tbody tr');
      methods.goToPage.call(this, 1);
    }
  },

  enablePagination : function(count) {
    var data = this.data(pluginName);
    // don't paginate if there are no records
    if (!data.$records || data.$records.length === 0 ) { return; }

    // Update pagination page size and count
    data.pagination.currentPage = 1;
    data.pagination.recordsPerPage = count;
    data.pagination.lastPage = Math.ceil(data.$records.length / count);

    // Create tools if they don't exist yet
    if ( !data.$paginationToolsContainer ) {
      methods.generatePaginationTools.call(this);
    }

    // Actually place records for the first page
    methods.goToPage.call(this, 1);
  },

  generatePaginationTools : function() {
    var data = this.data(pluginName);

    data.$paginationToolsContainer = $('<div>')
      .addClass(classes.paginationToolsContainer)
      .insertAfter(this);

    if ( !data.pagination.nav ) {
      // by default, just show arrow nav
      methods.generatePaginationNavArrows.call(this);
    }
    else {
      // iterate through nav object and add tools to footer
      for ( var navObject in data.pagination.nav ) {
        switch (navObject) {
          // arrows
          case "arrows":
            methods.generatePaginationNavArrows.call(this);
            break;
          // row count choice
          case "rowCountChoice":
            methods.generatePaginationNavRowCountChoice.call(this);
            break;
        }
      }
    }

    // update tools
    methods.updatePaginationTools.call(this);
  },

  generatePaginationNavArrows : function() {
    var data = this.data(pluginName);

    data.$linkFirstPage = $('<button role="button">').text(copy.firstPageArrow);
    data.$linkPrevPage = $('<button role="button">').text(copy.prevPageArrow);
    data.$linkNextPage = $('<button role="button">').text(copy.nextPageArrow);
    data.$linkLastPage = $('<button role="button">').text(copy.lastPageArrow);
    var $pageNumberTracker = $('<span>')
      .addClass('page-number-tracker')
      .text(copy.page + ' ')
      .append($('<span>').addClass('pointer-this-page').text(data.pagination.currentPage))
      .append(' ' + copy.of + ' ')
      .append($('<span>').addClass('pointer-last-page').text(data.pagination.lastPage));

    data.$pointerThisPage = $pageNumberTracker.find('.pointer-this-page');
    data.$pointerLastPage = $pageNumberTracker.find('.pointer-last-page');
    $('<div>')
      .addClass(classes.paginationNavArrows)
      .append(data.$linkFirstPage)
      .append(data.$linkPrevPage)
      .append($pageNumberTracker)
      .append(data.$linkNextPage)
      .append(data.$linkLastPage)
      .appendTo(data.$paginationToolsContainer);

    // event listeners
    data.$linkFirstPage.click(function(){
      methods.goToPage.call(this, 1);
    }.bind(this));

    data.$linkPrevPage.click(function(){
      if ( data.pagination.currentPage > 1) {
        methods.goToPage.call(this, data.pagination.currentPage - 1);
      }
    }.bind(this));

    data.$linkNextPage.click(function(){
      if ( data.pagination.currentPage < data.pagination.lastPage ) {
        methods.goToPage.call(this, data.pagination.currentPage + 1);
      }
    }.bind(this));

    data.$linkLastPage.click(function(){
      methods.goToPage.call(this, data.pagination.lastPage);
    }.bind(this));
  },

  generatePaginationNavRowCountChoice : function() {
    var pageSizeChangeEvent, pageSizeSelection;
    var data = this.data(pluginName);

    pageSizeSelection = $('<div>')
      .addClass(classes.paginationNavRowCountChoice)
      .appendTo(data.$paginationToolsContainer);

    pageSizeChangeEvent = function(event) {
      var $target = $(event.target).addClass(classes.active)
      $target.siblings().removeClass(classes.active);
      var pageSize = $target.text();

      if ( pageSize.toLowerCase() === 'all' ) {
        pageSize = data.$records.length;
      }

      methods.enablePagination.call(this, parseInt(pageSize));
    }.bind(this);

    $.each(data.pagination.nav.rowCountChoice, function() {
      $('<button>')
        .attr('role', 'button')
        .text(this)
        .on('click', pageSizeChangeEvent)
        .appendTo(pageSizeSelection);
    });
  },

  updatePaginationTools : function() {
    var data = this.data(pluginName);

    function toggleButtons(disabled, buttons) {
      $.each(buttons, function() {
        var classToggler = (disabled) ? this.addClass : this.removeClass;
        classToggler(classes.disabled);
        this.attr('disabled', disabled);
      });
    }
    // set buttons inactive if appropriate
    toggleButtons(
      data.pagination.currentPage === 1,
      [data.$linkFirstPage, data.$linkPrevPage]);
    toggleButtons(
      data.pagination.currentPage === data.pagination.lastPage,
      [data.$linkLastPage, data.$linkNextPage]);

    // update page number tracker
    data.$pointerThisPage.text(data.pagination.currentPage);
    data.$pointerLastPage.text(data.pagination.lastPage);
  },

  goToPage : function(page) {
    var data = this.data(pluginName);
    var newFirstRowNum = (page - 1) * data.pagination.recordsPerPage;
    var newLastRowNum = Math.min(
      newFirstRowNum + data.pagination.recordsPerPage,
      data.$records.length);

    // check for valid page number
    if ( page < 1 || page > data.pagination.lastPage ) {
      return;
    }

    // update page number and display page's rows
    data.pagination.currentPage = page;
    data.$records.remove();
    this.find('tbody').append(
      data.$records.slice(newFirstRowNum, newLastRowNum));

    // update pagination tools
    methods.updatePaginationTools.call(this);
  },
};

// Install timbles jQuery plugin
$.fn[pluginName] = function (method) {
  if ( methods.hasOwnProperty(method) ) {
    var methodArgs = Array.prototype.slice.call(arguments, 1);
    return methods[method].apply(this, methodArgs);
  }
  if ( typeof method === 'object' || !method ) {
    return methods.init.apply(this, arguments);
  }
  $.error('The method ' + method + ' literally does not exist. Good job.');
};

} )( jQuery );
