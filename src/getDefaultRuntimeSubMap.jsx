import QueryString from 'query-string';

export default function getDefaultRuntimeSubMap(incarnateDOM = {}, historyListenerTarget = {}) {
  return {
    subMap: {
      global: {
        factory: () => window || global
      },
      history: {
        invalidators: [
          'history'
        ],
        factory: (invalidateHistory) => {
          if (incarnateDOM.history instanceof Object) {
            if (historyListenerTarget.unlistenToHistory instanceof Function) {
              historyListenerTarget.unlistenToHistory();
            }

            historyListenerTarget.unlistenToHistory = incarnateDOM.history.listen(() => {
              // TRICKY: LOCATION: Set the location on the historyListenerTarget, but supply it from incarnateDOM,
              // so that the location on a parent incarnateDOM instance isn't overwritten multiple times,
              // unnecessarily but is still set when the parent incarnateDOM instance IS also the historyListenerTarget.
              historyListenerTarget.location = incarnateDOM.history.location;
              invalidateHistory();
            });

            return incarnateDOM.history;
          }
        }
      },
      location: {
        required: [
          'history'
        ],
        factory: () => {
          // TRICKY: See LOCATION above.
          return incarnateDOM.location || {};
        }
      },
      params: {
        required: [
          'location'
        ],
        factory: () => {
          const {params} = incarnateDOM.match || {};

          return {
            ...params
          };
        }
      },
      query: {
        required: [
          'location'
        ],
        factory: ({search = ''}) => QueryString.parse(
          search,
          {
            arrayFormat: 'bracket'
          }
        )
      },
      props: {
        required: [
          'location'
        ],
        factory: () => {
          return {
            ...incarnateDOM.match,
            location: incarnateDOM.location,
            history: incarnateDOM.history
          };
        }
      }
    }
  };
}
