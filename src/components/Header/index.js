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

const Header = () => {
  const { pathname } = useLocation();

  const navStyle = (path) => ({
    fontWeight: pathname === path ? 700 : 600,
    color: pathname === path ? '#7B4397' : '#2C2C2C',
    borderBottom: pathname === path ? '2px solid #7B4397' : 'none',
  });

  return (
    <Menu borderless style={headerStyle}>
      <Menu.Item header as={Link} to="/hr">
        <img src={logo} alt="Solarvest logo" style={logoStyle} />
        <span style={brandStyle}>Solarvest HR</span>
      </Menu.Item>

      <Menu.Menu position="right">
        <Menu.Item as={Link} to="/hr" style={navStyle('/hr')}>
          HR Quiz
        </Menu.Item>
        <Menu.Item as={Link} to="/chat" style={navStyle('/chat')}>
          HR Chat
        </Menu.Item>
        <Menu.Item as={Link} to="/feedback" style={navStyle('/feedback')}>
          Feedback
        </Menu.Item>
        <Menu.Item as={Link} to="/admin" style={navStyle('/admin')}>
          Admin
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
