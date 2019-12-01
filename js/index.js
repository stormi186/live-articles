/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// when the window loads we clear the localStorage and invoke loadMore() function to populate first 10 rows of the table
window.onload = function()
{
  window.localStorage.clear()
  loadMore()
}

/* loadMore() function adds 5 rows to the table and increments the localStorage
we store in localStorage number of rows user wants to see */
function loadMore() {
  if (!localStorage.getItem('rows')) localStorage.setItem('rows', 11)
  else localStorage.setItem('rows', parseInt(localStorage.getItem('rows')) + 5)
  $('table tr').slice(0, parseInt(localStorage.getItem('rows'))).show()
}

function getFormattedDate(dateToFormat) {
  var date = new Date(dateToFormat)
  var year = date.getFullYear()

  var month = (1 + date.getMonth()).toString()
  month = month.length > 1 ? month : '0' + month

  var day = date.getDate().toString()
  day = day.length > 1 ? day : '0' + day

  return day + '.' + month + '.' + year + '.'
}

/* when the user connects we get the number of total users with io.engine.clientsCount
which is emitted in data.users on totalUsers event. We get and emit data using socket.io
on updating event and then create the table using the articles data*/

var socket = io.connect('http://localhost:3000')

socket.on('totalUsers', function(data){
  $('#online-users').html('Online users: '+ data.users)
})

socket.on('updating', function(data){
  var html = '<table id="articleTable">'
  html += '<thead><tr>'
  let names = Object.keys(data.articles[0])
  for(var i = 1; i < names.length-1; i++) {
    html += '<th id="' + names[i] + '-head">' + names[i].charAt(0).toUpperCase() +
    names[i].slice(1) + ' <i class="fas fa-long-arrow-alt-down"></i>' + '</th>'
  }
  html += '</tr></thead></tbody>'
  for(var k = 0; k < data.articles.length; k++) {
    html += '<tr>'
    for(var j in data.articles[k]) {
      if (j==='published') html += '<td>' + getFormattedDate(data.articles[k][j]) + '</td>'
      else if(j!=='_id' && j!=='__v') html += '<td>' + data.articles[k][j] + '</td>'
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  document.getElementById('tableContainer').innerHTML = html

  // each time we update data we show the same number of rows that user selected
  $('table tr').slice(0, parseInt(localStorage.getItem('rows'))).show()

  /* if the number of incremented rows to show is bigger than the actual number of articles we set that
  number to the maximum which is number of articles*/
  if (localStorage.getItem('rows') > data.articles.length) localStorage.setItem('rows', data.articles.length + 1)

  $('#articles-count').html('Showing ' + (localStorage.getItem('rows')-1) + ' of ' + data.articles.length)

  //we make the table sortable by invoking makeSortable function
  TableSorter.makeSortable(document.getElementById('articleTable'))

  /* we store the chosen sorting option into localStorage and trigger a click to sort the table
  if no option is selected we could set to sort by title */
  if (localStorage.getItem('sort')) document.getElementById(localStorage.getItem('sort')).click()
  // else document.getElementById('title-head').click()
})

function openForm() {
  document.getElementById('loginPopup').style.display='block'
}

function closeForm() {
  document.getElementById('loginPopup').style.display='none'
}

// when the user clicks anywhere outside of the form, close it
window.onclick = function(event) {
  var modal = document.getElementById('loginPopup')
  if (event.target === modal) {
    closeForm()
  }
}

var TableSorter = {
  makeSortable: function(table){
    // Store context of this in the object
    var _this = this
    var th = table.tHead, i
    th && (th = th.rows[0]) && (th = th.cells)

    if (th){
      i = th.length
    } else {
      return // if no `<thead>` then do nothing
    }

    // Loop through every <th> inside the header
    while (--i >= 0) (function (i) {
      var dir = 1

      // Append click listener to sort
      th[i].addEventListener('click', function () {
        _this._sort(table, i, (dir = 1 - dir))
        localStorage.setItem('sort', th[i].id)
      })
    }(i))
  },
  _sort: function (table, col, reverse) {
    var tb = table.tBodies[0], // use `<tbody>` to ignore `<thead>` and `<tfoot>` rows
      tr = Array.prototype.slice.call(tb.rows, 0) // put rows into array

    reverse = -((+reverse) || -1)

    // Sort rows
    tr = tr.sort(function (a, b) {
      return reverse * (
      // Using `.textContent.trim()` for test
        a.cells[col].textContent.trim().localeCompare(
          b.cells[col].textContent.trim()
        )
      )
    })

    for(var i = 0; i < tr.length; ++i){
      // Append rows in new order
      tb.appendChild(tr[i])
    }
  }
}