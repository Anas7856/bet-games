import React, { useState, useEffect, useRef } from "react";
import "./game.scss";
import s1 from "../../assets/imgi_3_zeus-11.png";
import s2 from "../../assets/Capture-removebg-preview (10).png";
import s3 from "../../assets/Capture-removebg-preview (11).png";
import s4 from "../../assets/imgi_3_zeus-10.png";
import s5 from "../../assets/Capture-removebg-preview (13).png";
import spinlogo from "../../assets/pngwing.com (5).png";
import goldenframe from "../../assets/floral-frame-with-gold-mandala-decoration.png";
import logo from "../../assets/logo.png";
import mainlogo from "../../assets/mainlogo.png";
import jackpotbg from "../../assets/658EwPiH.gif";
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

  // 🍞 Toast notification state
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // 🍞 Function to show toast
  const showToast = (message, type = "success") => {
    const id = toastIdRef.current++;
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

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
    }, 1000);

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

  // 🎰 Auto-increase total jackpot (no toast)
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

  // 🎰 Spin logic with toast - FIXED
  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(false);
    setShowModal(false);
    setStoppingColumns([false, false, false, false, false, false]);

    // ✅ Only allow winning for s1 or s4
    const winSymbols = [s1, s4];
    const isWin = Math.random() > 0.5; // 50% chance for a win (adjust as desired)

    let finalRows = [[], [], [], []];

    if (isWin) {
      // Pick only s1 or s4 as the winning symbol
      const winSymbol =
        winSymbols[Math.floor(Math.random() * winSymbols.length)];

      for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
        for (let colIndex = 0; colIndex < 6; colIndex++) {
          if (rowIndex === 1) {
            // Middle row - only s1 or s4
            finalRows[rowIndex][colIndex] = winSymbol;
          } else {
            // Random other symbols
            let randomSym;
            do {
              randomSym = randomSymbol();
            } while (winSymbols.includes(randomSym)); // Avoid s1/s4 on non-winning rows
            finalRows[rowIndex][colIndex] = randomSym;
          }
        }
      }
    } else {
      // No win - random symbols, exclude pure s1/s4 rows
      for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
        for (let colIndex = 0; colIndex < 6; colIndex++) {
          finalRows[rowIndex][colIndex] = randomSymbol();
        }
      }
    }

    // Stop each column one by one
    const stopDelays = [1500, 1800, 2000, 2500, 3000, 3500];

    stopDelays.forEach((delay, colIndex) => {
      setTimeout(() => {
        setStoppingColumns((prev) => {
          const updated = [...prev];
          updated[colIndex] = true;
          return updated;
        });

        setRows((prevRows) => {
          const newRows = prevRows.map((row) => [...row]);
          for (let rowIndex = 0; rowIndex < 4; rowIndex++) {
            newRows[rowIndex][colIndex] = finalRows[rowIndex][colIndex];
          }
          return newRows;
        });
      }, delay);
    });

    setTimeout(() => {
      setSpinning(false);
      const middle = finalRows[1];
      const isWinner =
        middle.every((sym) => sym === s1) || middle.every((sym) => sym === s4);

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
    }, stopDelays[stopDelays.length - 1] + 200);
  };

  // Bet controls with toast
  const handleIncreaseBet = () => {
    setBet((prev) => prev + 50);
    setFreeSpins((prev) => prev + 5000);
    showToast("📈 Bet +50 | Free Spins +5000", "increase");
  };

  const handleDecreaseBet = () => {
    if (bet <= 50) return;
    setBet((prev) => prev - 50);
    setFreeSpins((prev) => Math.max(5000, prev - 5000));
    showToast("📉 Bet -50 | Free Spins -5000", "decrease");
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
      {/* 🍞 Toast Container */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "90%",
          maxWidth: "350px",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              background:
                toast.type === "increase"
                  ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                  : "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
              padding: "12px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              color: "white",
              fontWeight: "bold",
              animation: "slideDown 0.3s ease-out",
              fontSize: "14px",
              textAlign: "center",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes slideDown {
            from {
              transform: translateY(-100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

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
        <img className="jackpotbg-img" src={jackpotbg} alt="" />
        <div className="jackpoint-box">
          <h3>Rp.{totalJackpot.toLocaleString()}.00</h3>
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
        <div className="slot-bottom-text-box">
          🚀Putar untuk Uji Coba Akun Gacor🚀
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
            <button className="cta-btn">
              <a href="https://toto12munchen.net/register?referral_code=member=Vipmaxwin">
                👉 BUAT AKUN GACOR
              </a>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotGame;
