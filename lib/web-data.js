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
        'web-data:url-decode': () => this.xform(Transforms.URLDecode)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:url-encode': () => this.xform(Transforms.URLEncode)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:base64-decode': () => this.xform(Transforms.base64Decode)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:base64-encode': () => this.xform(Transforms.base64Encode)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:json-prettyprint': () => this.xform(Transforms.jsonPrettyPrint)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:split-query-params': () => this.xform(Transforms.splitQueryParams)
      }),
      atom.commands.add('atom-workspace', {
        'web-data:do-request': () => this.doRequest()
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  xform(fn) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      fn(editor);
    }
  },

  doRequest() {
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
