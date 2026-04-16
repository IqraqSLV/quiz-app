import { Link } from 'react-router-dom';
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
  width: 'auto',
  objectFit: 'contain',
  marginRight: '0.6em',
  verticalAlign: 'middle',
};

const brandStyle = {
  fontWeight: 700,
  fontSize: '1.05em',
  color: '#1A1A1A',
  verticalAlign: 'middle',
};

const Header = () => (
  <Menu borderless style={headerStyle} className="site-header">
    <Menu.Item header as={Link} to="/chat">
      <img src={logo} alt="Solarvest logo" style={logoStyle} />
      <span style={brandStyle}>Solarvest HR</span>
    </Menu.Item>
  </Menu>
);

export default Header;
