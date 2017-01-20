'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:url-decode': () => this.urldecode()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'web-data:url-encode': () => this.urlencode()
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
  }
};
