import { createMerkurWidget } from '@merkur/core';
import {
  getUserFromCache,
  loadUser,
  loginPlugin,
  processUserLoginState,
  setUserToCache,
  USER_EVENT,
} from '../index';

function mockWindow(windowMock) {
  return mockGlobalProperty('window', windowMock);
}

function mockGlobalProperty(propName, value) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(global, propName);
  Object.defineProperty(global, propName, { writable: true });
  global[propName] = value;

  return () => {
    if (originalDescriptor) {
      Object.defineProperty(global, propName, originalDescriptor);
    } else {
      delete global[propName];
    }
  };
}

describe('Login plugin', () => {
  const user = { bankid: 11 };
  const userUid = '42';
  const listener = jest.fn();
  const userEvents = Object.values(USER_EVENT);
  const loginMock = {
    current: {
      uid: userUid,
      state: 'login',
    },
  };
  const widgetProperties = {
    $plugins: [
      loginPlugin,
      function () {
        return {
          async setup(widget) {
            return {
              ...widget,
              sessionStorage: new Map(),
              setState: jest.fn(),
              userService: {
                user: jest.fn(),
              },
            };
          },
        };
      },
    ],
    name: 'my-widget',
    version: '1.0.0',
    props: {
      param: 1,
      containerSelector: '.container',
    },
    assets: [
      {
        type: 'script',
        source: 'http://www.example.com/static/1.0.0/widget.js',
      },
    ],
    setState: jest.fn(),
    userService: {
      user: jest.fn(),
    },
  };
  let widget;
  let login;
  let restoreWindow;

  beforeEach(async () => {
    widget = await createMerkurWidget(widgetProperties);
    login = widget.login;

    if ('login' in widget.$dependencies) {
      widget.$dependencies.login = loginMock;
    }

    restoreWindow = mockWindow({
      addEventListener: jest.fn(),
      login: { open: jest.fn() },
      removeEventListener: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    restoreWindow();
  });

  it('should create empty widget', async () => {
    expect(widget).toMatchInlineSnapshot(`
      {
        "$dependencies": {
          "login": {
            "current": {
              "state": "login",
              "uid": "42",
            },
          },
        },
        "$external": {
          "login": {
            "current": {
              "state": "login",
              "uid": "42",
            },
          },
        },
        "$in": {},
        "$plugins": [
          {
            "create": [Function],
            "setup": [Function],
          },
          {
            "setup": [Function],
          },
        ],
        "create": [Function],
        "login": {
          "listenToUserEvents": [Function],
          "openLoginWindow": [Function],
          "unlistenUserEvents": [Function],
        },
        "name": "my-widget",
        "sessionStorage": Map {},
        "setState": [Function],
        "setup": [Function],
        "userService": {
          "user": [MockFunction],
        },
        "version": "1.0.0",
      }
    `);
  });

  describe('listenToUserEvents(widget, userApiCall, listener)', () => {
    let listeners;

    it('should listen to user events and return bounded listeners', () => {
      expect.assertions(userEvents.length);

      listeners = login.listenToUserEvents(widget.userService.user, listener);

      userEvents.forEach((event) => {
        listeners[event].forEach((listenerBounded) => {
          expect(window.addEventListener).toHaveBeenCalledWith(
            event,
            listenerBounded
          );
        });
      });
    });

    it("should send widget, user api call, event's name and data as arguments to the listener", () => {
      expect.assertions(userEvents.length);

      listeners = login.listenToUserEvents(widget.userService.user, listener);
      const eventObject = { detail: { foo: 42 } };
      Object.entries(listeners).forEach(([event, listenersBounded]) => {
        listenersBounded.forEach((listenerBounded) => {
          listenerBounded(eventObject);

          expect(listener).toHaveBeenCalledWith(
            widget,
            widget.userService.user,
            event,
            eventObject.detail
          );
        });
      });
    });

    it('should not listen to user events if not client', () => {
      const restoreWindow = mockWindow();
      listeners = login.listenToUserEvents(widget.userService.user, listener);

      expect(listeners).toStrictEqual({});

      restoreWindow();
    });

    it.each([null, {}, 1, 'invalid'])(
      'should throw a type error if userApiCall is %p',
      (invalidApiCall) => {
        expect(() =>
          login.listenToUserEvents(invalidApiCall, listener)
        ).toThrow(TypeError);
      }
    );

    it.each([null, {}, 1, 'invalid'])(
      'should throw a type error if listener is %p',
      (invalidListener) => {
        expect(() =>
          login.listenToUserEvents(widget.userService.user, invalidListener)
        ).toThrow(TypeError);
      }
    );

    it('should use a default listener for undefined argument', () => {
      login.listenToUserEvents(widget.userService.user);

      expect(window.addEventListener).toHaveBeenCalledTimes(userEvents.length);
    });
  });

  describe('unlistenUserEvents(widget, listeners)', () => {
    const listeners = userEvents.reduce((listenersMock, event) => {
      listenersMock[event] = [jest.fn(), jest.fn()];

      return listenersMock;
    }, {});

    it('should unlisten user events', () => {
      expect.assertions(userEvents.length * 2);

      login.unlistenUserEvents(listeners);

      Object.entries(listeners).forEach(([event, listenersBounded]) => {
        listenersBounded.forEach((listenerBounded) => {
          expect(window.removeEventListener).toHaveBeenCalledWith(
            event,
            listenerBounded
          );
        });
      });
    });

    it('should not unlisten user events if not client', () => {
      mockWindow();
      login.unlistenUserEvents(listeners);

      expect(window).toBeUndefined();
    });

    it.each([[], null, undefined, 1, 'invalid', { badge: 'invalid' }])(
      'should not unlisten user events if listeners is %p',
      (invalidListeners) => {
        login.unlistenUserEvents(invalidListeners);

        expect(window.removeEventListener).not.toHaveBeenCalled();
      }
    );
  });

  describe('openLoginWindow()', () => {
    let opened;

    it('should open login window', () => {
      opened = login.openLoginWindow();

      expect(window.login.open).toHaveBeenCalledWith();
      expect(opened).toBeTruthy();
    });

    it('should not open login window on the server', () => {
      mockWindow();
      opened = login.openLoginWindow();

      expect(opened).toBeFalsy();
    });

    it.each([null, undefined, {}, 1, 'invalid'])(
      'should not open login window if the libary open() is %p',
      (open) => {
        mockWindow({ login: { open } });
        opened = login.openLoginWindow();

        expect(opened).toBeFalsy();
      }
    );
  });

  describe('processUserLoginState(widget, userApiCall)', () => {
    beforeEach(() => {
      jest.spyOn(widget, 'setState');
    });

    afterEach(() => {
      widget.sessionStorage.clear();
    });

    it('should call widget.setState() with { user: { isLoggedIn: false, isVerified: false } } if user is not logged in', async () => {
      await processUserLoginState(widget, widget.userService.user);

      expect(widget.setState).toHaveBeenCalledWith({
        user: {
          isLoggedIn: false,
          isVerified: false,
        },
      });
    });

    it('should call widget.setState() with { user: { isLoggedIn: true, isVerified: true } } if user is logged in and verified', async () => {
      mockWindow({
        login: { current: { uid: userUid, state: 'login' } },
      });
      setUserToCache(widget, user);
      await processUserLoginState(widget, widget.userService.user);

      expect(widget.setState).toHaveBeenCalledWith({
        user: {
          isLoggedIn: true,
          isVerified: true,
        },
      });
    });

    it('should call widget.setState() with { user: { isLoggedIn: true, isVerified: false } } if user is logged in and not verified', async () => {
      mockWindow({
        login: { current: { uid: userUid, state: 'login' } },
      });
      setUserToCache(widget, { ...user, bankid: null });
      await processUserLoginState(widget, widget.userService.user);

      expect(widget.setState).toHaveBeenCalledWith({
        user: {
          isLoggedIn: true,
          isVerified: false,
        },
      });
    });

    it('should not call widget.setState() if not client', async () => {
      mockWindow();
      setUserToCache(widget, user);
      await processUserLoginState(widget, widget.userService.user);

      expect(widget.setState).not.toHaveBeenCalled();
    });
  });

  describe('loadUser(widget, userApiCall)', () => {
    afterEach(() => {
      widget.sessionStorage.clear();
    });

    it('should load a user from the cache', async () => {
      setUserToCache(widget, user);
      const loaded = await loadUser(widget, widget.userService.user);

      expect(loaded).toStrictEqual(user);
      expect(widget.userService.user).not.toHaveBeenCalled();
    });

    it('should load a user from the service', async () => {
      widget.userService.user.mockResolvedValueOnce(user);
      const loaded = await loadUser(widget, widget.userService.user);

      expect(loaded).toStrictEqual(user);
      expect(widget.userService.user).toHaveBeenCalledWith();
    });

    it('should set a loaded user to the cache', async () => {
      mockWindow({
        login: { current: { uid: userUid } },
      });
      widget.userService.user.mockResolvedValueOnce(user);
      const loaded = await loadUser(widget, widget.userService.user);

      expect(widget.sessionStorage.get(`user${userUid}`)).toStrictEqual(loaded);
    });

    it('should not load a user if not client', async () => {
      mockWindow();
      const loaded = await loadUser(widget, widget.userService.user);

      expect(loaded).toBeNull();
      expect(widget.userService.user).not.toHaveBeenCalled();
    });
  });

  describe('setUserToCache(widget, user)', () => {
    afterEach(() => {
      widget.sessionStorage.clear();
    });

    it('should set a user to the cache', () => {
      mockWindow({ login: { current: { uid: userUid } } });

      expect(widget.sessionStorage.get(`user${userUid}`)).toBeUndefined();

      setUserToCache(widget, user);

      expect(widget.sessionStorage.get(`user${userUid}`)).toStrictEqual(user);
    });

    it('should not set a user to the cache if not client', () => {
      mockWindow();
      setUserToCache(widget, user);

      expect(widget.sessionStorage.get(`user${userUid}`)).toBeUndefined();
    });
  });

  describe('getUserFromCache(widget)', () => {
    afterEach(() => {
      widget.sessionStorage.clear();
    });

    it('should get a user to the cache', () => {
      mockWindow({ login: { current: { uid: userUid } } });

      setUserToCache(widget, user);

      expect(getUserFromCache(widget)).toStrictEqual(user);
    });

    it('should not get a user from the cache if not client', () => {
      restoreWindow = mockWindow();
      setUserToCache(widget, user);

      expect(getUserFromCache(widget)).toBeUndefined();
    });
  });
});
