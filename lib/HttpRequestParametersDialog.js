'use babel';

import { CompositeDisposable } from 'atom';

export class HttpRequestParametersDialog {
  url = 'http://example.com/';
  method = null;
  headers = {};
  headersValid = true;
  body = '{}';
  queryParametersValid = true;
  queryParameters = {};
  bodyDiv = null;
  subscriptions = null;
  executeButton = null;

  constructor(container) {
    this.subscriptions = new CompositeDisposable();

    this.addURLEditor(container);
    this.addHeadersEditor(container);
    this.addQueryParametersEditor(container);
    this.addMethodSelector(container);
    this.addBodyEditor(container);
    this.addButtons(container);
  }

  addURLEditor(container) {
    let div = document.createElement('div')
    let label = document.createElement('label');
    label.appendChild(document.createTextNode('URL'));
    div.appendChild(label);
    let editor = document.createElement('atom-text-editor');
    editor.setAttribute('mini', true);

    let model = editor.getModel();
    model.setText(this.url);

    this.subscriptions.add(
      model.onDidChange(() => {
        this.url = model.getText();
      })
    );

    div.appendChild(editor);
    container.appendChild(div);
  }

  addHeadersEditor(container) {
    let warningDiv = document.createElement('div');

    let div = document.createElement('div');
    let label = document.createElement('label');
    label.appendChild(document.createTextNode('Headers'));
    div.appendChild(label);
    let editor = document.createElement('atom-text-editor');
    editor.className = "web-data-editor";

    let model = editor.getModel();
    model.setText("{\n  \"content-type\": \"text/json\"\n}");

    this.subscriptions.add(
      model.onDidChange(() => {
        this.headersValid = true;

        try {
          this.headers = JSON.parse(model.getText());
        } catch (e) {
          this.headersValid = false;
        }

        warningDiv.style.display = (this.headersValid ? 'none' : 'block');
        this.updateExecuteButton();
      })
    );

    div.appendChild(editor);
    container.appendChild(div);

    warningDiv.appendChild(document.createTextNode('Headers must be valid JSON'));
    warningDiv.style.display = 'none';
    container.appendChild(warningDiv);
  }

  addQueryParametersEditor(container) {
    let warningDiv = document.createElement('div');

    let div  = document.createElement('div');
    let label = document.createElement('label');
    label.appendChild(document.createTextNode('Query Parameters'));
    div.appendChild(label);
    let editor = document.createElement('atom-text-editor');
    editor.className = "web-data-editor";

    let model = editor.getModel();
    model.setText("{}");

    this.subscriptions.add(
      model.onDidChange(() => {
        this.queryParametersValid = true;

        try {
          this.queryParameters = JSON.parse(model.getText());
        } catch (e) {
          this.queryParametersValid = false;
        }

        warningDiv.style.display = (this.queryParametersValid ? 'none' : 'block');
        this.updateExecuteButton();
      })
    );

    div.appendChild(editor);
    container.appendChild(div);

    warningDiv.appendChild(document.createTextNode('Query parameters must be valid JSON'));
    warningDiv.style.display = 'none';
    container.appendChild(warningDiv);
  }

  addMethodSelector(container) {
    let methods = {
      GET: 'GET',
      POST: 'POST'
    };

    div = document.createElement('div');
    label = document.createElement('label');
    label.className = 'web-data-inline-label';

    label.appendChild(document.createTextNode('Method'));
    div.appendChild(label);
    let select = document.createElement('select');
    select.onchange = this.onMethodChange;

    for (value in methods) {
      let option = document.createElement('option');
      option.value = value;
      option.appendChild(document.createTextNode(methods[value]));
      select.appendChild(option);
    }

    div.appendChild(select);
    container.appendChild(div);

    this.method = select.selectedOptions[0].value;
  }

  addBodyEditor(container) {
    this.bodyDiv = document.createElement('div');
    label = document.createElement('label');
    label.appendChild(document.createTextNode('Body'));
    this.bodyDiv.appendChild(label);
    editor = document.createElement('atom-text-editor');
    editor.className = "web-data-editor";

    let model = editor.getModel();
    model.setText(this.body);

    this.subscriptions.add(
      model.onDidChange(() => {
        this.body = model.getText();
      })
    );

    this.bodyDiv.appendChild(editor);
    container.appendChild(this.bodyDiv);

    this.bodyDiv.style.display = 'none';
  }

  addButtons(container) {
    let div = document.createElement('div');
    div.className = 'web-data-button-bar';

    let executeButton = document.createElement('button');
    executeButton.className = 'btn btn-primary web-data-button';
    executeButton.onclick = this.onClickExecute;
    executeButton.appendChild(document.createTextNode('Execute'));
    div.appendChild(executeButton);

    let cancelButton = document.createElement('button');
    cancelButton.className = 'btn web-data-button';
    cancelButton.onclick = this.onClickCancel;
    cancelButton.appendChild(document.createTextNode('Cancel'));
    div.appendChild(cancelButton);

    container.appendChild(div);

    this.executeButton = executeButton;
  }

  dispose() {
    this.subscriptions.dispose();
  }

  updateExecuteButton() {
    let executeDisabled = !this.headersValid || !this.queryParametersValid;

    if (executeDisabled) {
      this.executeButton.setAttribute('disabled', 'true');
    } else {
      this.executeButton.removeAttribute('disabled');
    }
  }

  onMethodChange = (e) => {
    this.method = e.target.selectedOptions[0].value;

    if (this.method === 'POST') {
      this.bodyDiv.style.display = 'block';
    } else {
      this.bodyDiv.style.display = 'none';
    }
  }

  onClickCancel = () => {
    if (typeof(this.onCancel) === 'function') {
      this.onCancel();
    }
  }

  onClickExecute = () => {
    if (typeof(this.onExecute) === 'function') {
      this.onExecute();
    }
  }
}
