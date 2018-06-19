import React, { Component } from 'react';
import qs from 'qs';

const getState = () => {
  const { mode = 'instant', debounce = 0, ...searchState } = qs.parse(
    window.location.search.slice(1)
  );
  return {
    mode,
    debounce: mode === 'debounce' ? parseInt(debounce) : 0,
    searchState,
  };
};

const createURL = ({ searchState, mode, debounce }) =>
  `${window.location.pathname}?${qs.stringify({
    mode,
    debounce,
    ...searchState,
  })}`;

export const withUrlSync = App =>
  class extends Component {
    constructor() {
      super();
      this.state = getState();
      window.onpopstate = () => this.setState(getState());
    }

    onSearchStateChange = nextSearchState => {
      const THRESHOLD = 700;
      const newPush = Date.now();
      const search = nextSearchState ? createURL(this.state) : '';
      if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
        window.history.replaceState(null, null, search);
      } else {
        window.history.pushState(null, null, search);
      }
      this.setState({
        lastPush: newPush,
        searchState: nextSearchState,
      });
    };

    createURL = searchState =>
      createURL({
        ...this.state,
        searchState,
      });

    render() {
      return (
        <App
          {...this.props}
          createURL={this.createURL}
          mode={this.state.mode}
          debounce={this.state.debounce}
          onSearchStateChange={this.onSearchStateChange}
          searchState={this.state.searchState}
        />
      );
    }
  };
