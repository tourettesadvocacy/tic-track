import 'react-native';
import React from 'react';
import App from '../App';
import renderer from 'react-test-renderer';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

it('renders correctly', () => {
  renderer.create(<App />);
});
