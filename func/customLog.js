
import pkg from 'signale';
const { Signale } = pkg

const options = {
  disabled: false,
  interactive: false,
  logLevel: 'info',
  secrets: [],
  stream: process.stdout,
  types: {
    remind: {
      badge: '**',
      color: 'yellow',
      label: 'reminder',
      logLevel: 'info'
    },
    event: {
      badge: '',
      color: 'yellow',
      label: 'Event',
      logLevel: 'success'
    },
    eventErr: {
      badge: '',
      color: 'red',
      label: 'Event',
      logLevel: 'error'
    },
    discord: {
      badge: '',
      color: 'blue',
      label: 'Discord',
      logLevel: 'info'
    }
  }
};
 
export const custom = new Signale(options);
