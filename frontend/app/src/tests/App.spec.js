import { render } from '@testing-library/react';
import { EventSource } from 'mocksse';
import App from '../App';

Object.defineProperty(window, 'EventSource', {
  value: EventSource
});

test('Page rendering', () => {
  const { container } = render(<App />);
  const tableHeaderElements = container.querySelectorAll('div.email-list th');
  expect(tableHeaderElements).toHaveLength(2);
  expect(tableHeaderElements[0].textContent).toEqual('Email');
  expect(tableHeaderElements[1].textContent).toEqual('Status');
});