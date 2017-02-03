{ScrollView} = require 'atom-space-pen-views';

WORKSPACE_VIEW_URI = 'atom://web-data/http-response'

class HttpResponseItem extends ScrollView
  @content: (responses) ->
    @div class: 'web-data-response-view', ""

  getTitle: ->
    'HTTP Conversations'

  getURI: ->
    WORKSPACE_VIEW_URI

  appendTextLine: (container, text, className = '') ->
    div = document.createElement('div')
    div.className = className
    div.appendChild(document.createTextNode(text))
    container.appendChild(div)

  appendHeaderRow: (table, key, value) ->
    tr = document.createElement('tr')
    td = document.createElement('td')
    td.appendChild(document.createTextNode(key))
    tr.appendChild(td)
    td = document.createElement('td')
    td.appendChild(document.createTextNode(value))
    tr.appendChild(td)
    table.appendChild(tr)


  appendResponse: (result) ->
    div = document.createElement('div')
    if result.error != null
      @appendTextLine div, 'Could not send request -- ' + result.error, 'web-data-response-error'
    else
      response = result.response
      @appendTextLine div, 'Request finished with status ' + response.statusCode
      @appendTextLine div, '=== Response Headers ==='

      table = document.createElement('table')
      table.className = 'web-data-response-table'
      for header, value of response.headers
        @appendHeaderRow table, header, value

      div.appendChild(table)

      @appendTextLine div, '=== Response Body ==='
      editor = document.createElement('atom-text-editor');
      editor.getModel().setText(result.body);
      div.appendChild(editor);

    div.appendChild(document.createElement('hr'))
    @append div

module.exports = {
  WORKSPACE_VIEW_URI,
  HttpResponseItem
};
