var express = require("express");
var _ = require("lodash");
var app = express();
let cors = require("cors");

app.use(cors());

app.use(express.json());

//NFA represented by a 5-tuple: initialState, finalStates, states, alphabet, transitions
class NFA {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
}

//A transition is an edge, represented by state, nextState, symbol
class Transition {
  constructor(state, nextState, symbol) {
    this.state = state;
    this.nextState = nextState;
    this.symbol = symbol;
  }
}

//States: constructed from epsilon sets
//InitialState: constructed from epsilon set that contains the initial state
//Final states: constructed from epsilon sets that contain a final state
//Alphabet: every symbol, except 'epsilon'
//Transitions: see DFATransition
class DFA {
  constructor(initialState, finalStates, states, alphabet, transitions) {
    this.initialState = initialState;
    this.finalStates = finalStates;
    this.states = states;
    this.alphabet = alphabet;
    this.transitions = transitions;
  }
}

//Same as a regular transition, except here the state and nextState are epsilon sets or union of epsilon sets and the symbol can not be 'epsilon'
class DFATransition {
  constructor(state, nextState, symbol) {
    this.state = state;
    this.nextState = nextState;
    this.symbol = symbol;
  }
}

let nfa1 = new NFA();
let originalNFA = new NFA();
let epsilonArray;
let dfa1 = new DFA();
let minimizedDFA = new DFA();

app.delete("/api/dfa", (req, res) => {
  dfa1 = null;
  nfa1 = null;
  minimizedDFA = null;
  nfa1 = new NFA();
  dfa1 = new DFA();
  minimizedDFA = new DFA();
  res.send(JSON.stringify("DELETE request called"));
});

app.get("/", (req, res) => {
  res.send(dfa1);
});

app.get("/api/mindfa", (req, res) => {
  res.send(minimizedDFA);
});

app.get("/api/dfa", (req, res) => {
  res.send(dfa1);
});

app.get("/api/nfa", (req, res) => {
  res.send(nfa1);
});

app.put("/api/nfa", (req, res) => {
  let obj = null;
  nfa1 = null;
  nfa1 = new NFA();
  dfa1 = null;
  dfa1 = new DFA();
  obj = {
    states: req.body.states,
    finalStates: req.body.finalStates,
    initialState: req.body.initialState,
    alphabet: req.body.alphabet,
    transitions: req.body.transitions,
  };
  nfa1 = obj;
  console.log(obj);
  console.log(nfa1);
  res.send(obj);
  stringTransitionConverter(nfa1);
  epsilonArray = generateEpsilonSets(nfa1);
  dfa1 = generateDFA(nfa1);
  minimizedDFA = minimizeDFA(dfa1);
});

const port = process.env.PORT || 8081;
app.listen(port, function () {
  console.log("App listening at localhost/%s", port);
});

//TODOs: Make sure that only 1 initialState is allowed
//       Implementation of draggable canvas to display DFA stepwise                                                         DONE (testing needed)
//       Illegal names for states must be accounted for (e.g.: 'unreachable') -> this will be solved on the frontend        DONE (state names are automatically set)
//       Add string "unreachable" to epsilon sets, that are unreachable                                                     DONE (testing will be needed)
//       NFA Transition symbol can be string (not just symbol): in this case new states and transitions must be generated   DONE (testing will be needed)
//       Implementation of DFA                                                                                              DONE (see DFA object and DFA transition)
//       Implementation of algorithm for NFA->DFA conversion (stepwise)                                                     DONE (testing will be needed)
//       Implementation of sink for DFA: if there is a DFA transition with an empty nextState.reachableStates,              DONE (sink state is a state with name "")
//       it means that sink is present in the DFA. If there is a sink, a loop must be added to the transitions
//       with every symbol

