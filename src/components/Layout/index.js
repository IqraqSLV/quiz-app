import React from 'react';
import PropTypes from 'prop-types';

const layoutStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
};

const mainStyle = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const Layout = ({ children }) => {
  return (
    <div style={layoutStyle}>
      <main style={mainStyle}>{children}</main>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
