import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Popup } from 'semantic-ui-react';
import Swal from 'sweetalert2';

import { timeConverter } from '../../utils';

const Countdown = ({ countdownTime, timeOver, setTimeTaken }) => {
  const totalTime = countdownTime * 1000;
  const [timerTime, setTimerTime] = useState(totalTime);
  const { hours, minutes, seconds } = timeConverter(timerTime);

  // Calculate urgency levels
  const isUrgent = timerTime <= 60000; // Last minute
  const isVeryUrgent = timerTime <= 30000; // Last 30 seconds

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = timerTime - 1000;

      if (newTime >= 0) {
        setTimerTime(newTime);
      } else {
        clearInterval(timer);

        Swal.fire({
          icon: 'info',
          title: `Oops! Time's up.`,
          text: 'See how you did!',
          confirmButtonText: 'Check Results',
          timer: 5000,
          willClose: () => timeOver(totalTime - timerTime),
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      setTimeTaken(totalTime - timerTime + 1000);
    };

    // eslint-disable-next-line
  }, [timerTime]);

  const timerStyle = {
    color: isUrgent ? '#FF6B35' : undefined,
    fontWeight: isUrgent ? 'bold' : undefined,
    animation: isVeryUrgent ? 'pulse 1s infinite' : undefined,
  };

  return (
    <Button.Group size="small" basic floated="right">
      <Popup
        content="Hours"
        trigger={<Button active style={timerStyle}>{hours}</Button>}
        position="bottom left"
      />
      <Popup
        content="Minutes"
        trigger={<Button active style={timerStyle}>{minutes}</Button>}
        position="bottom left"
      />
      <Popup
        content="Seconds"
        trigger={<Button active style={timerStyle}>{seconds}</Button>}
        position="bottom left"
      />
    </Button.Group>
  );
};

Countdown.propTypes = {
  countdownTime: PropTypes.number.isRequired,
  timeOver: PropTypes.func.isRequired,
  setTimeTaken: PropTypes.func.isRequired,
};

export default Countdown;
