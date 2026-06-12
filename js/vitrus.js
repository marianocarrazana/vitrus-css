import Accordion from './accordion.js';
import Alert from './alert.js';
import Collapse from './collapse.js';
import Dropdown from './dropdown.js';
import Modal from './modal.js';
import Offcanvas from './offcanvas.js';
import Popover from './popover.js';
import Tab from './tab.js';
import Toast from './toast.js';
import Tooltip from './tooltip.js';

const vitrus = {
  Accordion,
  Alert,
  Collapse,
  Dropdown,
  Modal,
  Offcanvas,
  Popover,
  Tab,
  Toast,
  Tooltip,
};

export {
  Accordion,
  Alert,
  Collapse,
  Dropdown,
  Modal,
  Offcanvas,
  Popover,
  Tab,
  Toast,
  Tooltip,
};
export default vitrus;

if (typeof window !== 'undefined') {
  window.vitrus = vitrus;
}
