import { useEffect, useState } from "react";

const Timer = ({ setTimeTaken }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        const newTime = prev + 1;
        setTimeTaken(newTime); // ✅ Pass time to parent component
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [setTimeTaken]);

  return null; // ✅ Removes the extra "Time Taken" display
};

export default Timer;
