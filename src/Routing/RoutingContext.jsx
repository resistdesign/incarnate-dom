import {createContext} from 'react';

export const {Provider, Consumer} = createContext(
  {
    parentUrl: undefined,
    routeProps: undefined
  }
);
