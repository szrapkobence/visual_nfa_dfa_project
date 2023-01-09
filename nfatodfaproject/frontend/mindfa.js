async function getminDFA() {
  const response = await fetch("http://localhost:8081/api/mindfa");
  const mindfaObj = await response.json();

  if (Object.keys(mindfaObj).length === 0) {
    return;
  }

  startMINNetwork();
  for (let s of mindfaObj.states) {
    addMINNode(s);
    if (mindfaObj.finalStates.includes(s)) {
      nodes.update([{ id: s, color: { background: "lightgreen" } }]);
    }
    if (mindfaObj.initialState.includes(s)) {
      nodes.update([{ id: s, label: "START\n" + s }]);
    }
  }

  for (let t of mindfaObj.transitions) {
    addMINEdge(t);
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

  console.log(mindfaObj);
}

var nodeIds, shadowState, nodesArray, nodes, edgesArray, edges, network;

function startMINNetwork() {
  // this list is kept to remove a random node.. we do not add node 1 here because it's used for changes
  shadowState = false;

  // create an array with nodes
  nodesArray = [];
  nodes = new vis.DataSet(nodesArray);

  // create an array with edges
  edgesArray = [];
  edges = new vis.DataSet(edgesArray);

  // create a network
  var container = document.getElementById("mindfa");
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

function addMINNode(s) {
  nodes.add({
    id: s,
    label: s,
  });
}
function addMINEdge(t) {
  var newId = (Math.random() * 1e7).toString(32);
  edges.add({
    id: newId,
    from: t.state,
    to: t.nextState,
    label: t.symbol,
  });
}
