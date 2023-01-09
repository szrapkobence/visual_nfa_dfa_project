async function deleteAllAPIData() {
  const res = await fetch("http://localhost:8081/api/dfa", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
}

async function getDFA() {
  const response = await fetch("http://localhost:8081/api/dfa");
  const dfaObj = await response.json();
  edgeIDs = [];
  startNetwork();

  if (Object.keys(dfaObj).length === 0) {
    return;
  }

  if (dfaObj.initialState.length === 0) {
    deleteAllAPIData();
    return;
  }
  for (let s of dfaObj.states) {
    console.log(s);
    addNode(s);
    if (dfaObj.initialState[0].name === s.name) {
      nodes.update([
        {
          id: s.name,
          label:
            "START\n" + s.minName + ": {" + s.reachableStates.join(",") + "}",
          hidden: false,
        },
      ]);
    }
    for (let f of dfaObj.finalStates) {
      if (f.name === s.name) {
        nodes.update([{ id: s.name, color: { background: "lightgreen" } }]);
      }
    }
  }

  for (let t of dfaObj.transitions) {
    console.log(t);
    addEdge(t);
  }
  const loopFilter = Object.values(network.body.edges)
    .filter((x) => x.fromId === x.toId)
    .map((a) => [a.fromId, a.options.label]);
  for (let e of Object.values(network.body.edges)) {
    if (e.fromId === e.toId) {
      console.log(e);
      let loopLabel = "";
      for (let l of loopFilter) {
        if (l[0] === e.fromId) {
          loopLabel += l[1] + ",";
        }
      }
      loopLabel = loopLabel.slice(0, -1);
      e.options.label = loopLabel;
    }
  }

  stepCounter = 0;
  console.log(dfaObj);
}

async function getVisibleDFA() {
  const response = await fetch("http://localhost:8081/api/dfa");
  const dfaObj = await response.json();
  edgeIDs = [];
  startNetwork();

  if (Object.keys(dfaObj).length === 0) {
    return;
  }

  if (dfaObj.initialState.length === 0) {
    deleteAllAPIData();
    return;
  }
  for (let s of dfaObj.states) {
    console.log(s);
    addNode(s);
    if (dfaObj.initialState[0].name === s.name) {
      nodes.update([
        {
          id: s.name,
          label:
            "START\n" + s.minName + ": {" + s.reachableStates.join(",") + "}",
          hidden: false,
        },
      ]);
    }
    for (let f of dfaObj.finalStates) {
      if (f.name === s.name) {
        nodes.update([{ id: s.name, color: { background: "lightgreen" } }]);
      }
    }
  }

  for (let t of dfaObj.transitions) {
    console.log(t);
    addEdge(t);
  }

  for (let e of edgeIDs) {
    for (let it of Object.values(network.body.edges)) {
      if (e === it.id) {
        nodes.update([
          {
            id: it.fromId,
            hidden: false,
          },
        ]);
        edges.update([{ id: it.id, hidden: false }]);
      }
    }
  }

  const loopFilter = Object.values(network.body.edges)
    .filter((x) => x.fromId === x.toId)
    .map((a) => [a.fromId, a.options.label]);
  for (let e of Object.values(network.body.edges)) {
    if (e.fromId === e.toId) {
      console.log(e);
      let loopLabel = "";
      for (let l of loopFilter) {
        if (l[0] === e.fromId) {
          loopLabel += l[1] + ",";
        }
      }
      loopLabel = loopLabel.slice(0, -1);
      e.options.label = loopLabel;
    }
  }

  stepCounter = edgeIDs.length;
  if (stepCounter > edgeIDs.length) {
    stepCounter = edgeIDs.length;
  }
}

var nodeIds, shadowState, nodesArray, nodes, edgesArray, edges, network;
let edgeIDs = [];
let stepCounter = 0;

function startNetwork() {
  // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes
  shadowState = false;

  // create an array with nodes
  nodesArray = [];
  nodes = new vis.DataSet(nodesArray);

  // create an array with edges
  edgesArray = [];
  edges = new vis.DataSet(edgesArray);

  // create a network
  var container = document.getElementById("dfa");
  var data = {
    nodes: nodes,
    edges: edges,
  };
  var options = {
    physics: { enabled: true },
    nodes: {
      shadow: {
        enabled: true,
        color: "black",
      },
      shape: "circle",
    },
    edges: {
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
    },
  };
  network = new vis.Network(container, data, options);
  console.log(network);
}

function addNode(s) {
  if (s.reachableStates.length === 0) {
    nodes.add({
      id: s.name,
      label: s.minName + ": { }",
      title: "sink",
      hidden: true,
    });
  } else {
    nodes.add({
      id: s.name,
      label: s.minName + ": {" + s.reachableStates.join(",") + "}",
      title: s.name,
      hidden: true,
    });
  }
}
function addEdge(t) {
  var newId = (Math.random() * 1e7).toString(32);
  edges.add({
    id: newId,
    from: t.state.name,
    to: t.nextState.name,
    label: t.symbol,
    hidden: true,
  });
  edgeIDs.push(newId);
}

function startDFA() {
  stepCounter = 1;
  for (let it of Object.values(network.body.edges)) {
    nodes.update([
      {
        id: it.fromId,
        hidden: true,
      },
    ]);
    edges.update([{ id: it.id, hidden: true }]);
  }

  for (let it of Object.values(network.body.edges)) {
    if (edgeIDs[0] === it.id) {
      nodes.update([
        {
          id: it.fromId,
          hidden: false,
        },
      ]);
    }
  }
}

function prevStepDFA() {
  console.log(stepCounter);
  stepCounter--;
  if (stepCounter < 0) {
    stepCounter = 0;
  }

  for (let e of edgeIDs.slice(stepCounter, edgeIDs.length)) {
    for (let it of Object.values(network.body.edges)) {
      if (e === it.id) {
        edges.update([{ id: it.id, hidden: true }]);
      }
    }
  }

  for (let n of Object.values(network.body.nodes)) {
    if (n.options.label !== undefined) {
      let temp = [];
      for (let e of n.edges) {
        temp.push(e.options.hidden);
      }
      if (temp.every((x) => x === true)) {
        nodes.update([
          {
            id: n.id,
            hidden: true,
          },
        ]);
      }
    }
  }
}
function nextStepDFA() {
  console.log(stepCounter);
  for (let it of Object.values(network.body.edges)) {
    if (edgeIDs[0] === it.id) {
      nodes.update([
        {
          id: it.fromId,
          hidden: false,
        },
      ]);
    }
  }

  for (let e of edgeIDs.slice(0, stepCounter)) {
    for (let it of Object.values(network.body.edges)) {
      if (e === it.id) {
        edges.update([{ id: it.id, hidden: false }]);
        nodes.update([
          {
            id: it.toId,
            hidden: false,
          },
        ]);
      }
    }
  }
  stepCounter++;
  if (stepCounter > edgeIDs.length) {
    stepCounter = edgeIDs.length;
  }

  const loopFilter = Object.values(network.body.edges)
    .filter((x) => x.fromId === x.toId)
    .map((a) => [a.fromId, a.options.label]);
  for (let e of Object.values(network.body.edges)) {
    if (e.fromId === e.toId) {
      let loopLabel = "";
      for (let l of loopFilter) {
        if (l[0] === e.fromId) {
          loopLabel += l[1] + ",";
        }
      }
      loopLabel = [...new Set(loopLabel.split(","))].join(",").slice(0, -1);
      e.options.label = loopLabel;
    }
  }
}

function completeDFA() {
  for (let e of edgeIDs) {
    for (let it of Object.values(network.body.edges)) {
      if (e === it.id) {
        nodes.update([
          {
            id: it.fromId,
            hidden: false,
          },
        ]);
        edges.update([{ id: it.id, hidden: false }]);
      }
    }
  }
  console.log(edgeIDs.length);
  stepCounter = edgeIDs.length;
  if (stepCounter > edgeIDs.length) {
    stepCounter = edgeIDs.length;
  }

  const loopFilter = Object.values(network.body.edges)
    .filter((x) => x.fromId === x.toId)
    .map((a) => [a.fromId, a.options.label]);
  for (let e of Object.values(network.body.edges)) {
    if (e.fromId === e.toId) {
      let loopLabel = "";
      for (let l of loopFilter) {
        if (l[0] === e.fromId) {
          loopLabel += l[1] + ",";
        }
      }
      loopLabel = [...new Set(loopLabel.split(","))].join(",").slice(0, -1);
      e.options.label = loopLabel;
    }
  }
}
