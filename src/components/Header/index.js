import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import logo from '../../images/solarvest-logo.png';

const headerStyle = {
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(34, 36, 38, 0.1)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  margin: 0,
  borderRadius: 0,
  padding: '0 1.5em',
  position: 'sticky',
  top: 0,
  zIndex: 20,
};

const logoStyle = {
  height: 32,
  marginRight: '0.6em',
  verticalAlign: 'middle',
};

const brandStyle = {
  fontWeight: 700,
  fontSize: '1.05em',
  color: '#1A1A1A',
  verticalAlign: 'middle',
};

const hamburgerStyle = {
  display: 'none',
  background: 'none',
  border: 'none',
  fontSize: '1.4em',
  cursor: 'pointer',
  padding: '0.3em 0.5em',
  color: '#2C2C2C',
};

const Header = () => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navStyle = (path) => ({
    fontWeight: pathname === path ? 700 : 600,
    color: pathname === path ? '#7B4397' : '#2C2C2C',
    borderBottom: pathname === path ? '2px solid #7B4397' : 'none',
  });

  return (
    <Menu borderless style={headerStyle} className="site-header">
      <Menu.Item header as={Link} to="/hr">
        <img src={logo} alt="Solarvest logo" style={logoStyle} />
        <span style={brandStyle}>Solarvest HR</span>
      </Menu.Item>

      <Menu.Menu position="right">
        <button
          className="header-hamburger"
          style={hamburgerStyle}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
        <div className={`header-nav-links ${menuOpen ? 'open' : ''}`}>
          <Menu.Item as={Link} to="/hr" style={navStyle('/hr')} onClick={() => setMenuOpen(false)}>
            HR Quiz
          </Menu.Item>
          <Menu.Item as={Link} to="/chat" style={navStyle('/chat')} onClick={() => setMenuOpen(false)}>
            HR Chat
          </Menu.Item>
          <Menu.Item as={Link} to="/feedback" style={navStyle('/feedback')} onClick={() => setMenuOpen(false)}>
            Feedback
          </Menu.Item>
          <Menu.Item as={Link} to="/admin" style={navStyle('/admin')} onClick={() => setMenuOpen(false)}>
            Admin
          </Menu.Item>
        </div>
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
