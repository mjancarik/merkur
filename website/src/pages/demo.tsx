import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './demo.module.css';

// Define types for Merkur on window object
declare global {
  interface Window {
    Merkur: {
      Core: {
        getMerkur: () => any;
        createMerkurWidget: any;
      };
      Plugin: {
        Component: {
          componentPlugin: any;
        };
      };
    };
  }
}

export default function Demo(): React.ReactNode {
  return (
    <Layout title='Merkur Demo'>
      <div className={styles.container}>
        <div className={styles.widget}>
          <h2>Demo Widget</h2>
          <p id='description'>Loading...</p>
          <div className={styles.counter}>
            <span>Counter: </span>
            <span id='counter'>0</span>
          </div>
          <div className={styles.controls}>
            <button id='increase'>Increase</button>
            <button id='reset'>Reset</button>
          </div>
        </div>
      </div>

      <BrowserOnly>
        {() => {
          // This code will only run in the browser
          const loadScripts = async (): Promise<void> => {
            try {
              // Dynamically load the scripts
              const coreScript = document.createElement('script');

              coreScript.src =
                'https://unpkg.com/@merkur/core@0.38.0/lib/index.umd.js';
              coreScript.async = true;

              const componentScript = document.createElement('script');

              componentScript.src =
                'https://unpkg.com/@merkur/plugin-component@0.38.0/lib/index.umd.js';
              componentScript.async = true;

              // Wait for scripts to load
              await new Promise<void>((resolve) => {
                coreScript.onload = () => {
                  document.body.appendChild(componentScript);
                  componentScript.onload = () => resolve();
                };
                document.body.appendChild(coreScript);
              });

              // Initialize the widget
              const merkur = window.Merkur.Core.getMerkur();
              const createMerkurWidget = window.Merkur.Core.createMerkurWidget;

              const widgetProperties = {
                name: 'demo',
                version: '0.0.1',
                props: {},
                state: {},
                $plugins: [window.Merkur.Plugin.Component.componentPlugin],
                $dependencies: {},
                createWidget: createMerkurWidget,
                onClick: function (widget): void {
                  widget.setState({ counter: widget.state.counter + 1 });
                },
                onReset: function (widget): void {
                  widget.setState({ counter: 0 });
                },
                load: function (): { counter: number } {
                  return {
                    counter: 0,
                  };
                },
                mount: function (widget): void {
                  const increaseButton = document.getElementById('increase');
                  if (increaseButton) {
                    increaseButton.addEventListener('click', function (): void {
                      widget.onClick();
                    });
                  }

                  const resetButton = document.getElementById('reset');
                  if (resetButton) {
                    resetButton.addEventListener('click', function (): void {
                      widget.onReset();
                    });
                  }

                  const descriptionElement =
                    document.getElementById('description');
                  if (descriptionElement) {
                    descriptionElement.innerHTML =
                      widget.name + '@' + widget.version;
                  }
                },
                unmount: function (widget): void {
                  const container = document.querySelector(
                    widget.containerSelector,
                  );
                  if (container) {
                    container.innerHTML = '';
                  }
                },
                update: function (widget): void {
                  const counterElement = document.getElementById('counter');
                  if (counterElement) {
                    counterElement.innerText = widget.state.counter.toString();
                  }
                },
              };

              merkur.register(widgetProperties);
              merkur.create(widgetProperties).then(function (widget): void {
                widget.mount();
              });
            } catch (error) {
              console.error('Error loading Merkur scripts:', error);
            }
          };

          // Execute the script loading function
          loadScripts();

          return null;
        }}
      </BrowserOnly>
    </Layout>
  );
}
