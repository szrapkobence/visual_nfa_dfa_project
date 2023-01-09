# visual_nfa_dfa_project
Application for NFA to DFA conversion and DFA minimization

A graphic, interactive software that helps to learn and 
understand the algorithms presented within the course of Elements of the theory of 
computation.
In the project, a web software was implemented. The user can define finite 
automata as directed graphs on the front-end. Two algorithms are available as functions:
• the transformation of a nondeterministic finite automaton into an equivalent deterministic finite automaton (powerset construction)
• the minimization of the states of a deterministic finite automaton (partition refinement)
Automata can be saved as JSON files.
The software itself is made up of two parts: the front-end, where the graphical 
display and manipulation by the user takes place, and the back-end, which processes the 
specified finite automata.

Install:
• Open project folder in VS Code (or your choice of dev environment)
• npm install -g
• node nfa.js
• By opening index.html in the frontend subfolder we can reach the frontend.
