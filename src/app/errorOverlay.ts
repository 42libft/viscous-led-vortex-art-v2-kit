export type ErrorOverlay = {
  show: (message: string) => void;
  hide: () => void;
  dispose: () => void;
};

export function createErrorOverlay(): ErrorOverlay {
  const root = document.createElement('div');
  root.setAttribute('data-error-overlay', 'true');
  root.style.position = 'fixed';
  root.style.left = '0';
  root.style.top = '0';
  root.style.right = '0';
  root.style.bottom = '0';
  root.style.padding = '16px';
  root.style.background = 'rgba(0, 0, 0, 0.92)';
  root.style.color = '#ff7070';
  root.style.fontFamily =
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  root.style.fontSize = '12px';
  root.style.lineHeight = '1.4';
  root.style.whiteSpace = 'pre-wrap';
  root.style.overflow = 'auto';
  root.style.zIndex = '999999';
  root.hidden = true;

  const pre = document.createElement('pre');
  pre.style.margin = '0';
  root.appendChild(pre);

  const mountTarget = document.body ?? document.documentElement;
  mountTarget.appendChild(root);

  const show = (message: string) => {
    pre.textContent = message;
    root.hidden = false;
  };

  const hide = () => {
    root.hidden = true;
  };

  const dispose = () => {
    root.remove();
  };

  return { show, hide, dispose };
}

