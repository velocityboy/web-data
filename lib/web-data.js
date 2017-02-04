'use babel';

import { Disposable, CompositeDisposable } from 'atom';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';
import { HttpRequestParametersDialog } from './HttpRequestParametersDialog';
import { HttpRequestController } from './HttpRequestController';
import { Base64 } from 'js-base64';
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
        'web-data:url-decode': () => this.urldecode()
      }),
      atom.commands.add('atom-workspace', {
        'web-data:url-encode': () => this.urlencode()
      }),
      atom.commands.add('atom-workspace', {
        'web-data:base64-decode': () => this.base64decode()
      }),
      atom.commands.add('atom-workspace', {
        'web-data:base64-encode': () => this.base64encode()
      }),
      atom.commands.add('atom-workspace', {
        'web-data:json-prettyprint': () => this.jsonPrettyPrint()
      }),
      atom.commands.add('atom-workspace', {
        'web-data:split-query-params': () => this.splitQueryParams()
      }),
      atom.commands.add('atom-workspace', {
        'web-data:do-request': () => this.doRequest()
      }),
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  urldecode() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      Transforms.URLDecode(editor);
    }
  },

  urlencode() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      Transforms.URLEncode(editor);
    }
  },

  base64decode() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      editor.insertText(Base64.decode(selection));
    }
  },

  base64encode() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      let base64 = Base64.encode(selection);
      let insert = '';
      while (base64.length > 76) {
        insert += base64.substr(0, 76) + "\n";
        base64 = base64.substr(76);
      }

      if (base64 !== '') {
        insert += base64 + "\n";
      }

      editor.insertText(insert);
    }
  },

  jsonPrettyPrint() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      if (!Transforms.jsonPrettyPrint(editor)) {
        this._webDataAddMessage("Selection does not contain valid JSON");
      }
    }
  },

  splitQueryParams() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();

      selection = selection.replace(/[?&]/g, "\n");
      editor.insertText(selection);
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
  },

  _webDataAddMessage(message) {
    let messages = this._webDataMessages();
    messages.attach();
    messages.add(new PlainMessageView({
      message: message
    }));
  },

  _webDataMessages() {
    if (this.messages === null) {
      this.messages = new MessagePanelView({
        title: "Web Data",
      });
    }

    return this.messages;
  }
};
