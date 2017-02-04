'use babel';

import { Disposable, CompositeDisposable } from 'atom';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';
import { HttpRequestParametersDialog } from './HttpRequestParametersDialog';
import { HttpRequestController } from './HttpRequestController';
import { HttpResponseItem, WORKSPACE_VIEW_URI } from './HttpResponseItem';
import { Transforms } from './Transforms';

export default {
  subscriptions: null,
  messages: null,
  httpParametersDialog: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'web-data:url-decode': (e) => this._xform(Transforms.URLDecode, e)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:url-encode': (e) => this._xform(Transforms.URLEncode, e)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:base64-decode': (e) => this._xform(Transforms.base64Decode, e)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:base64-encode': (e) => this._xform(Transforms.base64Encode, e)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:json-prettyprint': (e) => this._xform(Transforms.jsonPrettyPrint, e)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:split-query-params': (e) => this._xform(Transforms.splitQueryParams, e)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:do-request': () => this._doRequest()
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  _xform(fn, e) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      fn(editor);
    } else if (editor = this._findContainingEditor(e.target)) {
      fn(editor);
    }
  },

  _findContainingEditor(e) {
    for (; e; e = e.parentElement) {
      if (e.tagName === 'ATOM-TEXT-EDITOR') {
        return e.getModel();
      }
    }
    return null;
  },

  _doRequest() {
    let dialog = this._httpParametersDialog();
    dialog.show();
  },

  _httpParametersDialog() {
    if (this.httpParametersDialog) {
      return this.httpParametersDialog;
    }

    const container = document.createElement('div');
    const dialog = atom.workspace.addModalPanel({
      item: container,
      visible: false
    });

    contents = new HttpRequestParametersDialog(container);
    contents.onCancel = () => {
      dialog.hide();
    }

    contents.onExecute = () => {
      dialog.hide();
      HttpRequestController(contents)
        .then((result) => {
          this._buildHttpResponsePane(result);
        });
    }

    this.subscriptions.add(
      new Disposable(() => {
        contents.dispose();
        dialog.destroy();
        this.httpParametersDialog = null;
      })
    );

    this.httpParametersDialog = dialog;
    return this.httpParametersDialog;
  },

  _buildHttpResponsePane(response) {
    let pane = atom.workspace.getActivePane();
    let item = pane.itemForURI(WORKSPACE_VIEW_URI);

    if (!item) {
      item = new HttpResponseItem();
      pane.addItem(item)
    }

    item.appendResponse(response);
    pane.activateItem(item);
  }
};
