'use babel';

import {ScrollView} from 'atom-space-pen-views';

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
    let div = document.createElement('div');
    if (result.error !== null) {
      this._appendTextLine(
        div,
        'Could not send request -- ' + result.error, 'web-data-response-error'
      );
    } else {
      let response = result.response
      this._appendTextLine(
        div,
        'Request finished with status ' + response.statusCode
      );
      this._appendTextLine(div, '=== Response Headers ===');

      let table = document.createElement('table');
      table.className = 'web-data-response-table';
      for (header in response.headers) {
        let value = response.headers[header];

        this._appendHeaderRow(table, header, value);
        div.appendChild(table);
      }

      this._appendTextLine(div, '=== Response Body ===');
      let editor = document.createElement('atom-text-editor');
      editor.getModel().setText(result.body);
      div.appendChild(editor);

      this._appendDataTransformButtons(div, editor);
    }

    div.appendChild(document.createElement('hr'))
    this.append(div);
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
      this._createButton('pretty-print json', this._onJsonPrettyPrint, editor)
    );

    container.appendChild(div);
  }

  _getTextToTransform(editor) {
    let range = editor.getSelectedBufferRange();
    if (range.isEmpty()) {
      editor.selectAll();
    }
    return editor.getSelectedText();
  }

  _onJsonPrettyPrint(editor) {
    let selection = this._getTextToTransform(editor);
    let json;

    try {
      json = JSON.parse(selection);
    } catch(e) {
      return;
    }

    editor.insertText(JSON.stringify(json, null, 4));
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
