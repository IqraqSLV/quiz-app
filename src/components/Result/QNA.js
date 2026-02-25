import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Table, Button } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';

import { topicMap } from '../../data/topicMap';

const QNA = ({ questionsAndAnswers }) => {
  const navigate = useNavigate();

  const handleExplainPolicy = (question, correctAnswer) => {
    navigate('/chat', {
      state: {
        prefill: `Explain the HR policy related to: "${question}" — the correct answer is "${correctAnswer}".`,
        entrypoint: 'quiz_result',
        topic: topicMap[question] ?? null,
      },
    });
  };

  const handleShowSource = (question) => {
    navigate('/chat', {
      state: {
        prefill: `Show me the official HR policy source for: "${question}"`,
        entrypoint: 'quiz_result',
        topic: topicMap[question] ?? null,
      },
    });
  };

  return (
    <Segment style={{
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      <Table
        celled
        striped
        selectable
        size="large"
        className="transparent-table"
        style={{ backgroundColor: 'transparent' }}
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign="center" width={1}>No.</Table.HeaderCell>
            <Table.HeaderCell width={6}>Questions</Table.HeaderCell>
            <Table.HeaderCell width={3}>Your Answers</Table.HeaderCell>
            <Table.HeaderCell width={3}>Correct Answers</Table.HeaderCell>
            <Table.HeaderCell textAlign="center" width={1}>Points</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {questionsAndAnswers.map((item, i) => (
            <React.Fragment key={i + 1}>
              <Table.Row positive={item.point === 1} negative={item.point === 0}>
                <Table.Cell textAlign="center">{i + 1}</Table.Cell>
                <Table.Cell>{item.question}</Table.Cell>
                <Table.Cell style={{
                  fontSize: '0.9em',
                  fontWeight: item.point === 1 ? 'bold' : 'normal',
                  color: item.point === 1 ? '#2C662D' : '#9F3A38'
                }}>
                  {item.user_answer}
                </Table.Cell>
                <Table.Cell style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#2C662D' }}>
                  {item.correct_answer}
                </Table.Cell>
                <Table.Cell textAlign="center" style={{ fontWeight: 'bold' }}>
                  {item.point}
                </Table.Cell>
              </Table.Row>
              {item.point === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={5} style={{ background: 'rgba(123, 67, 151, 0.04)', borderTop: 'none', paddingTop: '0.4em', paddingBottom: '0.6em' }}>
                    <Button
                      size="mini"
                      className="purple-button"
                      icon="book"
                      content="Explain policy"
                      labelPosition="left"
                      style={{ marginRight: '0.5em' }}
                      onClick={() => handleExplainPolicy(item.question, item.correct_answer)}
                    />
                    <Button
                      size="mini"
                      basic
                      icon="linkify"
                      content="Show official source"
                      labelPosition="left"
                      style={{ color: '#7B4397', borderColor: '#7B4397' }}
                      onClick={() => handleShowSource(item.question)}
                    />
                  </Table.Cell>
                </Table.Row>
              )}
            </React.Fragment>
          ))}
        </Table.Body>
      </Table>
    </Segment>
  );
};

QNA.propTypes = {
  questionsAndAnswers: PropTypes.array.isRequired,
};

export default QNA;
