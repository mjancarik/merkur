import { bindWidgetToFunctions } from '@merkur/core';

export const USER_EVENT = Object.freeze({
  BADGE: 'badge',
  LOGIN: 'login',
  LOGOUT: 'logout',
  FORGET: 'forget',
});

export function isClient() {
  return typeof window !== 'undefined';
}

export function loginPlugin() {
  return {
    async setup(widget) {
      widget = {
        ...loginAPI(),
        ...widget,
      };

      widget.$dependencies.login = getLoginLibraryAPI();

      return widget;
    },
    async create(widget) {
      bindWidgetToFunctions(widget, widget.login);

      return widget;
    },
  };
}

function loginAPI() {
  return {
    login: {
      listenToUserEvents(
        widget,
        userApiCall,
        listener = processUserLoginState
      ) {
        const listeners = {};

        if (!isClient()) {
          return listeners;
        }

        if (
          typeof userApiCall !== 'function' ||
          typeof listener !== 'function'
        ) {
          throw new TypeError(
            'merkur.plugin-login.listenToUserEvents: userApiCall and listener expected to be a function'
          );
        }

        Object.values(USER_EVENT).forEach((event) => {
          if (!listeners[event]) {
            listeners[event] = [];
          }

          const listenerBounded = (eventObject) => {
            listener(widget, userApiCall, event, eventObject?.detail);
          };
          listeners[event].push(listenerBounded);
          window.addEventListener(event, listenerBounded);
        });

        listener(widget, userApiCall);

        return listeners;
      },
      unlistenUserEvents(_, listeners) {
        if (!isClient() || !listeners || typeof listeners !== 'object') {
          return;
        }

        Object.entries(listeners).forEach(([event, listenersBounded]) => {
          if (!Array.isArray(listenersBounded)) {
            return;
          }

          listenersBounded.forEach((listener) => {
            window.removeEventListener(event, listener);
          });
        });
      },
      openLoginWindow() {
        if (!isClient() || typeof window.login?.open !== 'function') {
          return false;
        }

        window.login.open();

        return true;
      },
    },
  };
}

function getLoginLibraryAPI() {
  return isClient() ? window.login : undefined;
}

export async function processUserLoginState(widget, userApiCall) {
  if (!isClient()) {
    return false;
  }

  if (window.login?.current?.state === 'login') {
    const user = await loadUser(widget, userApiCall);
    const isLoggedIn = user && typeof user === 'object';

    if (isLoggedIn) {
      const { bankid, firstname, lastname } = user;

      widget.setState({
        user: { firstname, isLoggedIn, isVerified: !!bankid, lastname },
      });

      return true;
    }
  }

  widget.setState({ user: { isLoggedIn: false, isVerified: false } });

  return false;
}

export async function loadUser(widget, userApiCall) {
  if (!isClient()) {
    return null;
  }

  let user = getUserFromCache(widget);

  if (!user) {
    user = await userApiCall();

    if (user) {
      setUserToCache(widget, user);
    }
  }

  return user;
}

export function getUserFromCache(widget) {
  if (isClient()) {
    return widget.sessionStorage.get(getUserCacheKey());
  }
}

export function setUserToCache(widget, user) {
  if (isClient()) {
    widget.sessionStorage.set(getUserCacheKey(), user);
  }
}

export function getUserCacheKey() {
  if (isClient()) {
    return `user${window.login?.current?.uid}`;
  }
}
