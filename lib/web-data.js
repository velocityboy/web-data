'use babel';

import { CompositeDisposable } from 'atom';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';

export default {

  subscriptions: null,
  messages: null,



  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:url-decode': () => this.urldecode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:url-encode': () => this.urlencode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:json-prettyprint': () => this.jsonPrettyPrint()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:split-query-params': () => this.splitQueryParams()
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
