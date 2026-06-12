import Alert from './alert.js';
import Collapse from './collapse.js';
import Tab from './tab.js';

const vitrus = {
  Alert,
  Collapse,
  Tab,
};

export { Alert, Collapse, Tab };
export default vitrus;

if (typeof window !== 'undefined') {
  window.vitrus = vitrus;
}
