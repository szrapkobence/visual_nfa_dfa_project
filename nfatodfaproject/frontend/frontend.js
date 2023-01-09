const DIR = "../";

class UserInput {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = [];
  }
}

class Transition {
  constructor(state, nextState, symbol) {
    this.state = state;
    this.nextState = nextState;
    this.symbol = symbol;
  }
}

function addNFANode(s, nfaObj) {
  if (nfaObj.finalStates.includes(s)) {
    network.body.data.nodes.add([
      {
        id: s,
        label: s,
        title: "finalstate",
        color: "lightgreen",
      },
    ]);
  } else if (nfaObj.initialState.includes(s)) {
    network.body.data.nodes.add([
      {
        id: s,
        label: s,
        shape: "image",
        shape: "circularImage",
        image: "startstate.png",
        imagePadding: {
          left: 7,
          top: 7,
          bottom: 7,
          right: 7,
        },
      },
    ]);
  } else {
    network.body.data.nodes.add([
      {
        id: s,
        label: s,
      },
    ]);
  }
}

function addNFAEDGE(t) {
  var newId = (Math.random() * 1e7).toString(32);
  network.body.data.edges.add({
    id: newId,
    from: t.state,
    to: t.nextState,
    label: t.symbol,
  });
}

async function exportData() {
  const response = await fetch("http://localhost:8081/api/nfa", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const nfaObj = await response.json();
  if (Object.keys(nfaObj).length === 0) {
    return;
  }
  console.log("Saving data...");
  console.log(nfaObj);

  let dataStr = JSON.stringify(nfaObj);
  let dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  let exportFileDefaultName = "savednfa.json";

  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

function validateJSON(body) {
  try {
    var data = JSON.parse(body);
    // if came to here, then valid
    return data;
  } catch (e) {
    // failed to parse
    return null;
  }
}

async function dispFile(contents) {
  let data = validateJSON(contents);
  if (data) {
    console.log(data);
    const jsonData = JSON.stringify(data);
    await fetch("http://localhost:8081/api/nfa", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    }).then(getNFA());
  }
}
function clickElem(elem) {
  var eventMouse = document.createEvent("MouseEvents");
  eventMouse.initMouseEvent(
    "click",
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  elem.dispatchEvent(eventMouse);
}
function openFile(func) {
  readFile = function (e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var contents = e.target.result;
      fileInput.func(contents);
      document.body.removeChild(fileInput);
    };
    reader.readAsText(file);
  };
  fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.style.display = "none";
  fileInput.onchange = readFile;
  fileInput.func = func;
  document.body.appendChild(fileInput);
  clickElem(fileInput);
}

async function getNFA() {
  const response = await fetch("http://localhost:8081/api/nfa", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  const nfaObj = await response.json();
  draw();
  for (let s of nfaObj.states) {
    addNFANode(s, nfaObj);
  }
  for (let t of nfaObj.transitions) {
    addNFAEDGE(t);
  }
  let finalStatesArr = [];
  let stateArr = [];
  let symbolArr = [];
  let nfa = new UserInput();
  if (savedNFA === null) {
    savedNFA = Object.assign({}, network);
  }
  if (savedNFA !== null) {
    finalStatesArr = [];
    stateArr = [];
    symbolArr = [];
    nfa.transitions = [];
    for (const e of Object.values(savedNFA.body.nodes)) {
      if (e.options.label !== undefined) {
        stateArr.push(e.options.label);
      }
      if (e.options.title === "finalstate") {
        finalStatesArr.push(e.options.label);
      }
    }
    for (const e of Object.values(savedNFA.body.edges)) {
      const trans = new Transition();
      trans.state = e.from.options.label;
      trans.nextState = e.to.options.label;
      trans.symbol = e.options.label;
      nfa.transitions.push(trans);
      symbolArr.push(e.options.label);
    }
    nfa.states = [...new Set(stateArr)];
    nfa.alphabet = [...new Set(symbolArr)];
    nfa.finalStates = [...new Set(finalStatesArr)];
    nfa.initialState = ["q1"];
  }
  console.log("NFA without strings");
  console.log(nfaObj);
}

async function deleteNFA() {
  const res = await fetch("http://localhost:8081/api/nfa", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
}

async function postNFA(nfa) {
  const data = JSON.stringify({
    states: nfa.states,
    finalStates: nfa.finalStates,
    initialState: nfa.initialState,
    alphabet: nfa.alphabet,
    transitions: nfa.transitions,
  });
  await fetch("http://localhost:8081/api/nfa", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  }).then(getNFA());
}

let labelArr = [];
let savedNFA = null;
var nodes = null;
var edges = null;
var network = null;
var data = {
  nodes: new vis.DataSet(nodes),
  edges: new vis.DataSet(edges),
};
var seed = 2;

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
    data = null;
    //i = 1;
  }
}

