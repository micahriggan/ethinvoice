import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Invoice from "./components/Invoice/Invoice";

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Ethereum Invoice Demo</h1>
          </header>
          <Invoice eth={'5.75'} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
