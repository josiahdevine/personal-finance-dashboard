// Re-export PrivateRoute from the correct location
// This file exists to support legacy imports in the codebase
import React from 'react';
import OriginalPrivateRoute from '../Components/auth/PrivateRoute';

// Re-export with the same interface
const PrivateRoute: typeof OriginalPrivateRoute = OriginalPrivateRoute;

export default PrivateRoute; 