import React from 'react';
import PropTypes from 'prop-types';

import Header from '../Header';

const layoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
};

const Layout = ({ children }) => {
  return (
    <div style={layoutStyle}>
      <Header />
      <main>{children}</main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
