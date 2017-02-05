'use babel';

import {ScrollView} from 'atom-space-pen-views';
import {Transforms} from './Transforms';
import HttpStatusCodes from './HttpStatusCodes';

WORKSPACE_VIEW_URI = 'atom://web-data/http-response';

class HttpResponseItem extends ScrollView {
  getTitle() {
    return 'HTTP Conversations';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getIconName() {
    return 'file-binary';
  }

  appendResponse(result) {
    let div = this._createContainingDiv();

    if (result.error !== null) {
      this._appendTextLine(
        div,
        'Could not send request -- ' + result.error, 'web-data-response-error'
      );
    } else {
      let response = result.response
      let request = response.request

      let requestDiv = this._createSubitemDiv(div, 'Request', true);

      this._appendTextLine(requestDiv, request.href);
      this._appendHeaderTable(requestDiv, request.headers);

      let responseDiv = this._createSubitemDiv(div, 'Response');
      this._appendStatusCode(responseDiv, response.statusCode);

      this._appendHeaderTable(responseDiv, response.headers);

      let bodyDiv = this._createSubitemDiv(div, 'Response Body');
      let editor = document.createElement('atom-text-editor');
      editor.getModel().setText(result.body);
      bodyDiv.appendChild(editor);

      this._appendDataTransformButtons(bodyDiv, editor);
    }

    this.append(div);
  }

  _createContainingDiv() {
    let div = document.createElement('div');
    div.className = 'web-data-response-item';
    return div;
  }

  _createSubitemDiv(container, title, first = false) {
    let div = document.createElement('div');

    if (!first) {
      div.className = 'web-data-response-subitem-padding';
    }

    this._appendTextLine(
      div,
      title,
      'web-data-response-header'
    );

    container.appendChild(div);

    let subitemContentDiv = document.createElement('div');
    subitemContentDiv.className = 'web-data-subitem-content';
    div.appendChild(subitemContentDiv);
    return subitemContentDiv;
  }

  _appendHeaderTable(container, headers) {
    this._appendTextLine(container, 'Headers', 'web-data-response-subheader');

    let table = document.createElement('table');
    table.className = 'web-data-response-table';
    for (header in headers) {
      let value = headers[header];

      this._appendHeaderRow(table, header, value);
    }
    container.appendChild(table);
  }

  _appendStatusCode(div, code) {
    let status = 'Finished with status ' + code;
    if (code in HttpStatusCodes) {
      status += ' [' + HttpStatusCodes[code] + ']'
    }

    let statusClass = null;
    if (typeof(code) === 'number') {
      if (code >= 100 && code <= 299) {
        statusClass = 'web-data-status-success';
      } else if (code >= 300 && code <= 399) {
        statusClass = 'web-data-status-redirect';
      } else if (code >= 400 && code <= 599) {
        statusClass = 'web-data-status-error';
      }
    }

    this._appendTextLine(div, status, statusClass);
  }

  _appendTextLine(container, text, className = '') {
    let div = document.createElement('div');
    div.className = className;
    div.appendChild(document.createTextNode(text));
    container.appendChild(div);
  }

  _appendHeaderRow(table, key, value) {
    let tr = document.createElement('tr')
    let td = document.createElement('td')
    td.appendChild(document.createTextNode(key))
    tr.appendChild(td)
    td = document.createElement('td')
    td.appendChild(document.createTextNode(value))
    tr.appendChild(td)
    table.appendChild(tr)
  }

  _createButton(title, callback, editor) {
    let button = document.createElement('button');
    button.className = 'btn';
    button.onclick = callback.bind(this, editor.getModel());
    button.appendChild(document.createTextNode(title));
    return button;
  }

  _appendDataTransformButtons(container, editor) {
    let div = document.createElement('div');
    div.className = 'web-data-button-bar';

    div.appendChild(
      this._createButton(
        'pretty-print json',
        Transforms.jsonPrettyPrint,
        editor)
    );

    div.appendChild(
      this._createButton(
        'url decode',
        Transforms.URLDecode,
        editor)
    );

    div.appendChild(
      this._createButton(
        'base64 decode',
        Transforms.base64Decode,
        editor)
    );

    div.appendChild(
      this._createButton(
        'split query params',
        Transforms.splitQueryParams,
        editor)
    );

    container.appendChild(div);
  }
};

HttpResponseItem.content = function() {
  let div = this.div({'class': 'web-data-response-view'});
  return div;
}

module.exports = {
  HttpResponseItem,
  WORKSPACE_VIEW_URI,
}
