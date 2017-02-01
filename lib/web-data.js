'use babel';

import { Disposable, CompositeDisposable } from 'atom';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';
import { HttpRequestParametersDialog } from './HttpRequestParametersDialog';
import { HttpRequestController } from './HttpRequestController';
import { Base64 } from 'js-base64';

const WORKSPACE_VIEW_URI = 'atom://web-data/HTTPResponse';

export default {
  subscriptions: null,
  messages: null,
  httpParametersDialog: null,
  responseEditor: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:url-decode': () => this.urldecode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:url-encode': () => this.urlencode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:base64-decode': () => this.base64decode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:base64-encode': () => this.base64encode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:json-prettyprint': () => this.jsonPrettyPrint()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:split-query-params': () => this.splitQueryParams()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:do-request': () => this.doRequest()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  urldecode() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      editor.insertText(unescape(selection));
    }
  },

  urlencode() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      editor.insertText(escape(selection));
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
      while (base64.length > 76) {
        let line = base64.substr(0, 76);
        base64 = base64.substr(76);
        editor.insertText(line + "\n");
      }

      if (base64 !== '') {
        editor.insertText(base64 + "\n");
      }
    }
  },

  jsonPrettyPrint() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText();
      let json;

      try {
        json = JSON.parse(selection);
      } catch(e) {
        this._webDataAddMessage("Selection does not contain valid JSON");
        return;
      }

      editor.insertText(JSON.stringify(json, null, 4));
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
      this._httpResponseEditor().then(
        (editor) => {
          HttpRequestController(editor, contents);
        }
      );
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

  _httpResponseEditor() {
    if (this.responseEditor === null) {
      return new Promise(
        (resolve, reject) => {
          atom.workspace.open(WORKSPACE_VIEW_URI)
          .then(
            (editor) => {
              this.responseEditor = editor;
              resolve(editor);
            },
            (reason) => {
              reject(editor);
            }
          )
        }
      );
    }

    return new Promise(
      (resolve, reject) => {
        resolve(this.responseEditor);
      }
    );
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