function draw() {
  destroy();
  savedNFA = null;
  i = 1;
  nodes = [];
  edges = [];

  nodes = new vis.DataSet(nodes);

  edges = new vis.DataSet(edges);

  // create a network
  var container = document.getElementById("mynetwork");
  var options = {
    nodes: {
      font: {
        size: 20,
      },
      shadow: {
        enabled: true,
        color: "black",
      },
      shape: "circle",
    },
    edges: {
      font: {
        size: 22,
      },
      length: 200,
      color: "blue",
      shadow: {
        enabled: true,
        color: "black",
      },
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5,
        },
      },
      physics: true,
    },
    layout: { randomSeed: seed }, // just to make sure the layout is the same when the locale is changed
    manipulation: {
      addNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById("node-operation").innerText = "Add Node";
        editNode(data, clearNodePopUp, callback);
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById("node-operation").innerText = "Edit Node";
        editNode(data, cancelNodeEdit, callback);
      },
      addEdge: function (data, callback) {
        if (data.from == data.to) {
          var r = confirm("Do you want to connect the node to itself?");
          if (r != true) {
            callback(null);
            return;
          }
        }
        document.getElementById("edge-operation").innerText = "Add Edge";
        editEdgeWithoutDrag(data, callback);
      },
      editEdge: {
        editWithoutDrag: function (data, callback) {
          document.getElementById("edge-operation").innerText = "Edit Edge";
          editEdgeWithoutDrag(data, callback);
        },
      },
    },
  };
  network = new vis.Network(container, data, options);
}

function logData() {
  let finalStatesArr = [];
  let stateArr = [];
  let symbolArr = [];
  let nfa = new UserInput();
  for (const e of Object.values(network.body.nodes)) {
    if (e.options.label !== undefined) {
      stateArr.push(e.options.label);
    }
    if (e.options.title === "finalstate") {
      finalStatesArr.push(e.options.label);
    }
  }
  for (const e of Object.values(network.body.edges)) {
    const trans = new Transition();
    trans.state = e.from.options.label;
    trans.nextState = e.to.options.label;
    trans.symbol = e.options.label;
    nfa.transitions.push(trans);
    symbolArr.push(e.options.label);
  }
  nfa.states = [...new Set(stateArr)];
  nfa.alphabet = [...new Set(symbolArr)];
  nfa.finalStates = [...new Set(finalStatesArr)];
  nfa.initialState = ["q1"];

  console.log(nfa);
  if (savedNFA === null) {
    savedNFA = Object.assign({}, network);
  }
  if (savedNFA !== null) {
    finalStatesArr = [];
    stateArr = [];
    symbolArr = [];
    nfa.transitions = [];
    for (const e of Object.values(savedNFA.body.nodes)) {
      if (e.options.label !== undefined) {
        stateArr.push(e.options.label);
      }
      if (e.options.title === "finalstate") {
        finalStatesArr.push(e.options.label);
      }
    }
    for (const e of Object.values(savedNFA.body.edges)) {
      const trans = new Transition();
      trans.state = e.from.options.label;
      trans.nextState = e.to.options.label;
      trans.symbol = e.options.label;
      nfa.transitions.push(trans);
      symbolArr.push(e.options.label);
    }
    nfa.states = [...new Set(stateArr)];
    nfa.alphabet = [...new Set(symbolArr)];
    nfa.finalStates = [...new Set(finalStatesArr)];
    nfa.initialState = ["q1"];
  }
  postNFA(nfa);
  console.log("Network");
  console.log(network);
  console.log("Saved data");
  console.log(savedNFA);
  console.log("Label array");
  console.log(labelArr);
}

function editNode(data, cancelAction, callback) {
  //document.getElementById("node-label").value = data.label;

  document.getElementById("final-state").onclick = finalState.bind(this, data);

  document.getElementById("node-saveButton").onclick = saveNodeData.bind(
    this,
    data,
    callback
  );
  document.getElementById("node-cancelButton").onclick = cancelAction.bind(
    this,
    callback
  );
  document.getElementById("node-popUp").style.display = "block";
}
function finalState(data) {
  data.title = "finalstate";
  data.color = "lightgreen";
}
// Callback passed as parameter is ignored
function clearNodePopUp() {
  document.getElementById("node-saveButton").onclick = null;
  document.getElementById("node-cancelButton").onclick = null;
  document.getElementById("node-popUp").style.display = "none";
}
function cancelNodeEdit(callback) {
  clearNodePopUp();
  callback(null);
}
let i = 1;
function saveNodeData(data, callback) {
  //data.label = document.getElementById("node-label").value;
  data.label = "q" + i;
  labelArr.push(data.label);

  if (i == 1) {
    data.shape = "image";
    data.shape = "circularImage";
    data.image = "startstate.png";
    data.imagePadding = {
      left: 7,
      top: 7,
      bottom: 7,
      right: 7,
    };
  }
  i++;
  clearNodePopUp();
  callback(data);
}
function editEdgeWithoutDrag(data, callback) {
  // filling in the popup DOM elements
  //data.label = "e";
  data.label = "\u03B5";

  document.getElementById("edge-label").value = data.label;
  document.getElementById("edge-saveButton").onclick = saveEdgeData.bind(
    this,
    data,
    callback
  );
  document.getElementById("edge-cancelButton").onclick = cancelEdgeEdit.bind(
    this,
    callback
  );
  document.getElementById("edge-popUp").style.display = "block";
}
function clearEdgePopUp() {
  document.getElementById("edge-saveButton").onclick = null;
  document.getElementById("edge-cancelButton").onclick = null;
  document.getElementById("edge-popUp").style.display = "none";
}
function cancelEdgeEdit(callback) {
  clearEdgePopUp();
  callback(null);
}
function saveEdgeData(data, callback) {
  if (typeof data.to === "object") data.to = data.to.id;
  if (typeof data.from === "object") data.from = data.from.id;
  if (document.getElementById("edge-label").value === "") {
    data.label = "\u03B5";
  } else {
    data.label = document.getElementById("edge-label").value;
  }

  clearEdgePopUp();
  callback(data);
}
function init() {
  draw();
}
window.addEventListener("load", () => {
  init();
});
