import React, { useState, useEffect, useRef } from "react";
import "./game.scss";
import s1 from "../../assets/Capture-removebg-preview (9).png";
import s2 from "../../assets/Capture-removebg-preview (10).png";
import s3 from "../../assets/Capture-removebg-preview (11).png";
import s4 from "../../assets/Capture-removebg-preview (12).png";
import s5 from "../../assets/Capture-removebg-preview (13).png";
import spinlogo from "../../assets/pngwing.com (5).png";
import goldenframe from "../../assets/floral-frame-with-gold-mandala-decoration.png";
import logo from "../../assets/logo.png";
import mainlogo from "../../assets/mainlogo.png";

// 🎵 Single background sound
import backgroundSound from "../../assets/b.mp3";

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

  // 🎧 Background music ref
  const bgAudioRef = useRef(null);

  // 🎵 Initialize background sound and auto-play after delay
  useEffect(() => {
    bgAudioRef.current = new Audio(backgroundSound);
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.4;

    // Auto-play sound after 2 seconds
    const autoPlayTimer = setTimeout(() => {
      if (!isMuted && bgAudioRef.current) {
        bgAudioRef.current.play().catch((error) => {
          console.log(
            "Auto-play failed, will require user interaction:",
            error
          );
        });
      }
    }, 2000);

    // Fallback: if auto-play fails, enable on user interaction
    const startAudio = () => {
      if (!isMuted && bgAudioRef.current && bgAudioRef.current.paused) {
        bgAudioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("click", startAudio);
    document.addEventListener("touchstart", startAudio);

    return () => {
      clearTimeout(autoPlayTimer);
      document.removeEventListener("click", startAudio);
      document.removeEventListener("touchstart", startAudio);
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, [isMuted]);

  // 🎰 Auto-increase total jackpot
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalJackpot(
        (prev) => prev + Math.floor(Math.random() * 50000 + 1125000)
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // ⏱ Countdown timer
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

  // 🎰 Spin logic (no sound now)
  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(false);
    setShowModal(false);
    setStoppingColumns([false, false, false, false, false, false]);

    const spinDuration = 2500;
    const isWin = Math.random() > 0.3;
    let finalRows;

    if (isWin) {
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      finalRows = Array(4)
        .fill()
        .map(() => Array(6).fill(randomSymbol()));
      finalRows[1] = Array(6).fill(winSymbol);
    } else {
      finalRows = Array(4)
        .fill()
        .map(() => Array(6).fill(randomSymbol()));
    }

    const delays = [0, 300, 600, 900, 1200, 1500];
    delays.forEach((delay, i) => {
      setTimeout(() => {
        setStoppingColumns((prev) => {
          const updated = [...prev];
          updated[i] = true;
          return updated;
        });
      }, spinDuration + delay);
    });

    setTimeout(() => {
      setRows(finalRows);
      setSpinning(false);
      const middle = finalRows[1];
      const isWinner = middle.every((sym) => sym === middle[0]);
      setWinner(isWinner);

      if (isWinner) {
        setWinCount((prev) => {
          const newCount = prev + 1;
          if (newCount === 1) {
            setTimeout(() => setShowModal(true), 1000);
          }
          return newCount;
        });
      }
    }, spinDuration + 2000);
  };

  // Bet controls
  const handleIncreaseBet = () => {
    setBet((prev) => prev + 50);
    setFreeSpins((prev) => prev + 5000);
  };

  const handleDecreaseBet = () => {
    if (bet <= 50) return;
    setBet((prev) => prev - 50);
    setFreeSpins((prev) => Math.max(5000, prev - 5000));
  };

  // 🔇 Mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (bgAudioRef.current) {
      if (!isMuted) {
        bgAudioRef.current.pause();
      } else {
        bgAudioRef.current.play().catch(() => {});
      }
    }
  };

  return (
    <div className="SlotGame">
      <div className="SlotGame-container">
        {/* 🔊 Volume Control */}
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
          }}
        >
          {isMuted ? <span>🔇</span> : <span>🔊</span>}
        </button>

        <div className="jackpoint-box">
          <h3>
            <span>💥Total JACKPOT</span> <br /> Rp.{" "}
            {totalJackpot.toLocaleString()}.00
          </h3>
        </div>

        <div className="logo-box">
          <img src={logo} alt="" />
          <img className="main-logo" src={mainlogo} alt="" />
        </div>

        <div className="slot-game-main-box-container">
          <img className="goldenframe-img" src={goldenframe} alt="" />
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
