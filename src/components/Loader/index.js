import React from 'react';
import { Container, Message, Icon } from 'semantic-ui-react';

const Loader = ({ title, message }) => (
  <Container className="page-container">
    <Message
      icon
      size="big"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
    >
      <Icon name="circle notched" loading />
      <Message.Content>
        <Message.Header>{title ? title : 'Just one second'}</Message.Header>
        {message ? message : 'We are fetching that content for you.'}
      </Message.Content>
    </Message>
  </Container>
);

export default Loader;
