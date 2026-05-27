import { createApp } from './app/createApp';
import './styles/style.css';

const app = createApp({ canvasId: 'gl' });
app.start();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.stop();
  });
}

