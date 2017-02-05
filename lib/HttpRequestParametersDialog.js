'use babel';

import { CompositeDisposable } from 'atom';

export class HttpRequestParametersDialog {
  url = 'http://www.example.com/';
  method = 'GET';

  headers = {};
  headersValid = true;

  queryParameters = {};
  queryParametersValid = true;

  formDataDiv = null;
  formData = {};
  formDataValid = true;

  subscriptions = null;
  executeButton = null;

  constructor(container) {
    this.subscriptions = new CompositeDisposable();

    this._addURLEditor(container);
    this._addHeadersEditor(container);
    this._addQueryParametersEditor(container);
    this._addMethodSelector(container);
    this._addFormDataEditor(container);
    this._addButtons(container);
  }

  _addURLEditor(container) {
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

  _addValidatingEditor(container, fieldName, warningText, defaultValue, onChange) {
    let warningDiv = document.createElement('div');

    let div = document.createElement('div');
    let label = document.createElement('label');
    label.appendChild(document.createTextNode(fieldName));
    div.appendChild(label);
    let editor = document.createElement('atom-text-editor');
    editor.className = "web-data-editor";

    let model = editor.getModel();
    model.setText(defaultValue);

    this.subscriptions.add(
      model.onDidChange(() => {
        let valid = onChange(model.getText());
        warningDiv.style.display = (valid ? 'none' : 'block');
        this.updateExecuteButton();
      })
    );

    div.appendChild(editor);
    container.appendChild(div);

    warningDiv.appendChild(document.createTextNode(warningText));
    warningDiv.style.display = 'none';
    container.appendChild(warningDiv);

    return div;
  }

  _addHeadersEditor(container) {
    this._addValidatingEditor(
      container,
      'Headers',
      'Headers must be valid JSON',
      "{\n  \"content-type\": \"text/json\"\n}",
      (newText) => {
        this.headersValid = true;

        try {
          this.headers = JSON.parse(newText);
        } catch (e) {
          this.headersValid = false;
        }

        return this.headersValid;
      }
    )
  }

  _addQueryParametersEditor(container) {
    this._addValidatingEditor(
      container,
      'Query Parameters',
      'Query parameters must be valid JSON',
      "{}",
      (newText) => {
        this.queryParametersValid = true;

        try {
          this.queryParameters = JSON.parse(newText);
        } catch (e) {
          this.queryParametersValid = false;
        }

        return this.queryParametersValid;
      }
    )
  }

  _addMethodSelector(container) {
    let methods = {
      GET: 'GET',
      POST: 'POST'
    };

    div = document.createElement('div');
    label = document.createElement('label');
    label.className = 'web-data-inline-label';

    label.appendChild(document.createTextNode('Method'));
    div.appendChild(label);

    let selectContainer = document.createElement('div');
    selectContainer.className = 'web-data-select-container';

    let select = document.createElement('select');
    select.className = 'web-data-select';
    select.onchange = this._onMethodChange;

    for (value in methods) {
      let option = document.createElement('option');
      option.value = value;
      option.appendChild(document.createTextNode(methods[value]));
      select.appendChild(option);
    }

    selectContainer.appendChild(select);
    div.appendChild(selectContainer);
    container.appendChild(div);

    this.method = select.selectedOptions[0].value;
  }

  _addFormDataEditor(container) {
    this.formDataDiv = this._addValidatingEditor(
      container,
      'Form Data',
      'Form data must be valid JSON',
      "{}",
      (newText) => {
        this.formDataValid = true;

        try {
          this.formData = JSON.parse(newText);
        } catch (e) {
          this.formDataValid = false;
        }

        return this.formDataValid;
      }
    )

    this.formDataDiv.style.display = 'none';
  }

  _addButtons(container) {
    let div = document.createElement('div');
    div.className = 'web-data-button-bar';

    let executeButton = document.createElement('button');
    executeButton.className = 'btn btn-primary';
    executeButton.onclick = this._onClickExecute;
    executeButton.appendChild(document.createTextNode('Execute'));
    div.appendChild(executeButton);

    let cancelButton = document.createElement('button');
    cancelButton.className = 'btn';
    cancelButton.onclick = this._onClickCancel;
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

    if (!executeDisabled && this.method === 'POST' && !this.formDataValid) {
      executeDisabled = true;
    }

    if (executeDisabled) {
      this.executeButton.setAttribute('disabled', 'true');
    } else {
      this.executeButton.removeAttribute('disabled');
    }
  }

  _onMethodChange = (e) => {
    this.method = e.target.selectedOptions[0].value;

    if (this.method === 'POST') {
      this.formDataDiv.style.display = 'block';
    } else {
      this.formDataDiv.style.display = 'none';
    }
  }

  _onClickCancel = () => {
    if (typeof(this.onCancel) === 'function') {
      this.onCancel();
    }
  }

  _onClickExecute = () => {
    if (typeof(this.onExecute) === 'function') {
      this.onExecute();
    }
  }
}