//Driver code for a simple NFA
/*function driver() {
  //Example NFA from 21.12.2021. exam
  const trans1 = new Transition();
  const trans2 = new Transition();
  const trans3 = new Transition();
  const trans4 = new Transition();
  const trans5 = new Transition();
  const trans6 = new Transition();
  const trans7 = new Transition();
  const trans8 = new Transition();
  const trans9 = new Transition();

  const originaltrans1 = new Transition();
  const originaltrans2 = new Transition();
  const originaltrans3 = new Transition();
  const originaltrans4 = new Transition();
  const originaltrans5 = new Transition();
  const originaltrans6 = new Transition();
  const originaltrans7 = new Transition();
  const originaltrans8 = new Transition();
  const originaltrans9 = new Transition();

  originalNFA.initialState = ["q1"];
  originalNFA.finalStates = ["q2"];
  originalNFA.states = ["q1", "q2", "q3", "q4", "q5"];
  originalNFA.alphabet = ["a", "b", "e"];
  originalNFA.transitions = [
    originaltrans1,
    originaltrans2,
    originaltrans3,
    originaltrans4,
    originaltrans5,
    originaltrans6,
    originaltrans7,
    originaltrans8,
    originaltrans9,
  ];
  originaltrans1.state = "q1";
  originaltrans1.nextState = "q2";
  originaltrans1.symbol = "e";
  originaltrans2.state = "q1";
  originaltrans2.nextState = "q2";
  originaltrans2.symbol = "a";
  originaltrans3.state = "q1";
  originaltrans3.nextState = "q4";
  originaltrans3.symbol = "a";
  originaltrans4.state = "q2";
  originaltrans4.nextState = "q3";
  originaltrans4.symbol = "a";
  originaltrans5.state = "q2";
  originaltrans5.nextState = "q5";
  originaltrans5.symbol = "a";
  originaltrans6.state = "q2";
  originaltrans6.nextState = "q4";
  originaltrans6.symbol = "e";
  originaltrans7.state = "q3";
  originaltrans7.nextState = "q5";
  originaltrans7.symbol = "e";
  originaltrans8.state = "q4";
  originaltrans8.nextState = "q5";
  originaltrans8.symbol = "a";
  originaltrans9.state = "q5";
  originaltrans9.nextState = "q1";
  originaltrans9.symbol = "b";

  nfa1.initialState = ["q1"];
  nfa1.finalStates = ["q2"];
  nfa1.states = ["q1", "q2", "q3", "q4", "q5"];
  nfa1.alphabet = ["a", "b", "e"];
  nfa1.transitions = [
    trans1,
    trans2,
    trans3,
    trans4,
    trans5,
    trans6,
    trans7,
    trans8,
    trans9,
  ];
  trans1.state = "q1";
  trans1.nextState = "q2";
  trans1.symbol = "e";
  trans2.state = "q1";
  trans2.nextState = "q2";
  trans2.symbol = "a";
  trans3.state = "q1";
  trans3.nextState = "q4";
  trans3.symbol = "a";
  trans4.state = "q2";
  trans4.nextState = "q3";
  trans4.symbol = "a";
  trans5.state = "q2";
  trans5.nextState = "q5";
  trans5.symbol = "a";
  trans6.state = "q2";
  trans6.nextState = "q4";
  trans6.symbol = "e";
  trans7.state = "q3";
  trans7.nextState = "q5";
  trans7.symbol = "e";
  trans8.state = "q4";
  trans8.nextState = "q5";
  trans8.symbol = "a";
  trans9.state = "q5";
  trans9.nextState = "q1";
  trans9.symbol = "b";
}
driver();*/

