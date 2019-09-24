import React from 'react';
import { ThemeProvider } from 'react-jss';
import { BrowserRouter, Route } from 'react-router-dom';
import { theme } from '@betty-blocks/design-system';
import './App.css';
import Main from './main/Main';

function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Route path="/:prefabName?" component={Main} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
