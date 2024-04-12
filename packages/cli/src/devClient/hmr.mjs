export async function hmr({ to, command, changed }) {
  if (to === 'browser' && command === 'refresh') {
    await Promise.all(
      changed.map(async (asset) => {
        return new Promise((resolve) => {
          const element = document.querySelector(`[data-name="${asset.name}"]`);

          if (!element || element.nodeName === 'STYLE') {
            location.reload();
            return;
          }

          let newElement = null;
          const searchParams = new URLSearchParams({ version: Math.random() });

          if (element.nodeName === 'LINK') {
            const url = new URL(element.href);
            newElement = element.cloneNode();

            newElement.onload = () => {
              element.remove();
              resolve();
            };
            newElement.onerror = () => {
              element.remove();
              resolve();
            };
            newElement.href = new URL(
              `${url.origin}${url.pathname}?${searchParams.toString()}`,
            );
          }

          if (element.nodeName === 'SCRIPT') {
            const url = new URL(element.src);
            newElement = document.createElement('script');
            newElement.setAttribute('data-name', asset.name);
            newElement.onload = () => {
              element.remove();
              resolve();
            };
            // TODO check bad scenario
            newElement.onerror = () => {
              element.remove();
              resolve();
            };

            newElement.src = new URL(
              `${url.origin}${url.pathname}?${searchParams.toString()}`,
            );
          }

          element.parentNode.insertBefore(newElement, element.nextSibling);
        });
      }),
    );

    if (!changed.some((asset) => asset.name.endsWith('.js'))) {
      return;
    }

    // HMR JS
    const widgets = window.__merkur_dev__.widgets;
    window.__merkur_dev__.widgets = [];

    widgets.forEach(async (widget) => {
      const {
        props,
        state,
        $external,
        name,
        version,
        containerSelector,
        container,
        slot,
      } = widget;
      const widgetProperties = {
        props,
        state,
        $external,
        name,
        version,
        containerSelector,
        container,
        slot,
      };
      const newWidget = await window.__merkur__.create(widgetProperties);

      await widget.unmount();
      await newWidget.mount();
    });
  }
}
