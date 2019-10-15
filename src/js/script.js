(function() {
  'use strict';

  const form = document.getElementById('form');
  const zone = document.getElementById('drop-zone');
  const input = document.getElementById('input');
  const desc = document.getElementById('input-data');
  const content = document.getElementById('content');
  const fieldset = document.getElementById('fieldset');
  const variable = document.getElementById('variable');
  const filename = document.getElementById('filename');
  const output = document.getElementById('output');
  const download = form.querySelector('a');

  function addEventsListener(el, eventNames, listener) {
    const events = eventNames.split(' ');
    for (let i=0, e=events.length; i<e; i++) {
      el.addEventListener(events[i], listener, false);
    }
  }


  function createDOM(prop) {
    const template = `
        <input type="checkbox" id="${prop}" name="properties">
        <label for="${prop}">${prop}</label>`;

    return document.createRange().createContextualFragment(template);
  }

  function handleFile(files) {
    const file = files[0];
    const size = file.size / 1000000;
    const reader = new FileReader();

    desc.textContent = `${file.name} weights ${size}Mb.`;

    reader.onload = (function () {
      return function (e) {
        const geojson = e.target.result;

        content.value = geojson;

        const datas = JSON.parse(geojson);
        const feature = datas.features[0];
        for (let prop in feature.properties) {
          let option = createDOM(prop);
          fieldset.append(option);
        }
      }
    })(file);

    reader.readAsText(file);
  }

  function doNothing(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    handleFile(e.dataTransfer.files);
  }

  addEventsListener(zone, 'drag dragstart dragend dragover dragenter dragleave drop', doNothing);
  addEventsListener(zone, 'dragover dragenter', function () {
    this.classList.add('dragging');
  });
  addEventsListener(zone, 'dragend dragleave drop', function () {
    this.classList.remove('dragging');
  });
  zone.addEventListener('drop', drop, false);
  input.addEventListener('change', function() {handleFile(this.files)}, false);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const datas = JSON.parse(content.value);
    const features = datas.features.filter(data => data.geometry !== null);
    const entries = [
      'type',
      'features'
    ];
    const name = variable.value;
    const file = filename.value;
    const fields = [];

    for (let key in datas) {
      if (!entries.includes(key)) {
        delete datas[key];
      }
    }

    const props = fieldset.querySelectorAll('[name="properties"]:checked');
    props.forEach(function (item) {
      fields.push(item.id);
    });

    for (let i = 0; i < features.length; i++) {
      let feature = features[i];

      for (let prop in feature.properties) {
        if (!fields.includes(prop)) {
          delete feature.properties[prop];
        }
      }

      if (Object.keys(feature.properties).length === 0) {
        delete feature.properties;
      }
    }

    datas.features = features;

    const result = JSON.stringify(datas);
    output.value = `var ${name}=[${result}]`;
    download.setAttribute('download', `${file}.geojson`);
    download.href = `data:application/json,var%20${name}=[${result}]`;
  });
})();
