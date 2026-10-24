import React from 'react';
import { CircularProgress } from '@mui/material';

const Loader: React.FC = () => (
  <div className="loader-div" role="status" aria-live="polite">
    <CircularProgress size={44} thickness={4} />
  </div>
);

export default Loader;