function stringTransitionConverter(nfa1) {
  //The code below transforms the transition symbols, if there is a string instead of a single symbol, by adding new states and transitions to the NFA
  //Exstensive testing will be needed
  //To avoid confusion, states must follow a naming convention: lowercase 'q' plus a number starting with 1 and incrementing by 1 (e.g.: q1)
  //Array containing information about the original states
  //Transitions that contain string instead of symbol (length > 1)

  const stringTransitions = nfa1.transitions.filter((x) => x.symbol.length > 1);
  const arr = [];
  for (let i = 0; i < stringTransitions.length; i++) {
    arr.push(stringTransitions[i].state + "(" + (i + 1) + ")");
  }
  //Adding the the new states to the list of states, adding new transitions to the list of transitions
  //E.g.: aba -> 2 new states, 3 new transitions, with symbol a, b, a respectively
  //String-transitions are marked with a number between parentheses concatenated to the state's end
  //The last element of a string-transition is marked with a number and the string 'last' between parentheses
  let k = nfa1.states.length + 1;
  let f = 1;
  for (let s of stringTransitions) {
    for (let i = 0; i < s.symbol.length - 1; i++) {
      nfa1.states.push("q" + k);
      const stringtrans = new Transition();
      stringtrans.state = s.state + "(" + f + ")";
      stringtrans.nextState = s.nextState + "(" + k + ")";
      stringtrans.symbol = s.symbol[i];
      nfa1.transitions.push(stringtrans);
      k++;
    }
    s.state = s.state + "(" + f + "last)";
    if (s.symbol.length > 1) {
      s.symbol = s.symbol.slice(-1);
    }
    f++;
  }

  //Sorting the transitions to ensure that the string-transitions are in correct order
  nfa1.transitions.sort((a, b) =>
    a.state > b.state ? 1 : b.state > a.state ? -1 : 0
  );

  //This loop sets the nextStates in the string-transitions
  for (let a of arr) {
    for (let t of nfa1.transitions) {
      if (a == t.state) {
        t.nextState =
          "q" +
          t.nextState.substring(
            t.nextState.indexOf("(") + 1,
            t.nextState.lastIndexOf(")")
          );
      }
    }
  }
  //This loop sets the last transition of a string-transition with the nextState of the previous transition
  for (let j = 0; j < arr.length; j++) {
    for (let i = 0; i < nfa1.transitions.length; i++) {
      if (
        nfa1.transitions[i].state.substring(
          nfa1.transitions[i].state.length - 5
        ) == "last)"
      ) {
        nfa1.transitions[i].state = nfa1.transitions[i - 1].nextState;
      }
    }
  }
  //This loop sets the first transition of a string-transition by deleting the parentheses
  for (let a of arr) {
    for (let n of nfa1.transitions) {
      if (a == n.state) {
        n.state = n.state.split("(")[0];
        break;
      }
    }
  }
  //This loop sets the rest of the string-transitions's states to the previous transitions nextState
  for (let a of arr) {
    for (let i = 0; i < nfa1.transitions.length; i++) {
      if (a == nfa1.transitions[i].state) {
        nfa1.transitions[i].state = nfa1.transitions[i - 1].nextState;
      }
    }
  }

  //This part updates the alphabet by splitting the string, adding the new symbols to the alphabet and finally deleting the string
  const sym = [];
  for (let i = 0; i < nfa1.alphabet.length; i++) {
    if (nfa1.alphabet[i].length > 1) {
      sym.push(nfa1.alphabet[i].split(""));
    }
  }
  const symArr = [...new Set(sym.flat())];
  for (let s of symArr) {
    if (!nfa1.alphabet.includes(s)) {
      nfa1.alphabet.push(s);
    }
  }
  nfa1.alphabet = nfa1.alphabet.filter((x) => x.length === 1);
  /*console.log("string to symbols");
  console.log(symArr);*/
}
function generateEpsilonSets(nfa1) {
  //Generating epsilon sets: an NFA that has n states, will have n epsilon sets (counting unreachable states too)
  //A state is unreachable if it is not an initialState AND does not have an inbound edge
  //(simply put, if the state is not in initialState AND not in nextState)
  //An epsilon set is an object with name (string) and reachableStates (set): defined as set, to avoid duplicates caused by cycles in the graph (this needs further testing)

  //Epsilon sets stored in this array
  const epsilonArr = [];
  //Transitions with symbol 'epsilon' stored in this array
  const epsilonTransitions = nfa1.transitions.filter(
    (x) => x.symbol == "\u03B5"
  );
  //Transitions with symbols other than 'epsilon' are stored in this array (might need it later)
  const nonEpsilonTransitions = nfa1.transitions.filter(
    (x) => x.symbol != "\u03B5"
  );

  //Initializing the epsilon sets with their corresponding state, e.g.: E(1) = {q1}
  for (let i = 1; i <= nfa1.states.length; i++) {
    let epsilonSets = { name: "", state: "", reachableStates: new Set() };
    epsilonSets.name = "E" + "(" + i + ")";
    epsilonSets.state = nfa1.states[i - 1];
    epsilonSets.reachableStates.add(nfa1.states[i - 1]);

    epsilonArr.push(epsilonSets);
  }

  //Iterating through the epsilon transitions array: if the set contains the element we are iterating through, we push the nextState
  //This way we add every state to the sets, that are reachable with a symbol 'epsilon'
  //Need to iterate through twice, in case the NFA has a cycle of epsilon transitions
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < epsilonArr.length; i++) {
      for (let e of epsilonTransitions) {
        if (epsilonArr[i].reachableStates.has(e.state)) {
          epsilonArr[i].reachableStates.add(e.nextState);
        }
      }
    }
  }

  //Adding 'unreachable' string to the isolated states' epsilon set, that can not be accessed from the initial state
  //Make a set for the reachable states and an array for the unreachable
  const reachable = new Set();
  const unreachable = [];
  //Add the initial state to the reachable set
  reachable.add(nfa1.initialState[0]);

  //Need to iterate through twice, in case the initialState is not in the first transition object
  for (let i = 0; i < 2; i++) {
    //Iterate through the transitions, if the state is in the reachable set, add the nextState to the set
    for (let t of nfa1.transitions) {
      if (reachable.has(t.state)) {
        reachable.add(t.nextState);
      }
    }
  }
  //Iterate through the states, if the state is not in the reachable set, add the state to the unreachable array
  for (let s of nfa1.states) {
    if (!reachable.has(s)) {
      unreachable.push(s);
    }
  }
  //Iterate through the epsilon sets, if the epsilon set contains an element from the unreachable array, add 'unreachable'
  for (let e of epsilonArr) {
    for (let u of unreachable) {
      if (e.reachableStates.has(u)) {
        e.reachableStates.add("unreachable");
      }
    }
  }

  for (let e of epsilonArr) {
    e.reachableStates = new Set(
      [...e.reachableStates].sort(function (x, y) {
        let xp = parseInt(x.substring(x.indexOf("q") + 1));
        let yp = parseInt(y.substring(y.indexOf("q") + 1));
        return xp == yp ? 0 : xp < yp ? -1 : 1;
      })
    );
  }

  for (let e2 of epsilonArr) {
    e2.name = [
      ...new Set(
        epsilonArr
          .filter((e) =>
            [...e.reachableStates].every((val) =>
              [...e2.reachableStates].includes(val)
            )
          )
          .map((x) => x.name)
          .join(",")
          .split(",")
      ),
    ].join(",");
  }

  //console.log("Original NFA");
  // console.log(originalNFA);
  console.log("NFA with parsed out strings");
  console.log(nfa1);
  console.log(epsilonArr);

  return epsilonArr;
}
function generateDFA(nfa1) {
  //Make a DFA object
  const dfa1 = new DFA();
  //If the first element in the epsilon set is equal to the initial state of the NFA, that set will be the initial state of the DFA
  /*dfa1.initialState = epsilonArray.filter(
    (x) =>
      [...x.reachableStates].includes(nfa1.initialState[0]) &&
      ![...x.reachableStates].includes("q3")
  );*/

  dfa1.initialState = [epsilonArray[0]];

  console.log("initial state");
  console.log(dfa1.initialState[0]);

  if (dfa1.initialState.length === 0) {
    return dfa1;
  }

  //The DFA's alphabet equals to the NFA's alphabet, without the 'epsilon' symbol
  dfa1.alphabet = nfa1.alphabet;
  //dfa1.alphabet.pop("e");
  _.remove(dfa1.alphabet, function (n) {
    return n === "\u03B5";
  });
  //Every state, that contains an element of the NFA's final states
  dfa1.finalStates = [];
  dfa1.states = [];
  dfa1.states.push(dfa1.initialState[0]);
  dfa1.transitions = [];
  //The DFA has 2^n states (where n is the number of states) at most
  for (let j = 0; j < Math.pow(2, nfa1.states.length); j++) {
    //Iterate trough the alphabet
    for (let i = 0; i < dfa1.alphabet.length; i++) {
      //New DFA transition instance
      const dfatrans = new DFATransition();
      //Exit condition for the loop, if undefined is read, break
      if (dfa1.states[j] == undefined) {
        break;
      }
      //Setting the state of the transition
      dfatrans.state = dfa1.states[j];
      //Setting the symbol of the transition
      dfatrans.symbol = nfa1.alphabet[i];
      //Filter out every symbol and every state, that has the given symbol
      const temp = [
        ...new Set(
          nfa1.transitions
            .filter(
              (x) =>
                x.symbol === dfa1.alphabet[i] &&
                dfa1.states[j].reachableStates.has(x.state)
            )
            .map((x) => x.nextState)
        ),
      ];

      console.log("temp");
      console.log(temp);
      //Map out the states of the filtered array
      //const temp2 = temp.map((temp2) => temp2.nextState);
      dfatrans.nextState = {};
      //Storing those epsilon sets in the tempMap, that correspond with the previously mapped states

      let tempMap = [];
      for (let t of temp) {
        tempMap.push(
          epsilonArray.filter(
            (x) => x.state === t
            //temp.every((val) => _.union([...x.reachableStates], temp).includes(val))
          )
        );
      }
      tempMap = tempMap.flat();
      console.log("tempmap");
      console.log(tempMap);

      //Adding the names and states of the stored epsilon sets to the nameArr and stateArr
      const nameArr = [];
      const stateArr = [];
      for (let t of tempMap) {
        nameArr.push(t.name);
        stateArr.push(_.toArray(t.reachableStates));
      }

      console.log("Symbol: " + dfa1.alphabet[i]);
      console.log("nameArr");
      console.log(nameArr);
      console.log("stateArr");
      console.log(stateArr);
      console.log("----------");

      //Setting the transition's next state's name and reachable states
      dfatrans.nextState.name = [
        ...new Set(nameArr.flat().join(",").split(",")),
      ]
        .sort(function (x, y) {
          let xp = parseInt(
            x.substring(x.indexOf("(") + 1, x.lastIndexOf(")"))
          );
          let yp = parseInt(
            y.substring(y.indexOf("(") + 1, y.lastIndexOf(")"))
          );
          return xp == yp ? 0 : xp < yp ? -1 : 1;
        })
        .join(",");

      dfatrans.nextState.reachableStates = new Set(
        stateArr.flat().sort(function (x, y) {
          let xp = parseInt(x.substring(x.indexOf("q") + 1));
          let yp = parseInt(y.substring(y.indexOf("q") + 1));
          return xp == yp ? 0 : xp < yp ? -1 : 1;
        })
      );
      //Add the transition to the array of transitions and add the transitions next state to the array of states
      dfa1.transitions.push(dfatrans);
      //Check here if the state already in the DFA states array
      let exist = false;
      for (let s of dfa1.states) {
        if (s.name === dfatrans.nextState.name) {
          exist = true;
        }
      }
      //If not, push the new state
      if (exist === false) {
        dfa1.states.push(dfatrans.nextState);
      }
    }
  }

  //Add the states containig a finalState to the array of finalStates
  for (let i = 0; i < dfa1.states.length; i++) {
    for (let f of nfa1.finalStates) {
      if (dfa1.states[i].reachableStates.has(f)) {
        dfa1.finalStates.push(dfa1.states[i]);
        break;
      }
    }
  }
  //Converting the reachable states' set to array, to avoid data loss during JSON.stringify
  for (let t of dfa1.transitions) {
    t.state.reachableStates = [...t.state.reachableStates];
    t.nextState.reachableStates = [...t.nextState.reachableStates];
  }
  for (let s of dfa1.states) {
    s.reachableStates = [...s.reachableStates];
  }

  let minNameIndex = 1;
  for (let s of dfa1.states) {
    s.minName = "Q" + minNameIndex;
    minNameIndex++;
  }

  console.log("Epsilon sets");
  console.log(epsilonArray);
  console.log("DFA");
  console.log(dfa1);

  for (let t of dfa1.transitions) {
    console.log(t);
  }

  return dfa1;
}
function minimizeDFA(dfa1) {
  let minimalDFA = new DFA();
  //minimalDFA = _.cloneDeep(dfa1);
  let minimalStates = [];
  let minimalFinalStates = [];
  let minimalTransitions = [];

  const mindfanames = [];
  let i = 1;
  for (let s of dfa1.states) {
    let obj = { dfaname: "", minname: "", finalstate: false };
    obj.dfaname = s.name;
    obj.minname = s.minName;
    for (let f of dfa1.finalStates) {
      if (obj.dfaname === f.name) {
        obj.finalstate = true;
      }
    }

    minimalStates.push(obj.minname);
    i++;
    mindfanames.push(obj);
  }

  console.log(mindfanames);

  for (let m of mindfanames) {
    if (m.finalstate === true) {
      minimalFinalStates.push(m.minname);
    }
  }
  minimalDFA.alphabet = dfa1.alphabet;
  minimalDFA.initialState = ["Q1"];
  minimalDFA.states = minimalStates;
  minimalDFA.finalStates = minimalFinalStates;

  for (let t of dfa1.transitions) {
    const trans = new Transition();
    trans.symbol = t.symbol;
    for (let m of mindfanames) {
      if (t.state.name === m.dfaname) {
        trans.state = m.minname;
      }
      if (t.nextState.name === m.dfaname) {
        trans.nextState = m.minname;
      }
    }
    minimalTransitions.push(trans);
  }
  minimalDFA.transitions = minimalTransitions;

  console.log("Minimal DFA");
  console.log(minimalDFA);

  const getAllSubsets = (theArray) =>
    theArray.reduce(
      (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
      [[]]
    );

  const labelMap = minimalDFA.states.map((x) => x);

  const pairs = getAllSubsets(labelMap).filter((x) => x.length === 2);
  for (let p of pairs) {
    if (
      minimalDFA.finalStates.includes(p[0]) &&
      minimalDFA.finalStates.includes(p[1])
    ) {
      continue;
    }
    if (
      !minimalDFA.finalStates.includes(p[0]) &&
      !minimalDFA.finalStates.includes(p[1])
    ) {
      continue;
    } else {
      p.push("X");
    }
  }

  for (let p of pairs) {
    p.sort();
  }

  for (let p of pairs) {
    for (let s of minimalDFA.alphabet) {
      if (!p.includes("X")) {
        p.push(
          minimalDFA.transitions
            .filter((x) => p.includes(x.state) && x.symbol === s)
            .map((x) => x.nextState)
            .sort()
        );
      }
    }
  }

  console.log(pairs);

  for (let j = 0; j < Math.pow(2, minimalDFA.states.length); j++) {
    for (let p of pairs) {
      if (!p.includes("X")) {
        for (let i = 2; i < p.length; i++) {
          for (let p2 of pairs) {
            if (_.isEqual(p[i], p2.slice(0, 2)) && p2.includes("X")) {
              p[i].push("X");
              p.push("X");
            }
          }
        }
      }
    }
  }

  console.log(pairs);

  const equivalentStates = pairs
    .filter((x) => !x.includes("X"))
    .map((x) => [x[0], x[1]]);

  console.log(equivalentStates);
  if (equivalentStates.length === 0) {
    console.log("DFA is minimal");
    return minimalDFA;
  }

  const newStates = [];
  for (let s of minimalDFA.states) {
    newStates.push([
      ...new Set(
        equivalentStates
          .filter((x) => x.includes(s))
          .map((x) => {
            return (x[0] + "," + x[1]).split(",");
          })
          .flat()
      ),
    ]);
    if (equivalentStates.filter((x) => x.includes(s)).length === 0) {
      newStates.pop();
      newStates.push([s]);
    }
  }

  for (let n of newStates) {
    n.sort();
  }

  newStates.sort();
  let seen = {};
  const unique = newStates.filter(function (a) {
    return seen.hasOwnProperty(a) ? false : (seen[a] = true);
  });

  console.log(unique);
  const finalDFA = new DFA();
  const states = [];
  const finalStates = [];
  const transitions = [];
  for (let u of unique) {
    states.push(u.join(","));
    if (u.includes(minimalDFA.initialState[0])) {
      finalDFA.initialState = [u.join(",")];
    }
    for (let f of minimalDFA.finalStates) {
      if (u.includes(f)) {
        finalStates.push(u.join(","));
      }
    }
  }

  for (let u of unique) {
    for (let a of minimalDFA.alphabet) {
      const finalTrans = new Transition();
      finalTrans.state = u.join(",");
      finalTrans.symbol = a;
      transitions.push(finalTrans);
      let nextStateFilter = minimalDFA.transitions
        .filter((x) => x.state === u[0] && x.symbol === a)
        .map((x) => x.nextState);
      console.log(nextStateFilter);
      finalTrans.nextState = unique
        .filter((x) => x.includes(nextStateFilter[0]))
        .join(",");
    }
  }

  finalDFA.states = states;
  finalDFA.alphabet = minimalDFA.alphabet;
  finalDFA.finalStates = [...new Set(finalStates)];
  finalDFA.transitions = transitions;
  console.log(finalDFA);
  console.log(finalDFA.transitions.length);

  return finalDFA;
}
