import React, { useState, useEffect, useRef } from "react";
import "./game.scss";
import s1 from "../../assets/Capture-removebg-preview (9).png";
import s2 from "../../assets/Capture-removebg-preview (10).png";
import s3 from "../../assets/Capture-removebg-preview (11).png";
import s4 from "../../assets/Capture-removebg-preview (12).png";
import s5 from "../../assets/Capture-removebg-preview (13).png";
import spinlogo from "../../assets/pngwing.com (5).png";
import frame1 from "../../assets/frame1.png";
import framebg from "../../assets/frame5.png";
import goldenframe from "../../assets/goldenframe.png";

const symbols = [s1, s2, s3, s4, s5];

const SlotGame = () => {
  const [jackpot, setJackpot] = useState(12000344);
  const [bet, setBet] = useState(250);
  const [freeSpins, setFreeSpins] = useState(20000);
  const [totalJackpot, setTotalJackpot] = useState(1222470520);
  const [spinning, setSpinning] = useState(false);
  const [rows, setRows] = useState([
    [s1, s2, s3, s5, s2, s4],
    [s1, s4, s5, s2, s3, s5],
    [s3, s5, s2, s3, s1, s5],
    [s2, s1, s4, s5, s3, s2],
  ]);
  const [winner, setWinner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [stoppingColumns, setStoppingColumns] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [winCount, setWinCount] = useState(0);
  const [timer, setTimer] = useState({
    hours: 0,
    minutes: 1,
    seconds: 24,
  });
  const [isMuted, setIsMuted] = useState(false);

  // Audio references
  const audioContextRef = useRef(null);
  const spinSoundRef = useRef(null);
  const winSoundRef = useRef(null);
  const stopSoundRef = useRef(null);

  // Initialize audio context and sounds
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play spin sound
  const playSpinSound = () => {
    if (isMuted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 200;
    oscillator.type = "square";
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);

    spinSoundRef.current = setInterval(() => {
      if (isMuted) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 200 + Math.random() * 100;
      osc.type = "square";
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }, 100);
  };

  // Stop spin sound
  const stopSpinSound = () => {
    if (spinSoundRef.current) {
      clearInterval(spinSoundRef.current);
      spinSoundRef.current = null;
    }
  };

  // Play stop sound
  const playStopSound = () => {
    if (isMuted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 300;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  // Play win sound
  const playWinSound = () => {
    if (isMuted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const startTime = ctx.currentTime + index * 0.15;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.4);
    });
  };

  // Auto-increase total jackpot with bigger increments
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalJackpot(
        (prev) => prev + Math.floor(Math.random() * 50000 + 25000)
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!showModal) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          clearInterval(interval);
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showModal]);

  const randomSymbol = () =>
    symbols[Math.floor(Math.random() * symbols.length)];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(false);
    setShowModal(false);
    setStoppingColumns([false, false, false, false, false, false]);

    // Play spin sound
    playSpinSound();

    const spinDuration = 2500;
    const isWin = Math.random() > 0.3;
    let finalRows;

    if (isWin) {
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      finalRows = [
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
        [winSymbol, winSymbol, winSymbol, winSymbol, winSymbol, winSymbol],
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
      ];
      for (let col = 0; col < 6; col++) {
        while (finalRows[0][col] === winSymbol)
          finalRows[0][col] = randomSymbol();
        while (finalRows[2][col] === winSymbol)
          finalRows[2][col] = randomSymbol();
        while (finalRows[3][col] === winSymbol)
          finalRows[3][col] = randomSymbol();
      }
    } else {
      finalRows = [
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
        [
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
          randomSymbol(),
        ],
      ];
      // Ensure middle row doesn't have all same symbols
      let attempts = 0;
      while (attempts < 100) {
        const allSame = finalRows[1].every((sym) => sym === finalRows[1][0]);
        if (!allSame) break;
        finalRows[1] = finalRows[1].map(() => randomSymbol());
        attempts++;
      }
    }

    // Stop columns sequentially
    setTimeout(() => {
      playStopSound();
      setStoppingColumns([true, false, false, false, false, false]);
      setRows((prev) => [
        [
          finalRows[0][0],
          prev[0][1],
          prev[0][2],
          prev[0][3],
          prev[0][4],
          prev[0][5],
        ],
        [
          finalRows[1][0],
          prev[1][1],
          prev[1][2],
          prev[1][3],
          prev[1][4],
          prev[1][5],
        ],
        [
          finalRows[2][0],
          prev[2][1],
          prev[2][2],
          prev[2][3],
          prev[2][4],
          prev[2][5],
        ],
        [
          finalRows[3][0],
          prev[3][1],
          prev[3][2],
          prev[3][3],
          prev[3][4],
          prev[3][5],
        ],
      ]);
    }, spinDuration);

    setTimeout(() => {
      playStopSound();
      setStoppingColumns([true, true, false, false, false, false]);
      setRows((prev) => [
        [
          prev[0][0],
          finalRows[0][1],
          prev[0][2],
          prev[0][3],
          prev[0][4],
          prev[0][5],
        ],
        [
          prev[1][0],
          finalRows[1][1],
          prev[1][2],
          prev[1][3],
          prev[1][4],
          prev[1][5],
        ],
        [
          prev[2][0],
          finalRows[2][1],
          prev[2][2],
          prev[2][3],
          prev[2][4],
          prev[2][5],
        ],
        [
          prev[3][0],
          finalRows[3][1],
          prev[3][2],
          prev[3][3],
          prev[3][4],
          prev[3][5],
        ],
      ]);
    }, spinDuration + 300);

    setTimeout(() => {
      playStopSound();
      setStoppingColumns([true, true, true, false, false, false]);
      setRows((prev) => [
        [
          prev[0][0],
          prev[0][1],
          finalRows[0][2],
          prev[0][3],
          prev[0][4],
          prev[0][5],
        ],
        [
          prev[1][0],
          prev[1][1],
          finalRows[1][2],
          prev[1][3],
          prev[1][4],
          prev[1][5],
        ],
        [
          prev[2][0],
          prev[2][1],
          finalRows[2][2],
          prev[2][3],
          prev[2][4],
          prev[2][5],
        ],
        [
          prev[3][0],
          prev[3][1],
          finalRows[3][2],
          prev[3][3],
          prev[3][4],
          prev[3][5],
        ],
      ]);
    }, spinDuration + 600);

    setTimeout(() => {
      playStopSound();
      setStoppingColumns([true, true, true, true, false, false]);
      setRows((prev) => [
        [
          prev[0][0],
          prev[0][1],
          prev[0][2],
          finalRows[0][3],
          prev[0][4],
          prev[0][5],
        ],
        [
          prev[1][0],
          prev[1][1],
          prev[1][2],
          finalRows[1][3],
          prev[1][4],
          prev[1][5],
        ],
        [
          prev[2][0],
          prev[2][1],
          prev[2][2],
          finalRows[2][3],
          prev[2][4],
          prev[2][5],
        ],
        [
          prev[3][0],
          prev[3][1],
          prev[3][2],
          finalRows[3][3],
          prev[3][4],
          prev[3][5],
        ],
      ]);
    }, spinDuration + 900);

    setTimeout(() => {
      playStopSound();
      setStoppingColumns([true, true, true, true, true, false]);
      setRows((prev) => [
        [
          prev[0][0],
          prev[0][1],
          prev[0][2],
          prev[0][3],
          finalRows[0][4],
          prev[0][5],
        ],
        [
          prev[1][0],
          prev[1][1],
          prev[1][2],
          prev[1][3],
          finalRows[1][4],
          prev[1][5],
        ],
        [
          prev[2][0],
          prev[2][1],
          prev[2][2],
          prev[2][3],
          finalRows[2][4],
          prev[2][5],
        ],
        [
          prev[3][0],
          prev[3][1],
          prev[3][2],
          prev[3][3],
          finalRows[3][4],
          prev[3][5],
        ],
      ]);
    }, spinDuration + 1200);

    setTimeout(() => {
      playStopSound();
      stopSpinSound();
      setStoppingColumns([true, true, true, true, true, true]);
      setRows(finalRows);

      setTimeout(() => {
        const middle = finalRows[1];
        const isWinner = middle.every((sym) => sym === middle[0]);

        setWinner(isWinner);
        setSpinning(false);

        if (isWinner) {
          playWinSound();
          setWinCount((prev) => {
            const newCount = prev + 1;
            if (newCount === 1) {
              setTimeout(() => setShowModal(true), 1000);
            }
            return newCount;
          });
        }
      }, 500);
    }, spinDuration + 1500);
  };

  // Increase bet and free spins
  const handleIncreaseBet = () => {
    setBet((prev) => prev + 50);
    setFreeSpins((prev) => prev + 5000);
  };

  // Decrease bet and free spins
  const handleDecreaseBet = () => {
    if (bet <= 50) return;
    setBet((prev) => prev - 50);
    setFreeSpins((prev) => Math.max(5000, prev - 5000));
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopSpinSound();
    }
  };

  return (
    <div className="SlotGame">
      <div className="SlotGame-container">
        <img className="goldenframe-img" src={goldenframe} alt="" />

        {/* Volume Control Button */}
        <button
          onClick={toggleMute}
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            background: "rgba(0, 0, 0, 0.7)",
            border: "2px solid gold",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 100,
            transition: "all 0.3s ease",
          }}
        >
          {isMuted ? (
            <span style={{ fontSize: "20px" }}>🔇</span>
          ) : (
            <span style={{ fontSize: "20px" }}>🔊</span>
          )}
        </button>

        <div className="jackpoint-box">
          <h3>
            <span>💥Total JACKPOT</span> <br /> Rp.{" "}
            {totalJackpot.toLocaleString()}.00
          </h3>
        </div>

        <div className="slot-game-main-box">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`slot-game-main-box-inner ${
                winner && i === 1 ? "winner" : ""
              }`}
            >
              {row.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="symbol"
                  className={
                    spinning && !stoppingColumns[index]
                      ? "spinning"
                      : stoppingColumns[index] && spinning
                      ? "stopping"
                      : ""
                  }
                />
              ))}
            </div>
          ))}
        </div>
        <h2 className="place-bet-text">Place Your Bet</h2>
        <div className="stats-box-main">
          <div className="stats-box1">
            <h3>
              BET <span>Rp {bet.toLocaleString()}</span>
            </h3>
            <h4>
              DOUBLE THE CHANCE <br />
              TO WIN THE FEATURE
            </h4>
          </div>
          <div className="stats-box2">
            <h6>BUY</h6>
            <h5>FREE SPINS</h5>
            <h3>Rp {freeSpins.toLocaleString()}</h3>
          </div>
        </div>
        <div className="slot-button-box">
          <button className="plus-button" onClick={handleDecreaseBet}>
            -
          </button>
          <button onClick={handleSpin} disabled={spinning}>
            <img src={spinlogo} alt="spin" />
          </button>
          <button className="plus-button" onClick={handleIncreaseBet}>
            +
          </button>
        </div>
      </div>
      {showModal && (
        <div className="jackpot-modal">
          <div className="jackpot-modal-content">
            <h2>💥 JACKPOT!</h2>
            <h3>🎉 PENDETEKSI SYSTEM BERHASIL 💰</h3>
            <p>
              🎲 Daftar dan Nikmati Akun Gacor di <span>TOTO12</span>
            </p>
            <p>🏦 Situs Resmi PG Soft</p>
            <div className="timer">
              <p>💬 Pastikan untuk Buat Akun Sebelum Waktu di bawah habis:</p>
              <h4>
                {String(timer.hours).padStart(2, "0")} JAM{" "}
                {String(timer.minutes).padStart(2, "0")} MENIT{" "}
                {String(timer.seconds).padStart(2, "0")} DETIK
              </h4>
            </div>
            <button className="cta-btn">👉 BUAT AKUN GACOR</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotGame;
